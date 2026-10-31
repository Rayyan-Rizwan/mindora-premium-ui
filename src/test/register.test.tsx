import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RegisterPage from "@/features/auth/RegisterPage";
import { register } from "@/api/auth";

vi.mock("@/api/auth", () => ({
  register: vi.fn(),
}));

const registerMock = vi.mocked(register);

function renderRegister() {
  return render(
    <MemoryRouter initialEntries={["/register"]}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/check-email" element={<div>Check your email page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function fillForm({
  name = "Ayesha Khan",
  email = "ayesha@example.com",
  password = "longenough1",
  confirm = "longenough1",
}: {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
} = {}) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Full name"), name);
  await user.type(screen.getByLabelText("Email"), email);
  await user.type(screen.getByLabelText("Password"), password);
  await user.type(screen.getByLabelText("Confirm password"), confirm);
  return user;
}

describe("RegisterPage", () => {
  beforeEach(() => {
    registerMock.mockReset();
  });

  it("blocks submission until every field is filled", () => {
    renderRegister();

    const submit = screen.getByRole("button", { name: "Create account" });
    expect(submit).toBeDisabled();

    return fillForm().then(() => {
      expect(submit).toBeEnabled();
    });
  });

  it("shows local validation errors instead of calling the API", async () => {
    renderRegister();
    const user = await fillForm({ password: "short", confirm: "different" });

    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByText("Use at least 8 characters.")).toBeInTheDocument();
    expect(screen.getByText("Passwords don’t match.")).toBeInTheDocument();
    expect(registerMock).not.toHaveBeenCalled();
  });

  it("registers and moves to the check-email screen", async () => {
    registerMock.mockResolvedValue({});
    renderRegister();
    const user = await fillForm();

    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() =>
      expect(registerMock).toHaveBeenCalledWith({
        full_name: "Ayesha Khan",
        email: "ayesha@example.com",
        password: "longenough1",
      }),
    );
    expect(await screen.findByText("Check your email page")).toBeInTheDocument();
  });

  it("explains that an existing account must sign in", async () => {
    registerMock.mockRejectedValue({
      isAxiosError: true,
      response: { status: 409, data: { detail: "Email already registered" } },
    });
    renderRegister();
    const user = await fillForm();

    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(
      await screen.findByText(
        "An account already exists for that email. Try signing in.",
      ),
    ).toBeInTheDocument();
  });

  it("surfaces network failures without claiming the account was created", async () => {
    registerMock.mockRejectedValue({ isAxiosError: true });
    renderRegister();
    const user = await fillForm();

    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(
      await screen.findByText(/could not reach the Mindora service/i),
    ).toBeInTheDocument();
    expect(screen.queryByText("Check your email page")).toBeNull();
  });
});
