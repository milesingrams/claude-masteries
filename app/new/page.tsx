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
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl space-y-8 text-center">
          {/* Greeting */}
          <div className="flex items-center justify-center gap-2">
            <Image src="/claude-logo.svg" alt="Claude" width={36} height={36} />
            <h1 className="text-muted-foreground ml-2 font-serif text-3xl font-normal sm:text-4xl">
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
