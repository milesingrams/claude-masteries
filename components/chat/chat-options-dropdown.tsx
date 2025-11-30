"use client";

import { MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuAction } from "@/components/ui/sidebar";

interface ChatOptionsDropdownProps {
  onDelete: () => void;
  showOnHover?: boolean;
  isActive?: boolean;
}

export function ChatOptionsDropdown({
  onDelete,
  showOnHover = true,
  isActive = false,
}: ChatOptionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuAction
          showOnHover={showOnHover}
          className={`w-6 rounded-md bg-neutral-900 hover:bg-neutral-800 ${isActive ? "md:opacity-100" : ""}`}
        >
          <MoreHorizontal className="text-white" />
          <span className="sr-only">More options</span>
        </SidebarMenuAction>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" className="w-48">
        <DropdownMenuItem
          onClick={onDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
