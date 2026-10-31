import { api } from "./client";
import type {
  ChatRequest,
  ChatResponse,
  ConversationHistory,
  ConversationSummary,
} from "@/types";

export async function sendChatMessage(
  message: string,
  conversationId: string | null,
) {
  const payload: ChatRequest = {
    message,
    conversation_id: conversationId,
  };
  const response = await api.post<ChatResponse>("/chat", payload);
  return response.data;
}

export async function fetchConversations() {
  const response =
    await api.get<ConversationSummary[]>("/chat/conversations");
  return response.data;
}

export async function fetchConversationHistory(conversationId: string) {
  const response = await api.get<ConversationHistory>(
    `/chat/history/${conversationId}`,
  );
  return response.data;
}
