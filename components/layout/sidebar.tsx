"use client";

import Image from "next/image";
import { Plus, MessageSquare, FolderOpen } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

export function AppSidebar() {
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader>
        {state === "collapsed" ? (
          // Show only trigger button when collapsed
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarTrigger />
            </TooltipTrigger>
            <TooltipContent side="right">
              Open sidebar <kbd className="ml-1 text-xs opacity-60">⌘.</kbd>
            </TooltipContent>
          </Tooltip>
        ) : (
          // Show header with Claude text and close button when expanded
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Image
                src="/claude-logo.svg"
                alt="Claude"
                width={26}
                height={26}
                className="shrink-0"
              />
              <span className="text-sidebar-foreground text-xl font-medium font-serif truncate">
                Claude
              </span>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarTrigger className="-mr-1" />
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Close sidebar
                <kbd className="ml-1 text-xs opacity-60">⌘.</kbd>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {/* New Chat Button */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="bg-sidebar-accent hover:bg-sidebar-accent/80 data-[state=open]:bg-sidebar-accent"
                  tooltip="New chat"
                >
                  <Plus className="h-4 w-4" />
                  <span>New chat</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Navigation Tabs - Vertically Stacked */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Chats" isActive>
                  <MessageSquare className="h-4 w-4" />
                  <span>Chats</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Projects">
                  <FolderOpen className="h-4 w-4" />
                  <span>Projects</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Recent Chats - Hidden when collapsed */}
        {state === "expanded" && (
          <SidebarGroup className="animate-in fade-in duration-200">
            <SidebarGroupLabel>Recents</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {recentChats.map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton tooltip={chat.title}>
                      <span className="truncate">{chat.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
