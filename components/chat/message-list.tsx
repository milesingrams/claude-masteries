"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { UserMessage } from "./user-message";
import { AgentMessage } from "./agent-message";
import type { Message } from "@/lib/types";

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="text-muted-foreground flex flex-1 items-center justify-center">
        <p>Start a conversation...</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 px-4">
      <div className="mx-auto max-w-3xl space-y-2 py-4 pb-24">
        {messages.map((message) =>
          message.role === "user" ? (
            <UserMessage key={message.id} content={message.content} />
          ) : (
            <AgentMessage
              key={message.id}
              content={message.content}
              messageId={message.id}
            />
          )
        )}
        {isLoading && (
          <div className="flex w-full px-3 py-2">
            <Image
              src="/claude-logo.svg"
              alt="Claude is thinking..."
              width={20}
              height={20}
              className="animate-pulse-scale opacity-60"
            />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
