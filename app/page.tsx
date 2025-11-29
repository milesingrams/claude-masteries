import { ChatLayout } from "@/components/layout/chat-layout"
import { EmptyState } from "@/components/chat/empty-state"

export default function Home() {
  return (
    <ChatLayout>
      <EmptyState />
    </ChatLayout>
  )
}
