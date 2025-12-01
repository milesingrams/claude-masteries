"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { toast } from "sonner";
import { ChatHeader } from "@/components/chat/chat-header";
import { MessageList } from "@/components/chat/messages/message-list";
import { PromptInput } from "@/components/chat/prompt/prompt-input";
import { useChatContext } from "@/lib/chats/chat-context";
import type { Message } from "@/lib/types";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.chatId as string;
  const { getChat, updateChat, deleteChat } = useChatContext();

  const chat = getChat(chatId);
  const hasLoadedInitialMessages = useRef(false);
  const hasSentPendingMessage = useRef(false);
  const hasGeneratedTitle = useRef(false);

  const { messages, sendMessage, status, setMessages } = useChat({
    id: chatId,
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    onError: (err: Error) => {
      console.error("Chat error:", err);
      toast.error("Failed to send message. Please try again.");
    },
  });

  // Load initial messages from chat only once
  useEffect(() => {
    if (
      !hasLoadedInitialMessages.current &&
      chat?.messages &&
      chat.messages.length > 0
    ) {
      hasLoadedInitialMessages.current = true;

      // Check if there's a pending user message (no assistant response yet)
      const hasPendingUserMessage =
        chat.messages.length === 1 &&
        chat.messages[0].role === "user" &&
        !chat.messages.some((m) => m.role === "assistant");

      if (hasPendingUserMessage && !hasSentPendingMessage.current) {
        // Don't load messages into state - let sendMessage handle it
        hasSentPendingMessage.current = true;
        sendMessage({ text: chat.messages[0].content });
      } else {
        // Load existing conversation (has assistant responses)
        // If it already has a proper title, mark title as generated
        if (chat.title && chat.title !== "New Chat") {
          hasGeneratedTitle.current = true;
        }
        setMessages(
          chat.messages.map((msg) => ({
            id: msg.id,
            role: msg.role,
            parts: [{ type: "text" as const, text: msg.content }],
          }))
        );
      }
    }
  }, [chat?.messages, chat?.title, setMessages, sendMessage]);

  const isLoading = status === "submitted" || status === "streaming";

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      const updatedMessages: Message[] = messages.map((msg) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content:
          msg.parts
            .filter((part) => part.type === "text")
            .map((part) => part.text)
            .join("") || "",
        createdAt: new Date(),
      }));

      updateChat(chatId, { messages: updatedMessages });
    }
  }, [messages, chatId, updateChat]);

  // Generate title after first exchange (only once)
  useEffect(() => {
    // Skip if already generating or generated, or not ready yet
    if (hasGeneratedTitle.current) return;
    if (status !== "ready") return;
    if (messages.length !== 2) return;
    if (messages[0].role !== "user" || messages[1].role !== "assistant") return;

    const currentChat = getChat(chatId);
    if (!currentChat || currentChat.title !== "New Chat") return;

    // Mark as generating to prevent duplicate calls
    hasGeneratedTitle.current = true;

    const generateTitle = async () => {
      try {
        const firstUserMessage =
          messages[0].parts
            .filter((part) => part.type === "text")
            .map((part) => part.text)
            .join("") || "";
        const firstAssistantMessage =
          messages[1].parts
            .filter((part) => part.type === "text")
            .map((part) => part.text)
            .join("") || "";

        const response = await fetch("/api/generate-title", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstUserMessage,
            firstAssistantMessage,
          }),
        });

        if (response.ok) {
          const { title } = await response.json();
          updateChat(chatId, { title });
        }
      } catch (err) {
        console.error("Failed to generate title:", err);
        // Reset flag on error so it can be retried
        hasGeneratedTitle.current = false;
      }
    };

    generateTitle();
  }, [messages, status, chatId, getChat, updateChat]);

  if (!chat) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Chat not found</p>
      </div>
    );
  }

  const handlePromptSubmit = (prompt: string) => {
    sendMessage({ text: prompt });
  };

  const handleDeleteChat = () => {
    deleteChat(chatId);
    router.push("/new");
    toast.success("Chat deleted");
  };

  return (
    <div className="relative h-full flex-1">
      {/* Scrollable content area - absolute to ensure proper height */}
      <div className="absolute inset-0 overflow-y-auto">
        <ChatHeader title={chat.title} onDelete={handleDeleteChat} />
        <MessageList
          messages={messages.map((msg) => ({
            id: msg.id,
            role: msg.role as "user" | "assistant",
            content:
              msg.parts
                .filter((part) => part.type === "text")
                .map((part) => part.text)
                .join("") || "",
            createdAt: new Date(),
          }))}
          isLoading={isLoading}
        />
      </div>
      {/* Floating input at bottom */}
      <PromptInput
        onPromptSubmit={handlePromptSubmit}
        disabled={status !== "ready"}
      />
    </div>
  );
}
