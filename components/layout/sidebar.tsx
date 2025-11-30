"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Plus, MessageSquare, FolderOpen, Network } from "lucide-react";
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
import { ChatOptionsDropdown } from "@/components/chat/chat-options-dropdown";
import { useChatContext } from "@/lib/chat-context";

export function AppSidebar() {
  const { state } = useSidebar();
  const { chats, isLoaded, deleteChat } = useChatContext();
  const params = useParams();
  const router = useRouter();
  const currentChatId = params?.chatId as string | undefined;

  const handleDeleteChat = (chatId: string) => {
    deleteChat(chatId);
    // If we're deleting the current chat, navigate away
    if (currentChatId === chatId) {
      router.push("/new");
    }
  };

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
          <div className="flex items-center justify-between px-2">
            <span className="text-sidebar-foreground truncate font-serif text-xl font-medium">
              Claude
            </span>
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
                <SidebarMenuButton asChild tooltip="New chat">
                  <Link href="/new">
                    <div className="bg-claude-orange -m-1 flex items-center justify-center rounded-full p-1">
                      <Plus className="h-4 w-4" />
                    </div>
                    <span>New chat</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Masteries">
                  <Network className="h-4 w-4" />
                  <span>Masteries</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Recent Chats - Hidden when collapsed, only shown after client hydration */}
        {state === "expanded" && isLoaded && (
          <SidebarGroup className="animate-in fade-in duration-200">
            <SidebarGroupLabel>Recents</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {chats.length === 0 ? (
                  <li className="text-muted-foreground px-2 py-4 text-center text-sm">
                    No chats yet
                  </li>
                ) : (
                  chats.map((chat) => {
                    const isActive = currentChatId === chat.id;
                    return (
                      <SidebarMenuItem
                        key={chat.id}
                        className="group/menu-item"
                      >
                        <SidebarMenuButton
                          asChild
                          tooltip={chat.title}
                          isActive={isActive}
                        >
                          <Link href={`/chat/${chat.id}`}>
                            <span className="truncate">{chat.title}</span>
                          </Link>
                        </SidebarMenuButton>
                        <ChatOptionsDropdown
                          onDelete={() => handleDeleteChat(chat.id)}
                          showOnHover
                          isActive={isActive}
                        />
                      </SidebarMenuItem>
                    );
                  })
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
