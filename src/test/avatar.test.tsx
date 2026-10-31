import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { CompanionAvatar } from "@/components/avatar/CompanionAvatar";
import { CompanionMini } from "@/components/avatar/CompanionMini";
import { getCompanionCharacter, saveCompanionCharacter } from "@/lib/companion";

describe("CompanionAvatar", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the canonical illustrated companion", () => {
    const { container } = render(<CompanionAvatar state="idle" />);

    expect(
      screen.getByRole("img", { name: /Lumi, the Mindora companion/i }),
    ).toBeInTheDocument();
    expect(container.querySelector(".companion-art")).not.toBeNull();
    expect(container.querySelector(".companion-art__accessory--sprout")).not.toBeNull();
    expect(container.querySelectorAll(".companion-art__eyes circle")).toHaveLength(6);
  });

  it("uses one drawing for every size", () => {
    const sizes = ["sm", "md", "lg", "hero"] as const;
    const viewBoxes = sizes.map((size) => {
      const { container, unmount } = render(
        <CompanionAvatar state="idle" size={size} />,
      );
      const svg = container.querySelector("svg");
      const head = container.querySelector(".companion-art__head path");
      const box = svg?.getAttribute("viewBox");
      const headPath = head?.getAttribute("d");
      unmount();
      return { box, headPath };
    });

    expect(new Set(viewBoxes.map((entry) => entry.box)).size).toBe(1);
    expect(new Set(viewBoxes.map((entry) => entry.headPath)).size).toBe(1);
  });

  it("announces the current companion state", () => {
    render(<CompanionAvatar state="error" />);

    expect(
      screen.getByRole("img", {
        name: /Lumi is quiet while the connection recovers/i,
      }),
    ).toBeInTheDocument();
  });

  it("renders the saved character and its accessory", () => {
    localStorage.setItem("mindora_companion", "momo");

    const { container } = render(<CompanionAvatar state="idle" />);

    expect(
      screen.getByRole("img", { name: /Momo, the Mindora companion/i }),
    ).toBeInTheDocument();
    expect(
      container.querySelector(".companion-art__accessory--ears"),
    ).not.toBeNull();
    expect(
      container.querySelector(".companion-art__accessory--sprout"),
    ).toBeNull();
  });

  it("ignores an unknown saved character", () => {
    localStorage.setItem("mindora_companion", "not-a-character");

    const { container } = render(<CompanionAvatar state="idle" />);

    expect(
      screen.getByRole("img", { name: /Lumi, the Mindora companion/i }),
    ).toBeInTheDocument();
    expect(
      container.querySelector(".companion-art__accessory--sprout"),
    ).not.toBeNull();
  });

  it("switches immediately when another surface saves a character", () => {
    const { container } = render(<CompanionAvatar state="idle" />);

    act(() => saveCompanionCharacter("pip"));

    expect(
      screen.getByRole("img", { name: /Pip, the Mindora companion/i }),
    ).toBeInTheDocument();
    expect(
      container.querySelector(".companion-art__accessory--star"),
    ).not.toBeNull();
  });

  it("renders the same face in the chat mini and the large avatar", () => {
    const { container } = render(
      <CompanionMini
        character={getCompanionCharacter("lumi")}
        state="responding"
      />,
    );

    expect(container.querySelector(".companion-mini svg")).not.toBeNull();
    expect(
      container.querySelectorAll(".companion-art__eyes circle"),
    ).toHaveLength(6);
    expect(
      container.querySelector(".companion-art__accessory--sprout"),
    ).not.toBeNull();
  });
});
