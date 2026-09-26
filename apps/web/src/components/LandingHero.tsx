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
      className="relative w-full min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-4 overflow-hidden"
      style={{
        backgroundImage: "url('/hero_bg1.png')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
      }}
    >
      <LandingHeroFloatingAssets />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Top Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#c7d7fe] bg-white/80 backdrop-blur-xs text-sm font-medium text-[#2563eb] shadow-xs mb-6 relative z-10"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#2563eb]" />
          <span>AI-Powered Healthcare Intelligence</span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="text-center relative z-10 tracking-tight text-4xl sm:text-6xl md:text-7xl font-extrabold leading-[1.08] mb-5"
        >
          <span className="block text-[#2563eb]">Smarter Insights.</span>
          <span className="block mt-1">
            <span className="text-[#0f172a]">Better </span>
            <span className="text-[#2563eb]">Decisions.</span>
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="text-center mx-auto max-w-[560px] text-[#334155] text-base sm:text-lg font-normal leading-relaxed mb-8 relative z-10"
        >
          MediQ combines advanced AI with trusted medical knowledge to help you understand, analyze, and make confident decisions.
        </motion.p>

        {/* Central Chat Input Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="w-full max-w-[620px] mx-auto relative z-20 mb-10"
        >
          <div className="rounded-[20px] p-4 sm:p-5 transition-all duration-300 relative bg-[#1e2330] border border-white/[0.08] shadow-[0_12px_36px_rgba(0,0,0,0.25)] focus-within:border-blue-500/50 focus-within:shadow-[0_12px_36px_rgba(37,99,235,0.25)]">
            <textarea
              rows={1}
              placeholder={placeholder}
              className="bg-transparent border-none outline-none w-full text-[#e2e8f0] text-[0.97rem] placeholder-[#64748b] resize-none overflow-hidden leading-relaxed"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-800/80">
              <div className="flex items-center gap-2 relative">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-8 h-8 rounded-full bg-[#2d3348] flex items-center justify-center text-[#94a3b8] hover:text-white hover:bg-[#363d56] transition-all shrink-0 cursor-pointer"
                  title="Upload document"
                >
                  <Plus className="w-4 h-4" />
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2d3348] text-sm font-medium text-[#cbd5e1] cursor-pointer hover:bg-[#363d56] transition-all"
                  >
                    <Image
                      src={selectedModel.icon}
                      alt={selectedModel.name}
                      width={16}
                      height={16}
                      className="w-4 h-4 object-contain"
                      unoptimized
                    />
                    <span>{selectedModel.name}</span>
                    <ChevronDown className={`w-3.5 h-3.5 ml-0.5 text-[#94a3b8] transition-transform ${isModelOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isModelOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#1e2330] border border-gray-700/80 rounded-xl shadow-2xl overflow-hidden z-50 py-1">
                      {MODELS.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setSelectedModel(m);
                            setIsModelOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#2d3348] cursor-pointer transition-colors text-sm text-left ${selectedModel.id === m.id ? "text-blue-400 bg-[#2d3348]/50" : "text-[#e2e8f0]"}`}
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
                className="w-9 h-9 rounded-full bg-[#2563eb] flex items-center justify-center hover:bg-[#1d4ed8] text-white transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
                title="Send query"
              >
                <ArrowUp className="w-4 h-4 text-white stroke-[2.5]" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Feature Highlights / Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 w-full max-w-[800px] relative z-10"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/80 shadow-xs flex items-center justify-center shrink-0 border border-blue-100/60">
              <ShieldCheck className="w-5 h-5 text-[#2563eb]" />
            </div>
            <div className="flex flex-col leading-tight text-left">
              <span className="text-sm font-semibold text-[#0f172a]">Evidence-Based</span>
              <span className="text-xs text-[#64748b]">Trusted medical sources</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/80 shadow-xs flex items-center justify-center shrink-0 border border-blue-100/60">
              <Brain className="w-5 h-5 text-[#2563eb]" />
            </div>
            <div className="flex flex-col leading-tight text-left">
              <span className="text-sm font-semibold text-[#0f172a]">AI-Powered</span>
              <span className="text-xs text-[#64748b]">Advanced reasoning</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/80 shadow-xs flex items-center justify-center shrink-0 border border-blue-100/60">
              <Lock className="w-5 h-5 text-[#2563eb]" />
            </div>
            <div className="flex flex-col leading-tight text-left">
              <span className="text-sm font-semibold text-[#0f172a]">Private & Secure</span>
              <span className="text-xs text-[#64748b]">Your data is protected</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
