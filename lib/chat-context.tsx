"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { nanoid } from "nanoid";
import type { Chat } from "./types";
import {
  getAllChats,
  saveChat,
  deleteChat as deleteStorageChat,
} from "./chat-storage";

interface ChatContextType {
  chats: Chat[];
  isLoaded: boolean;
  createChat: (firstMessage: string) => string;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  deleteChat: (chatId: string) => void;
  getChat: (chatId: string) => Chat | undefined;
  refreshChats: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  // Initialize with empty array to avoid hydration mismatch
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load chats from localStorage after mount (client-side only)
  useEffect(() => {
    const loadedChats = getAllChats();
    setChats(loadedChats);
    setIsLoaded(true);
  }, []);

  const refreshChats = useCallback(() => {
    const loadedChats = getAllChats();
    setChats(loadedChats);
  }, []);

  const createChat = useCallback((firstMessage: string): string => {
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
  }, []);

  const updateChat = useCallback((chatId: string, updates: Partial<Chat>) => {
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
  }, []);

  const deleteChat = useCallback((chatId: string) => {
    deleteStorageChat(chatId);
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
  }, []);

  const getChat = useCallback(
    (chatId: string) => {
      return chats.find((chat) => chat.id === chatId);
    },
    [chats]
  );

  return (
    <ChatContext.Provider
      value={{
        chats,
        isLoaded,
        createChat,
        updateChat,
        deleteChat,
        getChat,
        refreshChats,
      }}
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
