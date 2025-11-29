"use client";

import { Plus, MessageSquare, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface RecentChat {
  id: string;
  title: string;
}

const recentChats: RecentChat[] = [
  { id: "1", title: "Founding design engineer project brainstorm" },
  { id: "2", title: "Hip arthroscopy pre- and post-sur..." },
  { id: "3", title: "Extreme LDL reduction and morta..." },
  { id: "4", title: "Hip arthroscopy decision with ca..." },
  { id: "5", title: "Can impingement surgery necess..." },
];

export function Sidebar() {
  return (
    <div className="hidden lg:flex w-[280px] h-screen flex-col bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="flex items-center gap-2 p-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white text-lg font-semibold">C</span>
          </div>
          <span className="text-sidebar-foreground font-medium">Claude</span>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="px-3 pb-2">
        <Button
          className="w-full justify-start gap-2 bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-accent-foreground border-0"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          New chat
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-1 text-sm">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-start gap-2 hover:bg-sidebar-accent text-sidebar-foreground h-8"
          >
            <MessageSquare className="h-4 w-4" />
            Chats
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-start gap-2 hover:bg-sidebar-accent text-sidebar-foreground/60 h-8"
          >
            <FolderOpen className="h-4 w-4" />
            Projects
          </Button>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Recent Chats */}
      <div className="flex-1 px-3 py-2">
        <h3 className="text-xs font-medium text-sidebar-foreground/60 px-2 py-1 mb-1">
          Recents
        </h3>
        <ScrollArea className="h-full">
          <div className="space-y-0.5">
            {recentChats.map((chat) => (
              <Button
                key={chat.id}
                variant="ghost"
                className="w-full justify-start text-left h-auto py-2 px-2 hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground font-normal"
              >
                <span className="truncate text-sm">{chat.title}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* User Profile */}
      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 hover:bg-sidebar-accent h-auto py-2"
        >
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-primary text-white text-xs">
              MI
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-sidebar-foreground">Miles Ingram</span>
        </Button>
      </div>
    </div>
  );
}
