import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ChatPage from "@/features/chat/ChatPage";
import {
  fetchConversationHistory,
  fetchConversations,
  sendChatMessage,
} from "@/api/chat";
import type { ChatResponse } from "@/types";

// Mocks keep this suite offline: no request ever leaves the test process.
vi.mock("@/api/chat", () => ({
  fetchConversations: vi.fn(),
  fetchConversationHistory: vi.fn(),
  sendChatMessage: vi.fn(),
}));

const conversationsMock = vi.mocked(fetchConversations);
const historyMock = vi.mocked(fetchConversationHistory);
const sendMock = vi.mocked(sendChatMessage);

const reply: ChatResponse = {
  conversation_id: "conv-1",
  user_message: {
    id: "message-1",
    sender: "user",
    content: "I feel overwhelmed",
    created_at: "2026-10-28T09:00:00",
  },
  ai_response: {
    id: "message-2",
    sender: "ai",
    content: "Take a slow breath with me.",
    created_at: "2026-10-28T09:00:05",
  },
};

function renderChat() {
  return render(
    <MemoryRouter initialEntries={["/chat"]}>
      <ChatPage />
    </MemoryRouter>,
  );
}

describe("ChatPage", () => {
  beforeEach(() => {
    conversationsMock.mockResolvedValue([]);
    historyMock.mockReset();
    sendMock.mockReset();
  });

  it("shows the welcome state when there are no conversations", async () => {
    renderChat();

    expect(
      await screen.findByText("What’s on your mind today?"),
    ).toBeInTheDocument();
    expect(conversationsMock).toHaveBeenCalledTimes(1);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("marks a failed message as not sent and lets the user retry", async () => {
    sendMock
      .mockRejectedValueOnce(new Error("Network down"))
      .mockResolvedValueOnce(reply);

    const user = userEvent.setup();
    renderChat();
    await screen.findByText("What’s on your mind today?");

    await user.type(
      screen.getByPlaceholderText("Share what’s on your mind…"),
      "I feel overwhelmed",
    );
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("Not sent")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Network down");
    expect(sendMock).toHaveBeenCalledWith("I feel overwhelmed", null);

    await user.click(screen.getAllByRole("button", { name: "Retry" })[0]);

    expect(
      await screen.findByText("Take a slow breath with me."),
    ).toBeInTheDocument();
    await waitFor(() => expect(sendMock).toHaveBeenCalledTimes(2));
    expect(screen.queryByText("Not sent")).toBeNull();
  });

  it("does not send an empty or whitespace-only message", async () => {
    const user = userEvent.setup();
    renderChat();
    await screen.findByText("What’s on your mind today?");

    await user.type(
      screen.getByPlaceholderText("Share what’s on your mind…"),
      "   ",
    );

    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
    expect(sendMock).not.toHaveBeenCalled();
  });
});
