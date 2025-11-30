"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { toast } from "sonner";
import { MessageList } from "@/components/chat/message-list";
import { MessageInput } from "@/components/chat/message-input";
import { useChatContext } from "@/lib/chat-context";
import type { Message } from "@/lib/types";

export default function ChatPage() {
  const params = useParams();
  const chatId = params.chatId as string;
  const { getChat, updateChat } = useChatContext();

  const chat = getChat(chatId);
  const hasLoadedInitialMessages = useRef(false);

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
    if (!hasLoadedInitialMessages.current && chat?.messages && chat.messages.length > 0) {
      hasLoadedInitialMessages.current = true;
      setMessages(
        chat.messages.map((msg) => ({
          id: msg.id,
          role: msg.role,
          parts: [{ type: "text" as const, text: msg.content }],
        }))
      );
    }
  }, [chat?.messages, setMessages]);

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

  // Generate title after first exchange
  useEffect(() => {
    const generateTitle = async () => {
      const currentChat = getChat(chatId);
      if (
        messages.length === 2 &&
        currentChat?.title === "New Chat" &&
        messages[0].role === "user" &&
        messages[1].role === "assistant"
      ) {
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
        }
      }
    };

    generateTitle();
  }, [messages, chatId, getChat, updateChat]);

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Chat not found</p>
      </div>
    );
  }

  const handleMessageSubmit = async (message: string) => {
    sendMessage({ text: message });
  };

  return (
    <div className="flex flex-1 flex-col h-full">
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
      <MessageInput
        onSubmit={handleMessageSubmit}
        disabled={status !== "ready"}
      />
    </div>
  );
}
