"use client";

import Image from "next/image";

export function EmptyState() {
  const greeting = getGreeting();

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Greeting */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Image
              src="/claude-logo.svg"
              alt="Claude"
              width={48}
              height={48}
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-normal text-foreground font-serif">
            {greeting}
          </h1>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
