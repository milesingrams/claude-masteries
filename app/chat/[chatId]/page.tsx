"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useChat } from "ai/react";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { MessageList } from "@/components/chat/message-list";
import { MessageInput } from "@/components/chat/message-input";
import { useChatContext } from "@/lib/chat-context";
import { saveChat } from "@/lib/chat-storage";
import type { Message } from "@/lib/types";

export default function ChatPage() {
  const params = useParams();
  const chatId = params.chatId as string;
  const { getChat, updateChat } = useChatContext();

  const chat = getChat(chatId);

  const { messages, append, isLoading } = useChat({
    api: "/api/chat",
    id: chatId,
    initialMessages: chat?.messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
    })),
    onError: (err) => {
      console.error("Chat error:", err);
      toast.error("Failed to send message. Please try again.");
    },
  });

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0 && chat) {
      const updatedMessages: Message[] = messages.map((msg) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        createdAt: new Date(),
      }));

      updateChat(chatId, { messages: updatedMessages });
    }
  }, [messages, chatId, chat, updateChat]);

  // Generate title after first exchange
  useEffect(() => {
    const generateTitle = async () => {
      if (
        messages.length === 2 &&
        chat?.title === "New Chat" &&
        messages[0].role === "user" &&
        messages[1].role === "assistant"
      ) {
        try {
          const response = await fetch("/api/generate-title", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              firstUserMessage: messages[0].content,
              firstAssistantMessage: messages[1].content,
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
  }, [messages, chat, chatId, updateChat]);

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Chat not found</p>
      </div>
    );
  }

  const handleMessageSubmit = async (message: string) => {
    await append({
      role: "user",
      content: message,
    });
  };

  return (
    <div className="flex flex-1 flex-col h-full">
      <MessageList
        messages={messages.map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: msg.content,
          createdAt: new Date(),
        }))}
        isLoading={isLoading}
      />
      <MessageInput
        onSubmit={handleMessageSubmit}
        disabled={isLoading}
      />
    </div>
  );
}
