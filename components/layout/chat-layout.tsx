"use client";

import { AppSidebar } from "./sidebar";
import { MessageInput } from "@/components/chat/message-input";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface ChatLayoutProps {
  children: React.ReactNode;
}

export function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Mobile header with trigger */}
        <SidebarTrigger className="absolute top-2 left-2 md:hidden" />

        {/* Chat Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">{children}</div>

          {/* Message Input */}
          <MessageInput />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
