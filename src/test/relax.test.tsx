import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import RelaxPage from "@/features/relax/RelaxPage";
import MindfulSoundsPage from "@/features/relax/MindfulSoundsPage";
import { RelaxPlayerProvider } from "@/features/relax/player";

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/relax"]}>
      <RelaxPage />
    </MemoryRouter>,
  );
}

function renderListen(entry = "/listen") {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <RelaxPlayerProvider>
        <MindfulSoundsPage />
      </RelaxPlayerProvider>
    </MemoryRouter>,
  );
}

describe("RelaxPage", () => {
  it("renders breathing and movement sessions with the care disclaimer", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "Relax" })).toBeInTheDocument();
    expect(screen.getByText("Deep Breathing")).toBeInTheDocument();
    expect(screen.getByText("Box Breathing")).toBeInTheDocument();
    expect(screen.getByText("Ocean Waves")).toBeInTheDocument();
    expect(screen.getByText(/not a treatment for any/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Breathe with the circle" }),
    ).toBeInTheDocument();
  });

  it("runs a timed breathing session that can be paused and ended", () => {
    vi.useFakeTimers();
    try {
      renderPage();

      expect(
        screen.getByRole("heading", { name: "Breathe with the circle" }),
      ).toBeInTheDocument();
      fireEvent.click(
        screen.getByRole("button", { name: "Start breathing" }),
      );
      expect(
        screen.getByRole("button", { name: "Pause" }),
      ).toBeInTheDocument();
      expect(screen.getByText("Breathe in")).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1300);
      });
      expect(screen.getByText("3s")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Pause" }));
      expect(
        screen.getByRole("button", { name: "Resume" }),
      ).toBeInTheDocument();
      const frozen = screen.getByText("3s").textContent;
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(screen.getByText("3s")).toHaveTextContent(frozen ?? "");

      fireEvent.click(screen.getByRole("button", { name: "End" }));
      expect(
        screen.getByRole("button", { name: "Start breathing" }),
      ).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("marks a completed breathing session", () => {
    vi.useFakeTimers();
    try {
      renderPage();

      fireEvent.click(screen.getByRole("button", { name: "1 minute" }));
      fireEvent.click(
        screen.getByRole("button", { name: "Start breathing" }),
      );
      act(() => {
        vi.advanceTimersByTime(60_000);
      });

      expect(
        screen.getByRole("button", { name: "Breathe again" }),
      ).toBeInTheDocument();
      expect(screen.getByText(/Session complete/i)).toBeInTheDocument();
      expect(screen.getAllByText("Complete").length).toBeGreaterThan(0);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("MindfulSoundsPage", () => {
  it("shows the generated library with non-playable placeholders when Web Audio is unavailable", () => {
    renderListen();

    expect(screen.getByRole("heading", { name: "Listen" })).toBeInTheDocument();
    expect(screen.getByText("Linen Light")).toBeInTheDocument();
    expect(screen.getByText("Quiet Harbour")).toBeInTheDocument();
    expect(
      screen.getByText(/non-playable in this browser/i),
    ).toBeInTheDocument();

    const unavailable = screen.getAllByRole("button", {
      name: "Audio unavailable",
    });
    expect(unavailable).toHaveLength(9);
    unavailable.forEach((button) => expect(button).toBeDisabled());
  });

  it("selects the track named in the query string", () => {
    renderListen("/listen?track=morning-calm");

    expect(
      screen.getAllByText("Morning Calm").length,
    ).toBeGreaterThan(0);
  });
});
