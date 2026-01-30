"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();

    // Listener
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Desktop: Simple Fade
  // Mobile: Modern Pop/Fade Up
  const variants = {
    enter: {
      opacity: 0,
      y: isMobile ? 20 : 0,
      scale: isMobile ? 0.98 : 1,
    },
    center: {
      zIndex: 1,
      opacity: 1,
      y: 0,
      scale: 1,
    },
    exit: {
      zIndex: 0,
      opacity: 0,
      y: isMobile ? -20 : 0,
      scale: isMobile ? 0.98 : 1,
    }
  };

  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <div className="flex-grow flex flex-col overflow-hidden relative">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={pathname}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.3
          }}
          className="flex-grow flex flex-col w-full h-full bg-gradient-main"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
