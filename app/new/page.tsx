"use client";

import { useRouter } from "next/navigation";
import { ClaudeLogo } from "@/components/ui/claude-logo";
import { PromptInput } from "@/components/chat/prompt/prompt-input";
import { useChatContext } from "@/lib/chat-context";

export default function Page() {
  const greeting = getGreeting();
  const router = useRouter();
  const { createChat } = useChatContext();

  const handleFirstPrompt = (prompt: string) => {
    const chatId = createChat(prompt);
    router.push(`/chat/${chatId}`);
  };

  return (
    <div className="relative h-full flex-1">
      {/* Content area */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl space-y-8 text-center">
          {/* Greeting */}
          <div className="flex items-center justify-center gap-2">
            <ClaudeLogo size={36} />
            <h1 className="text-muted-foreground ml-2 font-serif text-3xl font-normal sm:text-4xl">
              {greeting}
            </h1>
          </div>
        </div>
      </div>
      {/* Floating input at bottom */}
      <PromptInput onPromptSubmit={handleFirstPrompt} />
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}
