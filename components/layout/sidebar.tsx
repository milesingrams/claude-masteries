"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
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
import { useChatContext } from "@/lib/chat-context";

export function AppSidebar() {
  const { state } = useSidebar();
  const { chats } = useChatContext();
  const params = useParams();
  const currentChatId = params?.chatId as string | undefined;

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
              <TooltipContent side="right">
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
                  asChild
                  className="bg-sidebar-accent hover:bg-sidebar-accent/80 data-[state=open]:bg-sidebar-accent"
                  tooltip="New chat"
                >
                  <Link href="/new">
                    <Plus className="h-4 w-4" />
                    <span>New chat</span>
                  </Link>
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
                {chats.length === 0 ? (
                  <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                    No chats yet
                  </div>
                ) : (
                  chats.map((chat) => (
                    <SidebarMenuItem key={chat.id}>
                      <SidebarMenuButton
                        asChild
                        tooltip={chat.title}
                        isActive={currentChatId === chat.id}
                      >
                        <Link href={`/chat/${chat.id}`}>
                          <span className="truncate">{chat.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
