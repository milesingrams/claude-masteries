import * as React from "react";
import { cn } from "@/lib/utils";

export interface UserMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  content: string;
}

export function UserMessage({
  content,
  className,
  ...props
}: UserMessageProps) {
  return (
    <div data-slot="user-message" className="flex w-full">
      <div
        className={cn(
          "rounded-2xl bg-zinc-900 px-3 py-2 font-serif text-base leading-relaxed text-zinc-100",
          className
        )}
        {...props}
      >
        <div className="whitespace-pre-wrap">{content}</div>
      </div>
    </div>
  );
}
