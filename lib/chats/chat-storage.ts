import type { Chat } from "../types";

const STORAGE_KEY = "claude-chats";

/**
 * Get all chats from localStorage
 */
export function getAllChats(): Chat[] {
  try {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const chats = JSON.parse(stored);
    // Parse dates back to Date objects
    return chats.map((chat: Chat) => ({
      ...chat,
      createdAt: new Date(chat.createdAt),
      updatedAt: new Date(chat.updatedAt),
      messages: chat.messages.map((msg) => ({
        ...msg,
        createdAt: new Date(msg.createdAt),
      })),
    }));
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return [];
  }
}

/**
 * Get a specific chat by ID
 */
export function getChat(chatId: string): Chat | null {
  const chats = getAllChats();
  return chats.find((chat) => chat.id === chatId) || null;
}

/**
 * Save a chat to localStorage
 */
export function saveChat(chat: Chat): void {
  try {
    if (typeof window === "undefined") return;

    const chats = getAllChats();
    const existingIndex = chats.findIndex((c) => c.id === chat.id);

    if (existingIndex >= 0) {
      chats[existingIndex] = chat;
    } else {
      chats.push(chat);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
    // Handle quota exceeded or other errors
    if (error instanceof Error && error.name === "QuotaExceededError") {
      throw new Error(
        "Storage quota exceeded. Please clear some chat history."
      );
    }
    throw error;
  }
}

/**
 * Delete a chat from localStorage
 */
export function deleteChat(chatId: string): void {
  try {
    if (typeof window === "undefined") return;

    const chats = getAllChats();
    const filtered = chats.filter((chat) => chat.id !== chatId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error deleting from localStorage:", error);
    throw error;
  }
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    if (typeof window === "undefined") return false;
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}
