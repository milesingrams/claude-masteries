"use client"

import { AppSidebar } from "./sidebar"
import { MessageInput } from "@/components/chat/message-input"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

interface ChatLayoutProps {
  children: React.ReactNode
}

export function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Mobile header with trigger */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 lg:hidden">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1 text-center">
            <h1 className="text-sm font-medium text-foreground">Claude</h1>
          </div>
          <div className="w-9" />
        </header>

        {/* Chat Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>

          {/* Message Input */}
          <MessageInput />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
