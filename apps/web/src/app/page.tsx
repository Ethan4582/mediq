"use client";

import { useRouter } from "next/navigation";
import { BookOpen, Sparkles, Plus, ChevronDown, Mic, ArrowUp, ShieldCheck, Brain, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSend = () => {
    if (!query.trim()) return;
    router.push("/chat/new");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <main 
      className="relative min-h-screen overflow-hidden" 
      style={{
        backgroundImage: "url('/hero_bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 py-5 bg-transparent">
        {/* Left - Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center">
            <img src="/logo.png" alt="MediQ logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-xl text-[#0f172a]">MediQ</span>
        </div>

        {/* Center - Nav Links (Hidden on mobile) */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 nav-links">
          <Link href="/docs" className="flex items-center gap-1.5 text-sm font-medium text-[#475569] hover:text-[#0f172a] transition-colors">
            <BookOpen size={16} />
            Docs
          </Link>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-[#475569] hover:text-[#0f172a] transition-colors">
            <img src="/github.svg" alt="GitHub" width={16} height={16} />
            GitHub
          </a>
        </div>

        {/* Right - Auth Buttons */}
        <div className="flex items-center gap-3">
          <Link 
            href="/auth" 
            className="text-sm font-medium text-[#0f172a] px-5 py-2 rounded-xl hover:bg-white/60 transition-all hidden sm:block"
          >
            Log in
          </Link>
          <Link 
            href="/auth?tab=signup" 
            className="text-sm font-semibold text-white bg-[#2563eb] px-5 py-2 rounded-xl hover:bg-[#1d4ed8] transition-all shadow-sm"
          >
            Sign up
          </Link>
        </div>
      </nav>

      {/* Hero Content Section */}
      <section className="relative min-h-screen flex flex-col items-center pt-32 pb-20 px-4 bg-transparent">
        
        {/* Badge pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#c7d7fe] bg-white/70 backdrop-blur-sm mt-32 text-sm font-medium text-[#3b5bdb]">
          <Sparkles className="w-3.5 h-3.5 text-[#2563eb]" />
          AI-Powered Healthcare Intelligence
        </div>

        {/* Hero headline */}
        <h1 className="text-center mt-6">
          <span className="hero-headline-blue block">Smarter Insights.</span>
          <span className="block">
            <span className="hero-headline-dark">Better </span>
            <span className="hero-headline-blue">Decisions.</span>
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-center hero-sub mx-auto max-w-[480px]">
          MediQ combines advanced AI with trusted medical knowledge to help you understand, analyze, and make confident decisions.
        </p>

        {/* Chat input bar */}
        <div className="mt-10 w-full max-w-[620px] mx-auto group">
          <div 
            className="rounded-[18px] p-[18px_20px_16px_20px] transition-all duration-300"
            style={{
              background: "#1e2330",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.06) inset"
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(37,99,235,0.15), 0 0 0 1px rgba(37,99,235,0.3)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.06) inset";
            }}
          >
            <textarea 
              rows={1}
              placeholder="Ask MediQ anything about health, conditions, treatments…"
              className="bg-transparent border-none outline-none w-full text-[#94a3b8] text-[0.97rem] placeholder-[#64748b] resize-none overflow-hidden"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            
            <div className="flex items-center justify-between mt-4">
              {/* Left - + button */}
              <button className="w-8 h-8 rounded-full bg-[#2d3348] flex items-center justify-center text-[#94a3b8] hover:bg-[#363d56] transition-all shrink-0">
                <Plus className="w-4 h-4" />
              </button>

              {/* Center - Smart mode selector */}
              <div className="flex items-center gap-1.5 text-sm font-medium text-[#2563eb] cursor-pointer hover:opacity-80 transition-opacity">
                Smart
                <ChevronDown className="w-3.5 h-3.5" />
              </div>

              {/* Right - Two buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button className="w-8 h-8 rounded-full bg-[#2d3348] flex items-center justify-center text-[#94a3b8] hover:bg-[#363d56] transition-all">
                  <Mic className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleSend}
                  className="w-9 h-9 rounded-full bg-[#2563eb] flex items-center justify-center hover:bg-[#1d4ed8] transition-all"
                >
                  <ArrowUp className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Trust icons row */}
        <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 trust-row w-full max-w-[800px]">
          
          {/* Item 1 */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/70 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#2563eb]" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-[#0f172a]">Evidence-Based</span>
              <span className="text-xs text-[#64748b] mt-0">Trusted medical sources</span>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/70 flex items-center justify-center shrink-0">
              <Brain className="w-5 h-5 text-[#2563eb]" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-[#0f172a]">AI-Powered</span>
              <span className="text-xs text-[#64748b] mt-0">Advanced reasoning</span>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/70 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-[#2563eb]" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-[#0f172a]">Private & Secure</span>
              <span className="text-xs text-[#64748b] mt-0">Your data is protected</span>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
