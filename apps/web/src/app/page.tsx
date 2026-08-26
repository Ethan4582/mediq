"use client";

import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Brain, Lock } from "lucide-react";
import LandingHeroAstryx from "@/components/LandingHeroAstryx";
import { ImpactSection } from "@/components/ImpactSection";
import { Footer } from "@/components/Footer";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white">
      {/* Navbar */}
      <nav 
        className="fixed top-4 left-4 right-4 md:left-0 md:right-0 z-50 flex items-center justify-between mx-auto max-w-[600px] bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-200/50 rounded-2xl px-4 py-2.5"
      >
        {/* Left - Logo */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-[28px] h-[28px]">
            <Image src="/logo.png" alt="MediQ logo" width={28} height={28} className="object-contain" />
          </div>
        </div>

        {/* Center - Nav Links */}
        <div className="hidden md:flex flex-1 justify-center items-center gap-8">
          <Link href="/" className="flex items-center gap-1.5 text-[15px] font-medium text-[#475569] hover:text-[#0f172a] transition-colors">
            Docs
          </Link>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[15px] font-medium text-[#475569] hover:text-[#0f172a] transition-colors">
            GitHub
          </a>
        </div>

        {/* Right - Auth Buttons */}
        <div className="flex items-center gap-3">
          <Link href="/chat/new">
            <div className="text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer px-4 py-1.5 rounded-[10px]">
              Try MediQ
            </div>
          </Link>
        </div>
      </nav>

      {/* Hero Section with Astryx AI Chat Landing Component */}
      <section className="pt-24 pb-12 px-4 flex flex-col items-center bg-gradient-to-b from-blue-50/30 via-white to-white">
        <LandingHeroAstryx />

        {/* Trust row */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 w-full max-w-[800px]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#2563eb]" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-[#0f172a]">Evidence-Based</span>
              <span className="text-xs text-[#64748b]">Clinical source citations</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Brain className="w-5 h-5 text-[#2563eb]" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-[#0f172a]">AI-Powered</span>
              <span className="text-xs text-[#64748b]">Agentic reconciliation</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-[#2563eb]" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-[#0f172a]">HIPAA-Compliant</span>
              <span className="text-xs text-[#64748b]">Private & encrypted</span>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <ImpactSection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
