"use client"

import { Sidebar } from "./sidebar"
import { MobileHeader } from "./mobile-header"
import { MessageInput } from "@/components/chat/message-input"

interface ChatLayoutProps {
  children: React.ReactNode
}

export function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Mobile Header */}
        <MobileHeader />

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Message Input */}
        <MessageInput />
      </div>
    </div>
  )
}
