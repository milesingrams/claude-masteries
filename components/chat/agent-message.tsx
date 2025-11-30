import * as React from "react";
import { cn } from "@/lib/utils";
import { MemoizedMarkdown } from "./memoized-markdown";

export interface AgentMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  content: string;
  messageId: string;
}

export function AgentMessage({
  content,
  messageId,
  className,
  ...props
}: AgentMessageProps) {
  return (
    <div data-slot="agent-message" className="flex w-full">
      <div
        className={cn(
          "text-foreground prose-sm w-full max-w-none px-3 py-2 font-serif text-base leading-relaxed",
          className
        )}
        {...props}
      >
        <MemoizedMarkdown content={content} id={messageId} />
      </div>
    </div>
  );
}
