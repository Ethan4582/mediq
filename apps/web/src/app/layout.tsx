import type { Metadata } from "next";
import "@astryxdesign/core/reset.css";
import "@astryxdesign/core/astryx.css";
import "./globals.css";
import SupabaseProvider from "@/components/providers/SupabaseProvider";
import DevtoolsMeme from "@/components/DevtoolsMeme";

export const metadata: Metadata = {
  title: "MediQ",
  description: "AI-powered discharge summary drafts",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

import { Toaster } from "@/components/ui/sonner";
import { GlobalSearch } from "@/components/layout/GlobalSearch";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body>
        <SupabaseProvider>
          {children}
          <GlobalSearch />
        </SupabaseProvider>
        <Toaster />
        <DevtoolsMeme />
      </body>
    </html>
  );
}
