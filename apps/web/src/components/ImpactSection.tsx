"use client";

import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Lock, Clock, TrendingDown, Users, FileCheck, CheckCircle2 } from "lucide-react";

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
    <section 
      className="relative py-24 px-4 overflow-hidden"
      style={{
        backgroundImage: "url('/hero_bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#eff6ff] text-[#2563eb] text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            IMPACT THAT MATTERS
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#0f172a] mb-6 tracking-tight">
            Better insights. Safer decisions.<br />
            <span className="text-[#2563eb]">Measurable impact.</span>
          </h2>
          <p className="text-lg text-[#475569] max-w-2xl">
            MediQ helps healthcare teams save time, reduce errors,
            and deliver better patient outcomes.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Top Row (3 columns) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            
            {/* Card 1: Accurate & Reliable */}
            <motion.div variants={itemVariants} className="bg-white rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 flex flex-col items-center text-center">
              <div className="relative h-40 w-full flex items-center justify-center mb-4">
                {/* Decorative background elements */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute w-40 h-24 rounded-full border border-blue-200/50"
                  style={{ transform: 'rotate(-15deg)' }}
                />
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="absolute w-48 h-28 rounded-full border-2 border-[#2563eb]/20"
                />
                
                <div className="text-5xl font-bold text-[#2563eb] z-10 relative">
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
              <h3 className="text-xl font-bold text-[#0f172a] mb-3">Accurate & Reliable</h3>
              <p className="text-[#475569] text-sm mb-6 leading-relaxed">
                Built for clinical accuracy with source grounding and hallucination guardrails.
              </p>
              <div className="mt-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#eff6ff] text-[#2563eb] rounded-lg text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Zero guesswork
              </div>
            </motion.div>

            {/* Card 2: Secure by default */}
            <motion.div variants={itemVariants} className="bg-white rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 flex flex-col items-center text-center">
              <div className="relative h-40 w-full flex items-center justify-center mb-4">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute w-32 h-32 rounded-full bg-blue-50 border border-blue-100"
                />
                <motion.div 
                  animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 3, delay: 0.5, repeat: Infinity }}
                  className="absolute w-24 h-24 rounded-full bg-blue-100 border border-blue-200"
                />
                <div className="w-12 h-16 rounded-xl border-[2.5px] border-[#2563eb] flex items-center justify-center relative z-10 bg-white">
                  <div className="w-6 h-6 border-[2px] border-[#2563eb] rounded-full absolute -top-3" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }}></div>
                  <Lock className="w-5 h-5 text-[#2563eb]" />
                </div>
                {/* Decorative dot */}
                <div className="absolute top-8 right-16 w-2 h-2 rounded-full bg-[#2563eb]"></div>
              </div>
              <h3 className="text-xl font-bold text-[#0f172a] mb-3">Secure by default</h3>
              <p className="text-[#475569] text-sm mb-6 leading-relaxed">
                Enterprise-grade security with HIPAA compliance and encryption at every layer.
              </p>
              <div className="mt-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#eff6ff] text-[#2563eb] rounded-lg text-xs font-medium">
                <Lock className="w-3.5 h-3.5" />
                HIPAA Compliant
              </div>
            </motion.div>

            {/* Card 3: Time saved */}
            <motion.div variants={itemVariants} className="bg-white rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 flex flex-col relative overflow-hidden group">
              <div className="flex justify-between items-center w-full mb-6 relative z-10">
                <div className="w-8 h-8 rounded-full bg-[#eff6ff] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#2563eb]" />
                </div>
                <span className="text-[#475569] text-sm font-medium mr-auto ml-3">Time saved</span>
                <span className="text-[#2563eb] font-bold text-xl">78%</span>
              </div>
              
              <div className="h-28 w-full relative -mx-4 mb-2">
                <svg viewBox="0 0 400 100" className="w-[120%] h-full stroke-[#2563eb] fill-none overflow-visible">
                  <defs>
                    <linearGradient id="gradientArea" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Area */}
                  <motion.path 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    d="M0,60 C40,40 80,20 120,40 C160,60 200,40 240,20 C280,0 320,30 360,10 L360,100 L0,100 Z" 
                    className="fill-[url(#gradientArea)] stroke-none" 
                  />
                  
                  {/* Line */}
                  <motion.path 
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    d="M0,60 C40,40 80,20 120,40 C160,60 200,40 240,20 C280,0 320,30 360,10" 
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Point */}
                  <motion.circle 
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    cx="360" cy="10" r="4" className="fill-[#2563eb]" 
                  />
                </svg>
              </div>

              <div className="text-center relative z-10 mt-auto">
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">Save hours every day</h3>
                <p className="text-[#475569] text-[13px] mb-4 leading-relaxed">
                  Automate documentation and summaries in minutes — not hours.
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#eff6ff] text-[#2563eb] rounded-lg text-xs font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  Up to 78% time saved
                </div>
              </div>
            </motion.div>

          </div>

          {/* Middle Row (2 columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            
            {/* Card 4: Reduce clinical risk */}
            <motion.div variants={itemVariants} className="bg-white rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 flex flex-col justify-between relative overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between w-full h-full gap-8">
                
                {/* Left content */}
                <div className="flex flex-col justify-between max-w-[240px] z-10">
                  <div>
                    <div className="w-10 h-10 rounded-full bg-[#eff6ff] flex items-center justify-center mb-6">
                      <ShieldCheck className="w-5 h-5 text-[#2563eb]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0f172a] mb-3">Reduce clinical risk</h3>
                    <p className="text-[#475569] text-sm leading-relaxed mb-6">
                      Detect conflicts, missing information, and medication changes before they become problems.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#eff6ff] text-[#2563eb] rounded-lg text-xs font-medium w-fit">
                    <TrendingDown className="w-3.5 h-3.5" />
                    Fewer errors. Better outcomes.
                  </div>
                </div>

                {/* Right chart */}
                <div className="flex-1 min-w-[200px] flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs text-[#64748b] font-medium">Documentation errors</span>
                    <span className="text-xs font-bold text-[#16a34a] bg-[#dcfce7] px-2 py-0.5 rounded-full">-62%</span>
                  </div>
                  
                  <div className="relative flex-1 min-h-[140px] w-full mt-2">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 h-full flex flex-col justify-between text-[10px] text-[#94a3b8] font-medium pb-5 z-10">
                      <span>100%</span>
                      <span>75%</span>
                      <span>50%</span>
                      <span>25%</span>
                      <span>0%</span>
                    </div>
                    
                    {/* Grid lines */}
                    <div className="absolute left-8 right-0 h-full flex flex-col justify-between pb-5">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-full h-px bg-gray-100"></div>
                      ))}
                    </div>

                    {/* SVG Chart */}
                    <div className="absolute left-8 right-0 top-1 bottom-5">
                      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                        <motion.path 
                          initial={{ pathLength: 0 }}
                          whileInView={{ pathLength: 1 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          d="M0,5 L25,25 L50,45 L75,70 L100,90" 
                          fill="none" 
                          stroke="#2563eb" 
                          strokeWidth="3"
                          vectorEffect="non-scaling-stroke"
                        />
                        {[
                          {x: 0, y: 5}, {x: 25, y: 25}, {x: 50, y: 45}, {x: 75, y: 70}, {x: 100, y: 90}
                        ].map((point, i) => (
                          <motion.circle 
                            key={i}
                            initial={{ scale: 0, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5 + i * 0.15 }}
                            cx={point.x} cy={point.y} r="4" 
                            className="fill-[#2563eb] stroke-white stroke-2" 
                            vectorEffect="non-scaling-stroke"
                          />
                        ))}
                      </svg>
                    </div>

                    {/* X-axis labels */}
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
            <motion.div variants={itemVariants} className="bg-white rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 flex flex-col justify-between">
              <div className="flex flex-col md:flex-row justify-between w-full h-full gap-8">
                
                {/* Left content */}
                <div className="flex flex-col justify-between max-w-[240px] z-10">
                  <div>
                    <div className="w-10 h-10 rounded-full bg-[#eff6ff] flex items-center justify-center mb-6">
                      <Users className="w-5 h-5 text-[#2563eb]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0f172a] mb-3">Trusted by clinicians</h3>
                    <p className="text-[#475569] text-sm leading-relaxed mb-6">
                      Built with clinicians, for clinicians. Designed to fit into real-world workflows.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#eff6ff] text-[#2563eb] rounded-lg text-xs font-medium w-fit">
                    <Users className="w-3.5 h-3.5" />
                    Adopted. Loved. Trusted.
                  </div>
                </div>

                {/* Right Timeline */}
                <div className="flex-1 relative flex items-center justify-center py-4 min-w-[220px]">
                  {/* Vertical dashed line */}
                  <div className="absolute left-12 top-6 bottom-6 w-px border-l border-dashed border-gray-300"></div>
                  
                  <div className="flex flex-col gap-6 w-full ml-4">
                    
                    {/* User 1 */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-4 relative"
                    >
                      <div className="w-2 h-2 rounded-full bg-gray-300 absolute -left-[37px]"></div>
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                        <img src="https://i.pravatar.cc/150?img=47" alt="Dr. Sarah W." className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[#0f172a]">Dr. Sarah W.</span>
                        <span className="text-[11px] text-[#64748b]">Internal Medicine</span>
                      </div>
                    </motion.div>

                    {/* User 2 */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center gap-4 relative"
                    >
                      <div className="w-5 h-5 rounded-full bg-[#2563eb] absolute -left-[44px] flex items-center justify-center border-2 border-white shadow-sm z-10">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                        <img src="https://i.pravatar.cc/150?img=11" alt="Dr. Michael T." className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[#0f172a]">Dr. Michael T.</span>
                        <span className="text-[11px] text-[#64748b]">Cardiology</span>
                      </div>
                    </motion.div>

                    {/* User 3 */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex items-center gap-4 relative"
                    >
                      <div className="w-2 h-2 rounded-full bg-gray-300 absolute -left-[37px]"></div>
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                        <img src="https://i.pravatar.cc/150?img=44" alt="Dr. Priya K." className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[#0f172a]">Dr. Priya K.</span>
                        <span className="text-[11px] text-[#64748b]">Pulmonology</span>
                      </div>
                    </motion.div>

                  </div>
                </div>

              </div>
            </motion.div>

          </div>

          {/* Bottom Row */}
          <motion.div variants={itemVariants} className="w-full bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 flex flex-col lg:flex-row items-center gap-8 justify-between">
            
            <div className="flex items-center gap-5 lg:w-1/3">
              <div className="w-14 h-14 rounded-[16px] bg-[#2563eb] flex items-center justify-center shrink-0 relative overflow-hidden">
                <motion.div 
                  animate={{ rotate: 180 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0"
                />
                <TrendingDown className="w-7 h-7 text-white relative z-10 scale-y-[-1]" />
              </div>
              <p className="font-bold text-[#0f172a] text-[15px] leading-snug">
                Better documentation leads to<br />
                <span className="text-[#2563eb]">better care and better business.</span>
              </p>
            </div>

            <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-6 w-full lg:w-2/3">
              {/* Stat 1 */}
              <div className="flex flex-col flex-1 min-w-[120px]">
                <div className="flex items-center gap-1.5 text-[#2563eb] mb-1">
                  <FileCheck className="w-4 h-4" />
                  <span className="font-bold text-2xl">10x</span>
                </div>
                <span className="text-[#64748b] text-[13px] font-medium">Faster summaries</span>
              </div>
              
              {/* Stat 2 */}
              <div className="flex flex-col flex-1 min-w-[120px]">
                <div className="flex items-center gap-1.5 text-[#2563eb] mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-bold text-2xl">90%</span>
                </div>
                <span className="text-[#64748b] text-[13px] font-medium">Source coverage</span>
              </div>
              
              {/* Stat 3 */}
              <div className="flex flex-col flex-1 min-w-[120px]">
                <div className="flex items-center gap-1.5 text-[#2563eb] mb-1">
                  <Users className="w-4 h-4" />
                  <span className="font-bold text-2xl">70%</span>
                </div>
                <span className="text-[#64748b] text-[13px] font-medium">Less manual effort</span>
              </div>
              
              {/* Stat 4 */}
              <div className="flex flex-col flex-1 min-w-[120px]">
                <div className="flex items-center gap-1.5 text-[#2563eb] mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="font-bold text-2xl">100%</span>
                </div>
                <span className="text-[#64748b] text-[13px] font-medium">Audit-ready</span>
              </div>
            </div>

          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
