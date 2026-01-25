"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";

const NAV_ORDER = ["/", "/browse", "/exchanges", "/account"];

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    position: "absolute" as const,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    position: "relative" as const,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    position: "absolute" as const,
  })
};

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [direction, setDirection] = useState(0);
  const prevPathRef = useRef(pathname);
  
  // Touch handling state
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    const prevPath = prevPathRef.current;
    const prevIndex = NAV_ORDER.indexOf(prevPath);
    const currIndex = NAV_ORDER.indexOf(pathname);

    if (prevIndex !== -1 && currIndex !== -1) {
      setDirection(currIndex > prevIndex ? 1 : -1);
    } else {
      setDirection(0);
    }

    prevPathRef.current = pathname;
  }, [pathname]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    const currIndex = NAV_ORDER.indexOf(pathname);
    if (currIndex === -1) return; // Not a main nav page

    if (isLeftSwipe && currIndex < NAV_ORDER.length - 1) {
      // Go to next page
      router.push(NAV_ORDER[currIndex + 1]);
    }

    if (isRightSwipe && currIndex > 0) {
      // Go to prev page
      router.push(NAV_ORDER[currIndex - 1]);
    }

    // Reset
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdminPage && <Header />}
      <div 
        className="flex-grow flex flex-col overflow-hidden relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={pathname}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="flex-grow flex flex-col w-full h-full bg-gradient-main"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
