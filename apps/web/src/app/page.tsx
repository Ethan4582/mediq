"use client";

import { useRouter } from "next/navigation";
import { BookOpen, Sparkles, Plus, ChevronDown, Mic, ArrowUp, ShieldCheck, Brain, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ImpactSection } from "@/components/ImpactSection";
import { Footer } from "@/components/Footer";

import { useScroll, useTransform } from "framer-motion";

export default function LandingPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  
  const { scrollY } = useScroll();
  
  // Transform values for gradual animation
  const navTop = useTransform(scrollY, [0, 60], ["0px", "16px"]);
  const navPaddingX = useTransform(scrollY, [0, 60], ["32px", "12px"]);
  const navPaddingY = useTransform(scrollY, [0, 60], ["16px", "8px"]);
  const navBg = useTransform(scrollY, [0, 60], ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.95)"]);
  const navBackdrop = useTransform(scrollY, [0, 60], ["blur(0px)", "blur(12px)"]);
  const navShadow = useTransform(scrollY, [0, 60], ["0 0px 0px rgba(0,0,0,0)", "0 8px 30px rgba(0,0,0,0.06)"]);
  const navBorder = useTransform(scrollY, [0, 60], ["1px solid rgba(229, 231, 235, 0)", "1px solid rgba(229, 231, 235, 0.5)"]);
  const navRadius = useTransform(scrollY, [0, 60], ["0px", "16px"]);
  const navMaxWidth = useTransform(scrollY, [0, 60], ["100%", "768px"]);
  
  const logoSize = useTransform(scrollY, [0, 60], ["32px", "28px"]);
  const buttonPaddingX = useTransform(scrollY, [0, 60], ["20px", "16px"]);
  const buttonPaddingY = useTransform(scrollY, [0, 60], ["8px", "6px"]);
  const buttonRadius = useTransform(scrollY, [0, 60], ["16px", "12px"]);

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
    <main className="relative min-h-screen overflow-hidden">
      {/* Navbar */}
      <motion.nav 
        className="fixed left-0 right-0 z-50 flex items-center justify-between mx-auto"
        style={{
          top: navTop,
          paddingLeft: navPaddingX,
          paddingRight: navPaddingX,
          paddingTop: navPaddingY,
          paddingBottom: navPaddingY,
          backgroundColor: navBg,
          backdropFilter: navBackdrop,
          boxShadow: navShadow,
          border: navBorder,
          borderRadius: navRadius,
          maxWidth: navMaxWidth
        }}
      >
        {/* Left - Logo */}
        <div className="flex items-center gap-2">
          <motion.div 
            className="flex items-center justify-center"
            style={{ width: logoSize, height: logoSize }}
          >
            <img src="/logo.png" alt="MediQ logo" className="w-full h-full object-contain" />
          </motion.div>
        </div>

        {/* Center - Nav Links (Hidden on mobile) */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 nav-links">
          <Link href="#features" className="flex items-center gap-1.5 text-[15px] font-medium text-[#475569] hover:text-[#0f172a] transition-colors">
            Features
          </Link>
          <Link href="/docs" className="flex items-center gap-1.5 text-[15px] font-medium text-[#475569] hover:text-[#0f172a] transition-colors">
            Docs
          </Link>
        </div>

        {/* Right - Auth Buttons */}
        <div className="flex items-center gap-3">
          <Link href="/chat/new">
            <motion.div
              className="text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              style={{
                paddingLeft: buttonPaddingX,
                paddingRight: buttonPaddingX,
                paddingTop: buttonPaddingY,
                paddingBottom: buttonPaddingY,
                borderRadius: buttonRadius
              }}
            >
              Try MediaQ
            </motion.div>
          </Link>
        </div>
      </motion.nav>

      {/* Hero Content Section */}
      <section 
        className="relative min-h-[90vh] flex flex-col items-center pt-24 pb-16 px-4 bg-transparent"
        style={{
          backgroundImage: "url('/hero_bg1.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        
        {/* Badge pill */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#c7d7fe] bg-white/70 backdrop-blur-sm mt-16 text-sm font-medium text-[#3b5bdb]"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#2563eb]" />
          AI-Powered Healthcare Intelligence
        </motion.div>

        {/* Hero headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="text-center mt-6"
        >
          <span className="hero-headline-blue block">Smarter Insights.</span>
          <span className="block">
            <span className="hero-headline-dark">Better </span>
            <span className="hero-headline-blue">Decisions.</span>
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="mt-6 text-center hero-sub mx-auto max-w-[480px]"
        >
          MediQ combines advanced AI with trusted medical knowledge to help you understand, analyze, and make confident decisions.
        </motion.p>

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

      {/* Impact Section */}
      <ImpactSection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
