import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VoiceMode } from "@/features/chat/VoiceMode";

describe("VoiceMode", () => {
  it("explains unsupported browsers and keeps the text-chat exit available", () => {
    const onClose = vi.fn();

    render(
      <VoiceMode
        open
        demo={false}
        onSend={async () => ({ ok: true, reply: "A sample reply." })}
        onClose={onClose}
      />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByText(/Speech recognition isn’t available in this browser/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Start voice input" }),
    ).toBeDisabled();

    fireEvent.click(
      screen.getAllByRole("button", { name: "End voice chat" })[0],
    );
    expect(onClose).toHaveBeenCalledWith(false);
  });
});
