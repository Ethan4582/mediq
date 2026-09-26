"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Sparkles, ShieldCheck, Lock, Clock, TrendingDown, Users, CheckCircle2 } from "lucide-react";

export function ImpactSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center mb-10 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-[#eff6ff] text-[#2563eb] text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
            <Sparkles className="w-4 h-4" />
            IMPACT THAT MATTERS
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0f172a] mb-4 sm:mb-6 tracking-tight leading-tight">
            Better insights. Safer decisions.<br className="hidden sm:inline" />{" "}
            <span className="text-[#2563eb]">Measurable impact.</span>
          </h2>
          <p className="text-sm sm:text-lg text-[#475569] max-w-2xl px-2">
            MediQ helps healthcare teams save time, reduce errors, and deliver better patient outcomes.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Top Row: 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-5 sm:mb-6">
            
            {/* Card 1: Accurate & Reliable */}
            <motion.div variants={itemVariants} className="bg-white rounded-[20px] sm:rounded-[24px] p-6 sm:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-[#e2e8f0] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center">
              <div className="relative h-36 sm:h-40 w-full flex items-center justify-center mb-4">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute w-36 sm:w-40 h-20 sm:h-24 rounded-full border border-blue-200/50"
                  style={{ transform: 'rotate(-15deg)' }}
                />
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="absolute w-44 sm:w-48 h-24 sm:h-28 rounded-full border-2 border-[#2563eb]/20"
                />
                
                <div className="text-4xl sm:text-5xl font-bold text-[#2563eb] z-10 relative">
                  100%
                  <motion.div 
                    animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-4 -right-6 text-[#2563eb]"
                  >
                    ✦
                  </motion.div>
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#0f172a] mb-2 sm:mb-3">Accurate & Reliable</h3>
              <p className="text-[#475569] text-xs sm:text-sm mb-5 sm:mb-6 leading-relaxed">
                Built for clinical accuracy with source grounding and hallucination guardrails.
              </p>
              <div className="mt-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#eff6ff] text-[#2563eb] rounded-lg text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Zero guesswork
              </div>
            </motion.div>

            {/* Card 2: Secure by default */}
            <motion.div variants={itemVariants} className="bg-white rounded-[20px] sm:rounded-[24px] p-6 sm:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-[#e2e8f0] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center">
              <div className="relative h-36 sm:h-40 w-full flex items-center justify-center mb-4">
                <motion.div 
                  animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.6, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute w-28 sm:w-32 h-28 sm:h-32 rounded-full bg-blue-100 border border-blue-200"
                />
                <motion.div 
                  animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 3, delay: 0.5, repeat: Infinity }}
                  className="absolute w-20 sm:w-24 h-20 sm:h-24 rounded-full bg-blue-200 border border-blue-300"
                />
                <div className="w-11 sm:w-12 h-14 sm:h-16 rounded-xl border-[2.5px] border-[#2563eb] flex items-center justify-center relative z-10 bg-white">
                  <div className="w-5 sm:w-6 h-5 sm:h-6 border-[2px] border-[#2563eb] rounded-full absolute -top-3" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }}></div>
                  <Lock className="w-4 sm:w-5 h-4 sm:h-5 text-[#2563eb]" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#0f172a] mb-2 sm:mb-3">Secure by default</h3>
              <p className="text-[#475569] text-xs sm:text-sm mb-5 sm:mb-6 leading-relaxed">
                Enterprise-grade security with HIPAA compliance and encryption at every layer.
              </p>
              <div className="mt-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#eff6ff] text-[#2563eb] rounded-lg text-xs font-medium">
                <Lock className="w-3.5 h-3.5" />
                HIPAA Compliant
              </div>
            </motion.div>

            {/* Card 3: Save hours every day */}
            <motion.div variants={itemVariants} className="bg-white rounded-[20px] sm:rounded-[24px] p-6 sm:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-[#e2e8f0] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col relative overflow-hidden group">
              <div className="flex justify-between items-center w-full mb-4 sm:mb-6 relative z-10">
                <div className="w-8 h-8 rounded-full bg-[#eff6ff] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#2563eb]" />
                </div>
                <span className="text-[#475569] text-xs sm:text-sm font-medium mr-auto ml-3">Time saved</span>
                <span className="text-[#2563eb] font-bold text-lg sm:text-xl">78%</span>
              </div>
              
              <div className="h-24 sm:h-28 w-full relative mb-2 overflow-hidden">
                <svg viewBox="0 0 400 100" className="w-full h-full stroke-[#2563eb] fill-none" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradientArea" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  <motion.path 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    d="M0,60 C40,40 80,20 120,40 C160,60 200,40 240,20 C280,0 320,30 360,10 L360,100 L0,100 Z" 
                    className="fill-[url(#gradientArea)] stroke-none" 
                  />
                  
                  <motion.path 
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    d="M0,60 C40,40 80,20 120,40 C160,60 200,40 240,20 C280,0 320,30 360,10" 
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  <motion.circle 
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    cx="360" cy="10" r="4" className="fill-[#2563eb]" 
                  />
                </svg>
              </div>

              <div className="text-center relative z-10 mt-auto">
                <h3 className="text-base sm:text-lg font-bold text-[#0f172a] mb-1 sm:mb-2">Save hours every day</h3>
                <p className="text-[#475569] text-xs sm:text-[13px] mb-4 leading-relaxed">
                  Automate documentation and summaries in minutes — not hours.
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#eff6ff] text-[#2563eb] rounded-lg text-xs font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  Up to 78% time saved
                </div>
              </div>
            </motion.div>

          </div>

          {/* Bottom Row: 2 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mb-6">
            
            {/* Card 4: Reduce clinical risk */}
            <motion.div variants={itemVariants} className="bg-white rounded-[20px] sm:rounded-[24px] p-6 sm:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-[#e2e8f0] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between w-full h-full gap-6 sm:gap-8">
                
                <div className="flex flex-col justify-between max-w-full md:max-w-[240px] z-10">
                  <div>
                    <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-[#eff6ff] flex items-center justify-center mb-4 sm:mb-6">
                      <ShieldCheck className="w-4 sm:w-5 h-4 sm:h-5 text-[#2563eb]" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#0f172a] mb-2 sm:mb-3">Reduce clinical risk</h3>
                    <p className="text-[#475569] text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
                      Detect conflicts, missing information, and medication changes before they become problems.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#eff6ff] text-[#2563eb] rounded-lg text-xs font-medium w-fit">
                    <TrendingDown className="w-3.5 h-3.5" />
                    Fewer errors. Better outcomes.
                  </div>
                </div>

                <div className="flex-1 min-w-0 sm:min-w-[200px] flex flex-col mt-4 md:mt-0">
                  <div className="flex justify-between items-center mb-4 sm:mb-6">
                    <span className="text-xs text-[#64748b] font-medium">Documentation errors</span>
                    <span className="text-xs font-bold text-[#16a34a] bg-[#dcfce7] px-2 py-0.5 rounded-full">-62%</span>
                  </div>
                  
                  <div className="relative flex-1 min-h-[130px] sm:min-h-[140px] w-full mt-2">
                    <div className="absolute left-0 h-full flex flex-col justify-between text-[10px] text-[#94a3b8] font-medium pb-5 z-10">
                      <span>100%</span>
                      <span>75%</span>
                      <span>50%</span>
                      <span>25%</span>
                      <span>0%</span>
                    </div>
                    
                    <div className="absolute left-8 right-0 h-full flex flex-col justify-between pb-5">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-full h-px bg-gray-100"></div>
                      ))}
                    </div>

                    <div className="absolute left-8 right-0 top-1 bottom-5">
                      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="chartGradient2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2"/>
                            <stop offset="100%" stopColor="#2563eb" stopOpacity="0"/>
                          </linearGradient>
                        </defs>
                        
                        <motion.path 
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          transition={{ duration: 1, delay: 0.5 }}
                          d="M0,70 C 30,30 50,60 70,25 C 85,35 95,15 100,10 L100,100 L0,100 Z" 
                          fill="url(#chartGradient2)" 
                          stroke="none"
                        />
                        
                        <motion.path 
                          initial={{ pathLength: 0 }}
                          whileInView={{ pathLength: 1 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          d="M0,70 C 30,30 50,60 70,25 C 85,35 95,15 100,10" 
                          fill="none" 
                          stroke="#2563eb" 
                          strokeWidth="3"
                          strokeLinecap="round"
                          vectorEffect="non-scaling-stroke"
                        />
                        
                        <motion.circle 
                          initial={{ scale: 0, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 1.5 }}
                          cx="100" cy="10" r="4" 
                          className="fill-[#2563eb] stroke-white stroke-[2px]" 
                          vectorEffect="non-scaling-stroke"
                        />
                      </svg>
                    </div>

                    <div className="absolute left-8 right-0 bottom-0 flex justify-between text-[10px] text-[#94a3b8] font-medium">
                      <span>Week 1</span>
                      <span>Week 2</span>
                      <span>Week 3</span>
                      <span>Week 4</span>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>

            {/* Card 5: Trusted by clinicians */}
            <motion.div variants={itemVariants} className="bg-white rounded-[20px] sm:rounded-[24px] p-6 sm:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-[#e2e8f0] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div className="flex flex-col md:flex-row justify-between w-full h-full gap-6 sm:gap-8">
                
                <div className="flex flex-col justify-between max-w-full md:max-w-[240px] z-10">
                  <div>
                    <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-[#eff6ff] flex items-center justify-center mb-4 sm:mb-6">
                      <Users className="w-4 sm:w-5 h-4 sm:h-5 text-[#2563eb]" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#0f172a] mb-2 sm:mb-3">Trusted by clinicians</h3>
                    <p className="text-[#475569] text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
                      Built with clinicians, for clinicians. Designed to fit into real-world workflows.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#eff6ff] text-[#2563eb] rounded-lg text-xs font-medium w-fit">
                    <Users className="w-3.5 h-3.5" />
                    Adopted. Loved. Trusted.
                  </div>
                </div>

                <div className="flex-1 relative flex items-center justify-center py-4 min-w-0 sm:min-w-[220px]">
                  <div className="absolute left-6 sm:left-12 top-6 bottom-6 w-px border-l border-dashed border-gray-300"></div>
                  
                  <div className="flex flex-col gap-5 sm:gap-6 w-full ml-6 sm:ml-4 pl-4 sm:pl-0">
                    
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-3.5 sm:gap-4 relative"
                    >
                      <div className="w-2 h-2 rounded-full bg-gray-300 absolute -left-[27px] sm:-left-[37px]"></div>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-xs shrink-0">
                        <Image unoptimized src="https://i.pravatar.cc/150?img=47" alt="Dr. Sarah W." width={40} height={40} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs sm:text-sm font-semibold text-[#0f172a]">Dr. Sarah W.</span>
                        <span className="text-[10px] sm:text-[11px] text-[#64748b]">Internal Medicine</span>
                      </div>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center gap-3.5 sm:gap-4 relative"
                    >
                      <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-[#2563eb] absolute -left-[32px] sm:-left-[44px] flex items-center justify-center border-2 border-white shadow-xs z-10">
                        <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                      </div>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-xs shrink-0">
                        <Image unoptimized src="https://i.pravatar.cc/150?img=11" alt="Dr. Michael T." width={40} height={40} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs sm:text-sm font-semibold text-[#0f172a]">Dr. Michael T.</span>
                        <span className="text-[10px] sm:text-[11px] text-[#64748b]">Cardiology</span>
                      </div>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex items-center gap-3.5 sm:gap-4 relative"
                    >
                      <div className="w-2 h-2 rounded-full bg-gray-300 absolute -left-[27px] sm:-left-[37px]"></div>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-xs shrink-0">
                        <Image unoptimized src="https://i.pravatar.cc/150?img=44" alt="Dr. Priya K." width={40} height={40} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs sm:text-sm font-semibold text-[#0f172a]">Dr. Priya K.</span>
                        <span className="text-[10px] sm:text-[11px] text-[#64748b]">Pulmonology</span>
                      </div>
                    </motion.div>

                  </div>
                </div>

              </div>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
