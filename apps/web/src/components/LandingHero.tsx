"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Sparkles, Plus, ChevronDown, ArrowUp, ShieldCheck, Brain, Lock } from "lucide-react";
import { motion } from "framer-motion";
import LandingHeroFloatingAssets from "./LandingHeroFloatingAssets";

const MODELS = [
  { id: "gemini", name: "Gemini 1.5 Pro", icon: "/gemini.svg" },
  { id: "openai", name: "GPT-4o", icon: "/openai.svg" },
  { id: "anthropic", name: "Claude 3.5 Sonnet", icon: "/anthropic.svg" },
  { id: "mistral", name: "Mistral Large", icon: "/mistral.svg" },
  { id: "groq", name: "Llama 3.3 70B", icon: "/groq.svg" },
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
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % PLACEHOLDERS.length;
      setPlaceholder(PLACEHOLDERS[index]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = () => {
    if (!query.trim()) return;
    sessionStorage.setItem("landing_prompt", query);
    sessionStorage.setItem("landing_model", selectedModel.id);
    router.push("/chat/new");
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
    <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-16 px-4 overflow-hidden bg-[#0d1017]">
      <LandingHeroFloatingAssets />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Top Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-950/40 text-blue-300 text-xs font-medium mb-8 backdrop-blur-md"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Next-Gen Clinical AI Intelligence</span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
        >
          Clinical insights,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
            accelerated.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-[#94a3b8] max-w-2xl mb-12 font-normal leading-relaxed"
        >
          Transform messy medical records, handwritten notes, and complex lab charts into structured clinical discharge drafts with full source traceability.
        </motion.p>

        {/* Central Chat Input Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-2xl bg-[#161b26]/90 border border-gray-700/60 hover:border-gray-600/80 rounded-2xl p-4 shadow-2xl backdrop-blur-xl transition-all focus-within:border-blue-500/80 focus-within:ring-4 focus-within:ring-blue-500/10"
        >
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={2}
            className="w-full bg-transparent text-white placeholder-[#64748b] text-base resize-none focus:outline-none leading-relaxed"
          />

          <div className="flex items-center justify-between pt-3 border-t border-gray-800/80 mt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#222838] text-sm font-medium text-[#cbd5e1] hover:bg-[#2c3345] transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#94a3b8]" />
                <span>Upload</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                className="hidden"
                onChange={handleFileUpload}
              />

              {/* Model Dropdown */}
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
                  <div className="absolute bottom-full left-0 mb-2 w-52 bg-[#1e2330] border border-gray-700/80 rounded-xl shadow-2xl overflow-hidden z-50 py-1">
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
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Feature Highlights / Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-8 mt-12 text-sm text-[#94a3b8]"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>HIPAA-Ready Architecture</span>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-400" />
            <span>Multi-Agent Reconciliation</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-400" />
            <span>End-to-End Encrypted BYOK</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
