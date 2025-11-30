"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { nanoid } from "nanoid";
import type { Chat, Message } from "./types";
import { getAllChats, saveChat, deleteChat as deleteStorageChat } from "./chat-storage";

interface ChatContextType {
  chats: Chat[];
  createChat: (firstMessage: string) => string;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  deleteChat: (chatId: string) => void;
  getChat: (chatId: string) => Chat | undefined;
  refreshChats: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);

  // Load chats from localStorage on mount
  useEffect(() => {
    const loadedChats = getAllChats();
    setChats(loadedChats);
  }, []);

  const refreshChats = () => {
    const loadedChats = getAllChats();
    setChats(loadedChats);
  };

  const createChat = (firstMessage: string): string => {
    const chatId = nanoid();
    const now = new Date();

    const newChat: Chat = {
      id: chatId,
      title: "New Chat", // Will be updated after first response
      messages: [
        {
          id: nanoid(),
          role: "user",
          content: firstMessage,
          createdAt: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    saveChat(newChat);
    setChats((prev) => [newChat, ...prev]);

    return chatId;
  };

  const updateChat = (chatId: string, updates: Partial<Chat>) => {
    setChats((prev) => {
      const updated = prev.map((chat) =>
        chat.id === chatId
          ? { ...chat, ...updates, updatedAt: new Date() }
          : chat
      );

      // Save to localStorage
      const chatToSave = updated.find((c) => c.id === chatId);
      if (chatToSave) {
        saveChat(chatToSave);
      }

      return updated;
    });
  };

  const deleteChat = (chatId: string) => {
    deleteStorageChat(chatId);
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
  };

  const getChat = (chatId: string) => {
    return chats.find((chat) => chat.id === chatId);
  };

  return (
    <ChatContext.Provider
      value={{ chats, createChat, updateChat, deleteChat, getChat, refreshChats }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
