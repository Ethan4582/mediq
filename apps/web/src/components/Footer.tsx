"use client";

import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-full pt-16 pb-8 px-4 md:px-8 bg-[#040914] relative rounded-t-[32px] overflow-hidden mt-12 shadow-[0_-10px_40px_rgba(37,99,235,0.1)]">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#2563eb]/50 to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-[100px] bg-gradient-to-b from-[#1d4ed8]/10 to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10 flex flex-col">
        <div className="flex flex-col lg:flex-row justify-between w-full mb-12 gap-12 lg:gap-0">
          <div className="flex flex-col w-full lg:w-[35%] lg:pr-8">
            <div className="flex items-center gap-2.5 mb-5">
              <Image src="/logo.png" alt="MediQ logo" width={28} height={28} className="object-contain" />
              <span className="text-white text-[20px] font-bold tracking-wide">MediQ</span>
            </div>
            <p className="text-[#8492a6] text-[14px] leading-relaxed mb-6 max-w-[90%]">
              AI-powered clinical intelligence that helps healthcare teams extract, understand, and act on information with confidence.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-[38px] h-[38px] flex items-center justify-center rounded-[8px] border border-[#1e293b] bg-[#0b1221] hover:bg-[#1e293b] hover:border-[#334155] transition-all group">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#94a3b8] group-hover:text-white fill-current">
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                </svg>
              </a>
              <a href="#" className="w-[38px] h-[38px] flex items-center justify-center rounded-[8px] border border-[#1e293b] bg-[#0b1221] hover:bg-[#1e293b] hover:border-[#334155] transition-all group">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#94a3b8] group-hover:text-white">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
              </a>
              <a href="#" className="w-[38px] h-[38px] flex items-center justify-center rounded-[8px] border border-[#1e293b] bg-[#0b1221] hover:bg-[#1e293b] hover:border-[#334155] transition-all group">
                <Image src="/linkedin.svg" alt="linkedin" width={18} height={18} className="opacity-70 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap justify-between w-full lg:w-[60%] gap-8 sm:gap-4 mt-2 lg:mt-0">
            <div className="flex flex-col gap-3.5">
              <h4 className="text-white font-semibold text-[15px] mb-1">Platform</h4>
              <Link href="#features" className="text-[#8492a6] hover:text-white text-[14px] transition-colors">Features</Link>
              <Link href="/analytics" className="text-[#8492a6] hover:text-white text-[14px] transition-colors">Analytics</Link>
            </div>

            <div className="flex flex-col gap-3.5">
              <h4 className="text-white font-semibold text-[15px] mb-1">Resources</h4>
              <Link href="/docs" className="text-[#8492a6] hover:text-white text-[14px] transition-colors">Doc</Link>
              <a href="https://github.com/mediaq/system_design.md" target="_blank" rel="noopener noreferrer" className="text-[#8492a6] hover:text-white text-[14px] transition-colors">System Design</a>
            </div>

            <div className="flex flex-col gap-3.5">
              <h4 className="text-white font-semibold text-[15px] mb-1">Community</h4>
              <a href="#" className="text-[#8492a6] hover:text-white text-[14px] transition-colors">X</a>
              <a href="#" className="text-[#8492a6] hover:text-white text-[14px] transition-colors">GitHub</a>
              <a href="#" className="text-[#8492a6] hover:text-white text-[14px] transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-[#1e293b]/60 gap-4">
          <div className="text-[#64748b] text-[13px]">
            © 2024 MediQ. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-[#1e293b] bg-[#0b1221]">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className="text-[#cbd5e1] text-[12px] font-medium">Operational</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#64748b] text-[13px] hover:text-white transition-colors cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              EN-US
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
