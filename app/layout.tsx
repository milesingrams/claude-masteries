import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/layout/sidebar";
import { MessageInput } from "@/components/chat/message-input";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Claude",
  description: "AI assistant by Anthropic",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
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
      </body>
    </html>
  );
}
