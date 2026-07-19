"use client";

import { useRouter } from "next/navigation";
import { BookOpen, Sparkles, Plus, ChevronDown, Mic, ArrowUp, ShieldCheck, Brain, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ImpactSection } from "@/components/ImpactSection";
import { Footer } from "@/components/Footer";

export default function LandingPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [placeholder, setPlaceholder] = useState("Ask MediQ anything about health, conditions, treatments…");

  const models = [
    { id: 'anthropic', name: 'Claude 3.5 Sonnet', icon: '/anthropic.svg' },
    { id: 'openai', name: 'GPT-4o', icon: '/openai.svg' },
    { id: 'gemini', name: 'Gemini 1.5 Pro', icon: '/gemini.svg' },
    { id: 'groq', name: 'Llama 3', icon: '/groq.svg' }
  ];
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [isModelOpen, setIsModelOpen] = useState(false);

  useEffect(() => {
    const placeholders = [
      "Ask MediQ anything about health, conditions, treatments…",
      "Analyze this patient's lab results…",
      "What are the side effects of Lisinopril?",
      "Summarize this clinical trial protocol…"
    ];
    let i = 0;
    let isDeleting = false;
    let text = "";
    let timer: NodeJS.Timeout;

    const type = () => {
      const fullText = placeholders[i];
      if (isDeleting) {
        text = fullText.substring(0, text.length - 1);
      } else {
        text = fullText.substring(0, text.length + 1);
      }
      setPlaceholder(text);

      let typeSpeed = isDeleting ? 20 : 50;

      if (!isDeleting && text === fullText) {
        typeSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && text === "") {
        isDeleting = false;
        i = (i + 1) % placeholders.length;
        typeSpeed = 500;
      }

      timer = setTimeout(type, typeSpeed);
    };

    timer = setTimeout(type, 500);
    return () => clearTimeout(timer);
  }, []);

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
      <nav 
        className="fixed top-4 left-4 right-4 md:left-0 md:right-0 z-50 flex items-center justify-between mx-auto max-w-[600px] bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-200/50 rounded-2xl px-4 py-2.5"
      >
        {/* Left - Logo */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-[28px] h-[28px]">
            <img src="/logo.png" alt="MediQ logo" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Center - Nav Links (Hidden on mobile) */}
        <div className="hidden md:flex flex-1 justify-center items-center gap-8 nav-links">
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
        {/* Gradient transition to white at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent pointer-events-none z-0"></div>
        
        {/* Floating Background Icons */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute hidden lg:block left-[10%] top-[30%] w-16 h-16 opacity-80"
        >
          <img src="/r1.png" alt="" className="w-full h-full object-contain drop-shadow-md" />
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute hidden lg:block left-[18%] top-[65%] w-20 h-20 opacity-70"
        >
          <img src="/r2.png" alt="" className="w-full h-full object-contain drop-shadow-md" />
        </motion.div>

        <motion.div 
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute hidden lg:block right-[12%] top-[25%] w-16 h-16 opacity-80"
        >
          <img src="/r3.png" alt="" className="w-full h-full object-contain drop-shadow-md" />
        </motion.div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute hidden lg:block right-[15%] top-[55%] w-[90px] h-[90px] opacity-70"
        >
          <img src="/r4.png" alt="" className="w-full h-full object-contain drop-shadow-md" />
        </motion.div>

        {/* Badge pill */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#c7d7fe] bg-white/70 backdrop-blur-sm mt-16 text-sm font-medium text-[#3b5bdb] relative z-10"
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
        <div className="mt-10 w-full max-w-[620px] mx-auto group relative z-10">
          <div 
            className="rounded-[18px] p-[18px_20px_16px_20px] transition-all duration-300 relative bg-[#1e2330]"
            style={{
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
              placeholder={placeholder}
              className="bg-transparent border-none outline-none w-full text-[#94a3b8] text-[0.97rem] placeholder-[#64748b] resize-none overflow-hidden"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2 relative">
                {/* Left - + button */}
                <button onClick={handleSend} className="w-8 h-8 rounded-full bg-[#2d3348] flex items-center justify-center text-[#94a3b8] hover:bg-[#363d56] transition-all shrink-0">
                  <Plus className="w-4 h-4" />
                </button>

                {/* Left - Model selector */}
                <div 
                  onClick={() => setIsModelOpen(!isModelOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2d3348] text-sm font-medium text-[#94a3b8] cursor-pointer hover:bg-[#363d56] transition-all"
                >
                  <img src={selectedModel.icon} alt={selectedModel.name} className="w-4 h-4" />
                  <span>{selectedModel.name}</span>
                  <ChevronDown className={`w-3.5 h-3.5 ml-1 text-[#64748b] transition-transform ${isModelOpen ? 'rotate-180' : ''}`} />
                </div>
                
                {/* Dropdown Menu */}
                {isModelOpen && (
                  <div className="absolute bottom-full left-10 mb-2 w-48 bg-[#1e2330] border border-gray-700 rounded-xl shadow-xl overflow-hidden z-50">
                    {models.map(m => (
                      <div 
                        key={m.id}
                        onClick={() => { setSelectedModel(m); setIsModelOpen(false); }}
                        className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-[#2d3348] cursor-pointer transition-colors text-sm text-[#e2e8f0]"
                      >
                        <img src={m.icon} alt={m.name} className="w-4 h-4" />
                        {m.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right - Submit button */}
              <div className="flex items-center gap-2 shrink-0">
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
        <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 trust-row w-full max-w-[800px] relative z-10">
          
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
