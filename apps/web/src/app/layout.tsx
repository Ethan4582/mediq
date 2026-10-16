import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "@astryxdesign/core/astryx.css";
import "./globals.css";
import SupabaseProvider from "@/components/providers/SupabaseProvider";
import DevtoolsMeme from "@/components/DevtoolsMeme";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

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
    <html lang="en" suppressHydrationWarning className={`dark ${jetbrainsMono.variable}`}>
      <body className={`${jetbrainsMono.className} font-sans antialiased`}>
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
