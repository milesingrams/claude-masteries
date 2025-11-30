import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/layout/sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ChatProvider } from "@/lib/chat-context";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

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
        <TooltipProvider>
          <ChatProvider>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                {/* Mobile sidebar trigger - positioned to work with chat header */}
                <SidebarTrigger className="absolute top-2 left-2 z-20 md:hidden" />

                {/* Chat Content */}
                <div className="flex h-screen flex-1 flex-col overflow-hidden">
                  {children}
                </div>
              </SidebarInset>
            </SidebarProvider>
            <Toaster />
          </ChatProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
