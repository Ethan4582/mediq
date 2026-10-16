"use client";

import Link from "next/link";
import Image from "next/image";
import { LandingHero } from "@/components/LandingHero";
import { ImpactSection } from "@/components/ImpactSection";
import { Footer } from "@/components/Footer";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-white">
      {/* Navbar: Floating pill on desktop and mobile */}
      <nav 
        className="fixed top-3 sm:top-4 left-3 right-3 sm:left-4 sm:right-4 md:left-0 md:right-0 z-50 flex items-center justify-between mx-auto max-w-[600px] bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-200/60 rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 transition-all"
      >
        {/* Left - Logo */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="flex items-center justify-center w-7 h-7 shrink-0 transition-transform group-hover:scale-105">
            <Image src="/logo.png" alt="MediQ logo" width={28} height={28} priority className="w-7 h-7 object-contain" />
          </div>
          <span className="font-bold text-gray-900 text-[16px] sm:text-[17px] tracking-tight">MediQ</span>
        </Link>

        {/* Center - Nav Links */}
        <div className="hidden md:flex flex-1 justify-center items-center gap-8">
          <Link href="/" className="flex items-center gap-1.5 text-[15px] font-medium text-[#475569] hover:text-[#0f172a] transition-colors">
            Docs
          </Link>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[15px] font-medium text-[#475569] hover:text-[#0f172a] transition-colors">
            GitHub
          </a>
        </div>

        {/* Right - Action Button */}
        <div className="flex items-center gap-3">
          <Link href="/chat/new">
            <div className="text-xs sm:text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-95 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer px-3.5 sm:px-4 py-1.5 rounded-[10px]">
              Try MediQ
            </div>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <LandingHero />

      {/* Impact Section */}
      <ImpactSection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
