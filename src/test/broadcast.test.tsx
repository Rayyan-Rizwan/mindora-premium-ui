import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AxiosError, AxiosHeaders } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminBroadcastPage from "@/features/admin/AdminBroadcastPage";
import { previewBroadcast, sendBroadcast } from "@/api/admin";
import { fetchUsers } from "@/api/users";
import type { User } from "@/types";

vi.mock("@/api/admin", () => ({
  previewBroadcast: vi.fn(),
  sendBroadcast: vi.fn(),
}));

vi.mock("@/api/users", () => ({
  fetchUsers: vi.fn(),
}));

vi.mock("@/demo/demoSession", () => ({
  isDemoActive: () => false,
}));

const USERS: User[] = [
  {
    id: "u1",
    email: "member@example.com",
    full_name: "Member One",
    role: "user",
    is_verified: true,
    is_active: true,
    is_protected: false,
    created_at: "2026-01-01T00:00:00",
    profile: null,
  },
  {
    id: "u2",
    email: "clinician@example.com",
    full_name: "Clinician Two",
    role: "professional",
    is_verified: true,
    is_active: true,
    is_protected: false,
    created_at: "2026-01-02T00:00:00",
    profile: null,
  },
];

const PREVIEW = {
  recipient_mode: "all" as const,
  role: null,
  total_recipients: 3,
  by_role: { user: 3 },
  requested_ids: null,
  inactive_or_unknown_ids: 0,
};

const RESULT = {
  title: "Small pause",
  recipient_mode: "all" as const,
  role: null,
  recipients_targeted: 3,
  notifications_created: 3,
  forced: false,
  channel: "in_app",
};

function conflictError() {
  const response = {
    data: { detail: "An identical notification was delivered recently." },
    status: 409,
    statusText: "Conflict",
    headers: new AxiosHeaders(),
    config: {},
  };
  return new AxiosError(
    "Conflict",
    "ERR_BAD_REQUEST",
    undefined,
    null,
    response as never,
  );
}

async function fillAndPreview() {
  fireEvent.change(screen.getByLabelText("Title"), {
    target: { value: "Small pause" },
  });
  fireEvent.change(screen.getByLabelText("Message"), {
    target: { value: "Take one slow breath before the next task." },
  });
  fireEvent.click(screen.getByRole("button", { name: "Preview recipients" }));
  await waitFor(() => expect(previewBroadcast).toHaveBeenCalledTimes(1));
  await screen.findByText("3");
}

describe("AdminBroadcastPage", () => {
  beforeEach(() => {
    vi.mocked(fetchUsers).mockResolvedValue(USERS);
    vi.mocked(previewBroadcast).mockReset();
    vi.mocked(sendBroadcast).mockReset();
  });

  it("previews the server count and confirms before delivery", async () => {
    vi.mocked(previewBroadcast).mockResolvedValue(PREVIEW);
    vi.mocked(sendBroadcast).mockResolvedValue(RESULT);

    render(<AdminBroadcastPage />);
    await waitFor(() => expect(fetchUsers).toHaveBeenCalledTimes(1));
    expect(
      screen.getByRole("heading", { name: "Broadcast notifications" }),
    ).toBeInTheDocument();

    await fillAndPreview();
    expect(screen.getByText(/Members:/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Review & send" }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Confirm notification")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Send now" }));
    await waitFor(() => expect(sendBroadcast).toHaveBeenCalledTimes(1));
    expect(
      await screen.findByText(/Delivered to the in-app inbox/i),
    ).toBeInTheDocument();
  });

  it("offers an explicit override when the server reports a recent duplicate", async () => {
    vi.mocked(previewBroadcast).mockResolvedValue(PREVIEW);
    vi.mocked(sendBroadcast)
      .mockRejectedValueOnce(conflictError())
      .mockResolvedValueOnce({ ...RESULT, forced: true });

    render(<AdminBroadcastPage />);
    await waitFor(() => expect(fetchUsers).toHaveBeenCalledTimes(1));
    await fillAndPreview();
    fireEvent.click(screen.getByRole("button", { name: "Review & send" }));
    await screen.findByRole("dialog");
    fireEvent.click(screen.getByRole("button", { name: "Send now" }));
    expect(
      await screen.findByText(/identical notification/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Send anyway" }));
    await waitFor(() => expect(sendBroadcast).toHaveBeenCalledTimes(2));
    expect(vi.mocked(sendBroadcast).mock.calls[1][0]).toMatchObject({
      force: true,
    });
    expect(
      await screen.findByText(/Delivered to the in-app inbox/i),
    ).toBeInTheDocument();
  });
});
