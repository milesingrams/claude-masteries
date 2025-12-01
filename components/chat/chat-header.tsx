"use client";

import type { ComponentProps } from "react";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ChatHeaderProps extends ComponentProps<"header"> {
  title: string;
  onRename?: () => void;
  onDelete?: () => void;
}

export function ChatHeader({ title, onRename, onDelete, className, ...props }: ChatHeaderProps) {
  return (
    <header className={cn("border-border/40 bg-background/80 sticky top-0 z-10 flex h-12 shrink-0 items-center justify-center border-b backdrop-blur-sm", className)} {...props}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto gap-1.5 px-2 py-1 font-medium hover:bg-transparent"
          >
            <span className="max-w-[200px] truncate text-sm md:max-w-[400px]">
              {title}
            </span>
            <ChevronDown className="h-4 w-4 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-48">
          {onRename && (
            <DropdownMenuItem onClick={onRename}>
              <Pencil className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>
          )}
          {onDelete && (
            <>
              {onRename && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
