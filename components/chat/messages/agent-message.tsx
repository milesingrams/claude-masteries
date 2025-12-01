import * as React from "react";
import { cn } from "@/lib/utils";
import { MemoizedMarkdown } from "../memoized-markdown";

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
          "prose prose-stone dark:prose-invert text-foreground w-full max-w-none px-3 py-2 font-serif",
          // Uniform text color
          "prose-headings:text-foreground prose-strong:text-foreground prose-blockquote:text-foreground prose-code:text-foreground prose-li:marker:text-foreground",
          // Tighter spacing
          "prose-p:my-2 prose-p:leading-normal",
          "prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5",
          // Subtle headings - minimal size difference
          "prose-headings:font-semibold prose-headings:tracking-normal",
          "prose-h1:text-lg prose-h1:mt-4 prose-h1:mb-2",
          "prose-h2:text-base prose-h2:mt-3 prose-h2:mb-1.5",
          "prose-h3:text-base prose-h3:mt-2 prose-h3:mb-1",
          "prose-h4:text-base prose-h4:mt-2 prose-h4:mb-1",
          // Code styling
          "prose-code:before:content-none prose-code:after:content-none prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:font-normal prose-code:text-sm",
          "prose-pre:bg-muted prose-pre:my-2",
          // Links
          "prose-a:text-foreground prose-a:no-underline hover:prose-a:underline",
          // Blockquotes
          "prose-blockquote:my-2 prose-blockquote:not-italic",
          className
        )}
        {...props}
      >
        <MemoizedMarkdown content={content} id={messageId} />
      </div>
    </div>
  );
}
