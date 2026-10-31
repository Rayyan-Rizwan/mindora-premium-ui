import { render, screen } from "@testing-library/react";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import App from "@/app/App";
import { setDemoRole } from "@/demo/demoSession";
import { installDemoMode } from "@/demo/install";

const LISTEN_PATHS = ["/listen", "/relax/player"];

function renderAt(path: string) {
  window.history.replaceState({}, "", path);
  return render(<App />);
}

beforeAll(() => {
  installDemoMode();
});

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  setDemoRole(null);
  setDemoRole("user");
});

afterAll(() => {
  setDemoRole(null);
});

describe("Relax and Listen routes", () => {
  it("serves the Listen page from /listen and the legacy /relax/player URL", async () => {
    for (const path of LISTEN_PATHS) {
      const view = renderAt(`${path}?track=ocean-waves`);

      expect(
        await screen.findByRole(
          "heading",
          { name: "Listen" },
          { timeout: 5000 },
        ),
      ).toBeInTheDocument();
      expect(window.location.pathname).toBe(path);
      expect(
        screen.getAllByText("Ocean Waves").length,
      ).toBeGreaterThan(0);

      view.unmount();
    }
  });

  it("lists Relax and Listen as separate member destinations", async () => {
    const view = renderAt("/listen");

    await screen.findByRole(
      "heading",
      { name: "Listen" },
      { timeout: 5000 },
    );

    const relaxLinks = screen.getAllByRole("link", { name: "Relax" });
    const listenLinks = screen.getAllByRole("link", { name: "Listen" });
    expect(relaxLinks.length).toBeGreaterThan(0);
    expect(listenLinks.length).toBeGreaterThan(0);
    relaxLinks.forEach((link) =>
      expect(link).toHaveAttribute("href", "/relax"),
    );
    listenLinks.forEach((link) =>
      expect(link).toHaveAttribute("href", "/listen"),
    );

    view.unmount();
  });
});
