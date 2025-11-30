import * as React from "react";
import { cn } from "@/lib/utils";

export interface AgentMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  content: string;
}

export function AgentMessage({
  content,
  className,
  ...props
}: AgentMessageProps) {
  return (
    <div data-slot="agent-message" className="flex w-full">
      <div
        className={cn(
          "text-foreground font-serif text-base leading-relaxed",
          className
        )}
        {...props}
      >
        <div className="whitespace-pre-wrap">{content}</div>
      </div>
    </div>
  );
}
