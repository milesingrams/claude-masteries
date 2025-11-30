"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { MessageInput } from "@/components/chat/message-input";
import { useChatContext } from "@/lib/chat-context";

export default function Page() {
  const greeting = getGreeting();
  const router = useRouter();
  const { createChat } = useChatContext();

  const handleFirstMessage = (message: string) => {
    const chatId = createChat(message);
    router.push(`/chat/${chatId}`);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Greeting */}
          <div className="flex gap-2 items-center justify-center">
            <Image src="/claude-logo.svg" alt="Claude" width={36} height={36} />
            <h1 className="text-3xl sm:text-4xl font-normal text-muted-foreground font-serif ml-2">
              {greeting}
            </h1>
          </div>
        </div>
      </div>
      <MessageInput onSubmit={handleFirstMessage} />
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}
