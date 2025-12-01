"use client";

import { ClaudeLogo } from "@/components/ui/claude-logo";

export function NewChat() {
  const greeting = getGreeting();

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-8">
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
  );
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}
