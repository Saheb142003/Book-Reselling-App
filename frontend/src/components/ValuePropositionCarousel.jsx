"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SLIDES = [
    {
        title: <>Give Your Books <br className="hidden md:block" /> <span className="text-primary">A Second Life.</span></>,
        desc: "Buy, sell, and exchange used textbooks and novels instantly. Save money and the planet with our trusted community."
    },
    {
        title: <>Unlock Knowledge <br className="hidden md:block" /> <span className="text-primary">For Less.</span></>,
        desc: "Find affordable textbooks and study materials directly from peers. Quality education shouldn't cost a fortune."
    },
    {
        title: <>Turn Old Pages <br className="hidden md:block" /> <span className="text-primary">Into New Value.</span></>,
        desc: "Declutter your shelves and earn money by selling books you no longer need. Join the circular economy."
    }
];

const variants = {
    enter: (direction) => ({
        x: direction > 0 ? 100 : -100,
        opacity: 0
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1
    },
    exit: (direction) => ({
        zIndex: 0,
        x: direction < 0 ? 100 : -100,
        opacity: 0
    })
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
};

export default function ValuePropositionCarousel() {
    const [[page, direction], setPage] = useState([0, 0]);
    const currentIndex = Math.abs(page % SLIDES.length);

    const paginate = useCallback((newDirection) => {
        setPage([page + newDirection, newDirection]);
    }, [page]);

    useEffect(() => {
        const timer = setInterval(() => {
            paginate(1);
        }, 4000);
        return () => clearInterval(timer);
    }, [paginate]);

    return (
        <div className="relative w-full overflow-hidden rounded-lg bg-muted/30 h-[250px] md:h-[280px] mb-10 border border-border flex flex-col justify-center items-center">
            
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
                        className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 cursor-grab active:cursor-grabbing"
                    >
                        <div className="space-y-3 max-w-4xl mx-auto pointer-events-none select-none">
                            <div className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
                                {SLIDES[currentIndex].title}
                            </div>
                            <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
                                {SLIDES[currentIndex].desc}
                            </p>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Pagination Indicators */}
            <div className="absolute bottom-4 flex gap-1.5 z-20">
                {SLIDES.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            const direction = index > currentIndex ? 1 : -1;
                            setPage([index, direction]);
                        }}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                            index === currentIndex ? "bg-primary w-4" : "bg-primary/20 w-1.5"
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
