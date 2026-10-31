import { describe, expect, it, vi } from "vitest";
import {
  COMPANION_CHARACTERS,
  COMPANION_EVENT,
  getCompanionCharacter,
  getStoredCompanionId,
  resetCompanionCharacter,
  saveCompanionCharacter,
} from "@/lib/companion";

describe("companion preference", () => {
  it("defaults to Lumi when nothing is stored", () => {
    expect(getStoredCompanionId()).toBeNull();
    expect(getCompanionCharacter().id).toBe("lumi");
    expect(COMPANION_CHARACTERS).toHaveLength(3);
  });

  it("ignores an unknown stored value", () => {
    localStorage.setItem("mindora_companion", "unknown");
    expect(getStoredCompanionId()).toBeNull();
    expect(getCompanionCharacter().id).toBe("lumi");
  });

  it("saves a character, persists it, and announces the change", () => {
    const listener = vi.fn();
    window.addEventListener(COMPANION_EVENT, listener);

    saveCompanionCharacter("momo");

    expect(localStorage.getItem("mindora_companion")).toBe("momo");
    expect(getCompanionCharacter().name).toBe("Momo");
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(COMPANION_EVENT, listener);
  });

  it("resets to Lumi and clears the stored value", () => {
    saveCompanionCharacter("pip");
    const listener = vi.fn();
    window.addEventListener(COMPANION_EVENT, listener);

    resetCompanionCharacter();

    expect(localStorage.getItem("mindora_companion")).toBeNull();
    expect(getCompanionCharacter().id).toBe("lumi");
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(COMPANION_EVENT, listener);
  });
});
