"use client";

import { User, BookOpen, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("Subscription request received!");
    setEmail("");
  };

  return (
    <footer className="w-full pt-16 pb-8 px-4 md:px-8 bg-[#040914] relative rounded-t-[32px] overflow-hidden mt-12 shadow-[0_-10px_40px_rgba(37,99,235,0.1)]">
      {/* Top subtle glow */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#2563eb]/50 to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-[100px] bg-gradient-to-b from-[#1d4ed8]/10 to-transparent pointer-events-none" />
      
      {/* Container */}
      <div className="max-w-6xl mx-auto relative z-10 flex flex-col gap-12">
        
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between gap-12 items-start">
          
          {/* Left: Brand & Desc */}
          <div className="flex flex-col max-w-[340px]">
            <div className="flex items-center gap-3 mb-5">
              <img src="/logo.png" alt="MediQ logo" className="w-[34px] h-[34px] object-contain" />
              <span className="text-white text-[28px] font-bold tracking-wide">MediQ</span>
            </div>
            <p className="text-[#8492a6] text-[15px] leading-relaxed">
              AI-powered clinical intelligence that helps healthcare teams extract, understand, and act on information with confidence.
            </p>
          </div>

          {/* Middle: Links */}
          <div className="flex items-center gap-12 md:gap-20 mt-4 md:mt-2">
            {/* Link 1 */}
            <Link href="#features" className="flex items-center group">
              <span className="text-white text-[15px] font-semibold group-hover:text-blue-400 transition-colors">Features</span>
            </Link>
            
            {/* Divider */}
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-[#1e293b] to-transparent"></div>

            {/* Link 2 */}
            <Link href="#about" className="flex items-center gap-2.5 group">
              <User className="w-4 h-4 text-[#3b82f6] group-hover:text-white transition-colors" />
              <span className="text-white text-[15px] font-semibold group-hover:text-blue-400 transition-colors">About</span>
            </Link>

            {/* Divider */}
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-[#1e293b] to-transparent"></div>

            {/* Link 3 */}
            <Link href="#docs" className="flex items-center gap-2.5 group">
              <BookOpen className="w-4 h-4 text-[#3b82f6] group-hover:text-white transition-colors" />
              <span className="text-white text-[15px] font-semibold group-hover:text-blue-400 transition-colors">Docs</span>
            </Link>
          </div>

          {/* Right: Newsletter */}
          <div className="flex flex-col gap-4 mt-4 md:mt-0 w-full max-w-[340px]">
            <div className="flex items-center gap-2.5 text-white mb-1">
              <Mail className="w-[22px] h-[22px] text-[#3b82f6]" />
              <span className="font-semibold text-[16px]">Stay in the loop</span>
            </div>
            <form onSubmit={handleSubscribe} className="relative flex items-center">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email" 
                required
                className="w-full bg-[#0f172a]/60 border border-[#1e293b] rounded-[16px] py-[14px] pl-5 pr-[110px] text-white text-[15px] placeholder:text-[#475569] focus:outline-none focus:border-[#3b82f6] transition-colors"
              />
              <button type="submit" className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium text-[15px] px-6 rounded-[12px] transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-[#1e293b]/60 gap-6">
          
          {/* Socials */}
          <div className="flex items-center gap-3.5">
            <a href="#" className="w-11 h-11 flex items-center justify-center rounded-[12px] border border-[#1e293b] bg-[#0b1221] hover:bg-[#1e293b] hover:border-[#334155] transition-all group">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#94a3b8] group-hover:text-white">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
            </a>
            <a href="#" className="w-11 h-11 flex items-center justify-center rounded-[12px] border border-[#1e293b] bg-[#0b1221] hover:bg-[#1e293b] hover:border-[#334155] transition-all group">
              {/* X Logo */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#94a3b8] group-hover:text-white fill-current">
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
              </svg>
            </a>
            <a href="#" className="w-11 h-11 flex items-center justify-center rounded-[12px] border border-[#1e293b] bg-[#0b1221] hover:bg-[#1e293b] hover:border-[#334155] transition-all group">
              <img src='linkedin.svg' alt="linkedin" className="w-6 h-6" />
            </a>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-[#1e293b] bg-[#0b1221]">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </div>
            <span className="text-[#cbd5e1] text-[14px] font-medium tracking-wide">All Systems Operational</span>
          </div>

        </div>

      </div>
    </footer>
  );
}
