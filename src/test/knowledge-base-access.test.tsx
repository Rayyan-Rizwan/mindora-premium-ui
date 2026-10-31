import { render, screen, waitFor } from "@testing-library/react";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import App from "@/app/App";
import { setDemoRole } from "@/demo/demoSession";
import { installDemoMode } from "@/demo/install";

const KNOWLEDGE_PATHS = ["/library", "/admin/knowledge-base"];
const KNOWLEDGE_LINK = /knowledge/i;

function renderAt(path: string) {
  window.history.replaceState({}, "", path);
  return render(<App />);
}

async function expectPath(path: string) {
  await waitFor(() => expect(window.location.pathname).toBe(path));
}

beforeAll(() => {
  installDemoMode();
});

beforeEach(() => {
  localStorage.clear();
  setDemoRole(null);
});

afterAll(() => {
  setDemoRole(null);
});

describe("Knowledge Base access", () => {
  it("lets an admin open the Knowledge Base from the admin and legacy URLs", async () => {
    setDemoRole("admin");

    for (const path of KNOWLEDGE_PATHS) {
      const view = renderAt(path);

      await expectPath("/admin/knowledge-base");
      expect(
        await screen.findByRole(
          "heading",
          { name: "Knowledge Base" },
          { timeout: 5000 },
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "Knowledge Base" }),
      ).toBeInTheDocument();

      view.unmount();
    }
  });

  it("redirects members to the dashboard and hides every Knowledge Base link", async () => {
    setDemoRole("user");

    for (const path of KNOWLEDGE_PATHS) {
      const view = renderAt(path);

      await expectPath("/dashboard");
      expect(await screen.findByText("Your space")).toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: KNOWLEDGE_LINK }),
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/knowledge base/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/knowledge library/i)).not.toBeInTheDocument();

      view.unmount();
    }
  });

  it("redirects professionals to appointments and hides every Knowledge Base link", async () => {
    setDemoRole("professional");

    for (const path of KNOWLEDGE_PATHS) {
      const view = renderAt(path);

      await expectPath("/appointments");
      expect(await screen.findByText("Practice")).toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: KNOWLEDGE_LINK }),
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/knowledge base/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/knowledge library/i)).not.toBeInTheDocument();

      view.unmount();
    }
  });

  it("sends logged-out visitors to login without rendering the feature", async () => {
    for (const path of KNOWLEDGE_PATHS) {
      const view = renderAt(path);

      await expectPath("/login");
      expect(
        await screen.findByRole(
          "heading",
          { name: "Welcome Back" },
          { timeout: 5000 },
        ),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("navigation", { name: "Primary" }),
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/knowledge base/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/knowledge library/i)).not.toBeInTheDocument();

      view.unmount();
    }
  });
});
