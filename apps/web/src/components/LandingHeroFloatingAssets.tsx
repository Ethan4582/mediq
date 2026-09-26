"use client";

import { motion } from "framer-motion";

export default function LandingHeroFloatingAssets() {
  return (
    <>
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute hidden lg:block left-[10%] top-[28%] w-16 h-16 opacity-85 z-0 pointer-events-none"
      >
        <img src="/r1.png" alt="" className="w-full h-full object-contain drop-shadow-md" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute hidden lg:block left-[16%] top-[60%] w-20 h-20 opacity-75 z-0 pointer-events-none"
      >
        <img src="/r2.png" alt="" className="w-full h-full object-contain drop-shadow-md" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute hidden lg:block right-[12%] top-[24%] w-16 h-16 opacity-85 z-0 pointer-events-none"
      >
        <img src="/r3.png" alt="" className="w-full h-full object-contain drop-shadow-md" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute hidden lg:block right-[14%] top-[54%] w-[88px] h-[88px] opacity-75 z-0 pointer-events-none"
      >
        <img src="/r4.png" alt="" className="w-full h-full object-contain drop-shadow-md" />
      </motion.div>
    </>
  );
}
