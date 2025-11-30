import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const messageBubbleVariants = cva(
  "rounded-2xl px-4 py-3 text-sm leading-relaxed wrap-break-word",
  {
    variants: {
      role: {
        user: "bg-primary text-primary-foreground ml-auto",
        assistant: "bg-card text-card-foreground mr-auto",
      },
    },
    defaultVariants: {
      role: "assistant",
    },
  }
);

export interface MessageBubbleProps
  extends React.HTMLAttributes<HTMLDivElement> {
  content: string;
  role: "user" | "assistant";
}

export function MessageBubble({
  role,
  content,
  className,
  ...props
}: MessageBubbleProps) {
  return (
    <div
      data-slot="message-bubble"
      className={cn(
        "flex w-full",
        role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          messageBubbleVariants({ role }),
          "max-w-[85%]",
          className
        )}
        {...props}
      >
        <div className="whitespace-pre-wrap">{content}</div>
      </div>
    </div>
  );
}
