"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Book, BookOpen, Scissors, PenTool, Palette, Heart, Sparkles, GraduationCap } from "lucide-react";

const SLIDES = [
    {
        title: <>Give Your Books <br className="hidden md:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">A Second Life.</span></>,
        desc: "Buy, sell, and exchange used textbooks and novels instantly. Save money and the planet with CehPoint's trusted community."
    },
    {
        title: <>Unlock Knowledge <br className="hidden md:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-orange-900">For Less.</span></>,
        desc: "Find affordable textbooks and study materials directly from peers. Quality education shouldn't cost a fortune."
    },
    {
        title: <>Turn Old Pages <br className="hidden md:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Into New Value.</span></>,
        desc: "Declutter your shelves and earn money by selling books you no longer need. Join the circular economy."
    }
];

const BACKGROUND_ICONS = [
    { Icon: Book, color: "text-blue-500", top: "10%", left: "5%", size: 30, delay: 0 },
    { Icon: Scissors, color: "text-pink-500", top: "20%", right: "10%", size: 24, delay: 1 },
    { Icon: PenTool, color: "text-amber-500", bottom: "15%", left: "15%", size: 28, delay: 2 },
    { Icon: Palette, color: "text-purple-500", top: "40%", right: "5%", size: 32, delay: 0.5 },
    { Icon: BookOpen, color: "text-emerald-500", bottom: "25%", right: "20%", size: 36, delay: 1.5 },
    { Icon: Sparkles, color: "text-yellow-400", top: "15%", left: "25%", size: 20, delay: 0.8 },
    { Icon: GraduationCap, color: "text-indigo-500", bottom: "10%", left: "40%", size: 34, delay: 2.2 },
    { Icon: Heart, color: "text-red-400", top: "50%", left: "10%", size: 22, delay: 1.2 },
];

const variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 100 : -100,
        opacity: 0
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1
    },
    exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? 100 : -100,
        opacity: 0
    })
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
};

export default function ValuePropositionCarousel() {
    const [[page, direction], setPage] = useState([0, 0]);
    const currentIndex = Math.abs(page % SLIDES.length);

    const paginate = useCallback((newDirection: number) => {
        setPage([page + newDirection, newDirection]);
    }, [page]);

    useEffect(() => {
        const timer = setInterval(() => {
            paginate(1);
        }, 3500); // 3.5s to allow reading
        return () => clearInterval(timer);
    }, [paginate]);

    return (
        <div className="relative w-full overflow-hidden rounded-3xl bg-secondary/5 h-[300px] md:h-[350px] mb-10 border border-secondary/10 shadow-inner group">
            
            {/* Animated Background Icons */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {BACKGROUND_ICONS.map((item, i) => (
                    <motion.div
                        key={i}
                        className={`absolute ${item.color} opacity-20`}
                        style={{ 
                            top: item.top, 
                            left: item.left, 
                            right: item.right, 
                            bottom: item.bottom,
                        }}
                        initial={{ y: 0, rotate: 0, opacity: 0.1 }}
                        animate={{ 
                            y: [0, -15, 0], 
                            rotate: [0, 10, -10, 0],
                            opacity: [0.1, 0.3, 0.1]
                        }}
                        transition={{ 
                            duration: 4 + Math.random() * 2, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: item.delay
                        }}
                    >
                        <item.Icon size={item.size} />
                    </motion.div>
                ))}
            </div>

            {/* Carousel Content */}
            <div className="relative z-10 w-full h-full"> 
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={page}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={(e, { offset, velocity }) => {
                            const swipe = swipePower(offset.x, velocity.x);

                            if (swipe < -swipeConfidenceThreshold) {
                                paginate(1);
                            } else if (swipe > swipeConfidenceThreshold) {
                                paginate(-1);
                            }
                        }}
                        className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 cursor-grab active:cursor-grabbing"
                    >
                        <div className="space-y-4 max-w-4xl mx-auto pointer-events-none select-none">
                            <div className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
                                {SLIDES[currentIndex].title}
                            </div>
                            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                                {SLIDES[currentIndex].desc}
                            </p>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Pagination Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {SLIDES.map((_, index) => (
                    <motion.button
                        key={index}
                        onClick={() => {
                            const direction = index > currentIndex ? 1 : -1;
                            setPage([index, direction]); // Navigate to specific slide might desync infinite page logic if not careful, but works for simple case.
                            // Better to align page number:
                            // We aren't fully syncing `page` to `index` here nicely with infinite scroll logic, 
                            // but simplest is just reset page to index. 
                            // This might cause jump if we used page for index calc.
                            // With modulo, setting page = index is fine.
                        }}
                        className={`h-2 rounded-full transition-all duration-300 ${
                            index === currentIndex ? "bg-primary w-6" : "bg-primary/20 w-2"
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                    />
                ))}
            </div>
            
            {/* Arrow Navigation (Optional but requested "slideable" often implies manual control too) */}
             <div className="absolute inset-y-0 left-0 flex items-center justify-start pl-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex">
                <button onClick={() => paginate(-1)} className="p-2 rounded-full bg-background/50 hover:bg-background shadow-sm backdrop-blur-sm border border-border">
                    <span className="sr-only">Previous</span>
                    ←
                </button>
            </div>
             <div className="absolute inset-y-0 right-0 flex items-center justify-end pr-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex">
                <button onClick={() => paginate(1)} className="p-2 rounded-full bg-background/50 hover:bg-background shadow-sm backdrop-blur-sm border border-border">
                    <span className="sr-only">Next</span>
                    →
                </button>
            </div>
        </div>
    );
}
