"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Sparkles, Plus, ChevronDown, ArrowUp, ShieldCheck, Brain, Lock } from "lucide-react";
import { motion } from "framer-motion";
import LandingHeroFloatingAssets from "./LandingHeroFloatingAssets";

const MODELS = [
  { id: "gemini", name: "Gemini", icon: "/gemini.svg" },
  { id: "openai", name: "GPT", icon: "/openai.svg" },
  { id: "anthropic", name: "Claude", icon: "/anthropic.svg" },
  { id: "mistral", name: "Mistral", icon: "/mistral.svg" },
  { id: "groq", name: "Llama", icon: "/groq.svg" },
] as const;

const PLACEHOLDERS = [
  "Analyze this patient's lab results...",
  "Ask MediQ anything about health, conditions, treatments…",
  "Summarize this clinical discharge record…",
  "Check drug interactions and organ clearance warnings…",
];

export function LandingHero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0]);
  const [selectedModel, setSelectedModel] = useState<(typeof MODELS)[number]>(MODELS[0]);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let i = 0;
    let isDeleting = false;
    let text = "";
    let timer: NodeJS.Timeout;

    const tick = () => {
      const current = PLACEHOLDERS[i] ?? PLACEHOLDERS[0];
      if (isDeleting) {
        text = current.substring(0, text.length - 1);
      } else {
        text = current.substring(0, text.length + 1);
      }
      setPlaceholder(text);

      let speed = isDeleting ? 25 : 55;
      if (!isDeleting && text === current) {
        speed = 2200;
        isDeleting = true;
      } else if (isDeleting && text === "") {
        isDeleting = false;
        i = (i + 1) % PLACEHOLDERS.length;
        speed = 400;
      }
      timer = setTimeout(tick, speed);
    };

    timer = setTimeout(tick, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = () => {
    if (!query.trim()) {
      router.push("/chat/new");
      return;
    }
    sessionStorage.setItem("landing_prompt", query.trim());
    sessionStorage.setItem("landing_model", selectedModel.id);
    const params = new URLSearchParams({
      prompt: query.trim(),
      provider: selectedModel.id,
    });
    router.push(`/chat/new?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    router.push("/chat/new");
  };

  return (
    <section
      className="relative w-full min-h-[92vh] sm:min-h-screen flex flex-col items-center justify-center pt-8 sm:pt-28 pb-10 sm:pb-16 px-3.5 sm:px-6 overflow-hidden"
      style={{
        backgroundImage: "url('/hero_bg1.png')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
      }}
    >
      <LandingHeroFloatingAssets />

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Top Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-blue-200/80 bg-white/90 backdrop-blur-xs text-xs sm:text-sm font-medium text-[#2563eb] shadow-xs mb-3.5 sm:mb-6 relative z-10"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#2563eb] shrink-0" />
          <span>AI-Powered Healthcare Intelligence</span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="text-center relative z-10 tracking-tight text-[30px] sm:text-5xl md:text-[54px] lg:text-[60px] font-bold leading-[1.15] sm:leading-[1.12] mb-3 sm:mb-4 px-1"
        >
          <span className="block text-[#2563eb]">Smarter Insights.</span>
          <span className="block mt-0.5 sm:mt-1">
            <span className="text-[#0f172a]">Better </span>
            <span className="text-[#2563eb]">Decisions.</span>
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="text-center mx-auto max-w-[500px] text-[#334155] text-[13px] sm:text-base font-normal leading-relaxed mb-6 sm:mb-8 px-2 relative z-10"
        >
          MediQ combines advanced AI with trusted medical knowledge to help you understand, analyze, and make confident decisions.
        </motion.p>

        {/* Central Chat Input Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="w-full max-w-[620px] mx-auto relative z-20 mb-6 sm:mb-10 px-0.5 sm:px-0"
        >
          <div className="rounded-[18px] sm:rounded-[20px] p-3.5 sm:p-5 transition-all duration-300 relative bg-[#171b26] border border-white/[0.09] shadow-[0_14px_38px_rgba(0,0,0,0.28)] focus-within:border-blue-500/50 focus-within:shadow-[0_14px_38px_rgba(37,99,235,0.22)]">
            <textarea
              rows={1}
              placeholder={placeholder}
              className="bg-transparent border-none outline-none w-full text-[#e2e8f0] text-[13.5px] sm:text-[0.97rem] placeholder-[#64748b] resize-none overflow-hidden leading-relaxed min-h-[38px] sm:min-h-[42px]"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <div className="flex items-center justify-between mt-2.5 sm:mt-4 pt-2 border-t border-gray-800/80">
              <div className="flex items-center gap-1.5 sm:gap-2 relative">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#272d3f] flex items-center justify-center text-[#94a3b8] hover:text-white hover:bg-[#343b52] transition-all shrink-0 cursor-pointer"
                  title="Upload document"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.txt"
                  onChange={handleFileUpload}
                />

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsModelOpen(!isModelOpen)}
                    className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-[#272d3f] text-xs sm:text-sm font-medium text-[#cbd5e1] cursor-pointer hover:bg-[#343b52] transition-all"
                  >
                    <Image
                      src={selectedModel.icon}
                      alt={selectedModel.name}
                      width={14}
                      height={14}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain"
                      unoptimized
                    />
                    <span>{selectedModel.name}</span>
                    <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ml-0.5 text-[#94a3b8] transition-transform ${isModelOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isModelOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-44 sm:w-48 bg-[#171b26] border border-gray-700/80 rounded-xl shadow-2xl overflow-hidden z-50 py-1">
                      {MODELS.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setSelectedModel(m);
                            setIsModelOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-1.5 sm:py-2 hover:bg-[#272d3f] cursor-pointer transition-colors text-xs sm:text-sm text-left ${selectedModel.id === m.id ? "text-blue-400 bg-[#272d3f]/60" : "text-[#e2e8f0]"}`}
                        >
                          <Image
                            src={m.icon}
                            alt={m.name}
                            width={16}
                            height={16}
                            className="w-4 h-4 object-contain"
                            unoptimized
                          />
                          <span className="font-medium">{m.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSend}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#2563eb] flex items-center justify-center hover:bg-[#1d4ed8] text-white transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95 shrink-0"
                title="Send query"
              >
                <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-[2.5]" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Feature Highlights / Trust Badges: Single-row on mobile and desktop */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          className="grid grid-cols-3 gap-2 sm:gap-6 w-full max-w-[640px] relative z-10 px-1"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2.5 py-2 px-1.5 sm:p-0 text-center sm:text-left rounded-xl sm:rounded-none bg-white/75 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none border border-white/80 sm:border-none shadow-xs sm:shadow-none">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/90 sm:bg-white/80 shadow-xs flex items-center justify-center shrink-0 border border-blue-100/60">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#2563eb]" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] sm:text-sm font-semibold text-[#0f172a] whitespace-nowrap">Evidence-Based</span>
              <span className="hidden sm:inline text-xs text-[#64748b]">Trusted medical sources</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2.5 py-2 px-1.5 sm:p-0 text-center sm:text-left rounded-xl sm:rounded-none bg-white/75 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none border border-white/80 sm:border-none shadow-xs sm:shadow-none">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/90 sm:bg-white/80 shadow-xs flex items-center justify-center shrink-0 border border-blue-100/60">
              <Brain className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#2563eb]" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] sm:text-sm font-semibold text-[#0f172a] whitespace-nowrap">AI-Powered</span>
              <span className="hidden sm:inline text-xs text-[#64748b]">Advanced reasoning</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2.5 py-2 px-1.5 sm:p-0 text-center sm:text-left rounded-xl sm:rounded-none bg-white/75 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none border border-white/80 sm:border-none shadow-xs sm:shadow-none">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/90 sm:bg-white/80 shadow-xs flex items-center justify-center shrink-0 border border-blue-100/60">
              <Lock className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#2563eb]" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] sm:text-sm font-semibold text-[#0f172a] whitespace-nowrap">Private & Secure</span>
              <span className="hidden sm:inline text-xs text-[#64748b]">Your data is protected</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
