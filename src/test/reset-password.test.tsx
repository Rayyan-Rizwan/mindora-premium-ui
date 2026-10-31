import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import ResetPasswordPage from "@/features/auth/ResetPasswordPage";
import { resetPassword } from "@/api/auth";

vi.mock("@/api/auth", () => ({
  resetPassword: vi.fn(),
}));

const resetMock = vi.mocked(resetPassword);

function renderReset(path = "/reset-password?token=token-123") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ResetPasswordPage", () => {
  it("asks for a fresh link when the token is missing", () => {
    renderReset("/reset-password");

    expect(
      screen.getByText(/reset link is missing its token/i),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("New password")).toBeNull();
  });

  it("validates password length and confirmation before calling the API", async () => {
    const user = userEvent.setup();
    renderReset();

    await user.type(screen.getByLabelText("New password"), "short");
    await user.type(screen.getByLabelText("Confirm new password"), "short");
    await user.click(screen.getByRole("button", { name: "Update password" }));
    expect(screen.getByText("Use at least 8 characters.")).toBeInTheDocument();

    await user.clear(screen.getByLabelText("New password"));
    await user.type(screen.getByLabelText("New password"), "longenough1");
    await user.clear(screen.getByLabelText("Confirm new password"));
    await user.type(screen.getByLabelText("Confirm new password"), "longenough2");
    await user.click(screen.getByRole("button", { name: "Update password" }));
    expect(screen.getByText("Passwords don’t match.")).toBeInTheDocument();

    expect(resetMock).not.toHaveBeenCalled();
  });

  it("submits the token and shows a success state", async () => {
    resetMock.mockResolvedValue({ message: "Password updated" });
    const user = userEvent.setup();
    renderReset();

    await user.type(screen.getByLabelText("New password"), "longenough1");
    await user.type(screen.getByLabelText("Confirm new password"), "longenough1");
    await user.click(screen.getByRole("button", { name: "Update password" }));

    await waitFor(() =>
      expect(resetMock).toHaveBeenCalledWith("token-123", "longenough1"),
    );
    expect(
      await screen.findByText(/your password has been updated/i),
    ).toBeInTheDocument();
  });

  it("reports an expired or invalid reset link", async () => {
    resetMock.mockRejectedValue({
      isAxiosError: true,
      response: { status: 400, data: { detail: "Invalid or expired token" } },
    });
    const user = userEvent.setup();
    renderReset();

    await user.type(screen.getByLabelText("New password"), "longenough1");
    await user.type(screen.getByLabelText("Confirm new password"), "longenough1");
    await user.click(screen.getByRole("button", { name: "Update password" }));

    expect(
      await screen.findByText("Invalid or expired token"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/your password has been updated/i)).toBeNull();
  });
});
