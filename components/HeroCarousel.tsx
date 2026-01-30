"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const SLIDES = [
    {
        id: 1,
        image: "/hero-1.png",
        title: "Book Exchange",
        subtitle: "New Life",
        description: "Join thousands of readers trading books effortlessly. Sustainable, fast, and community-driven."
    },
    {
        id: 2,
        image: "/hero-2.png",
        title: "Discover Magic",
        subtitle: "In Every Page",
        description: "Find hidden gems and rare editions. Every book has a story waiting to be shared."
    },
    {
        id: 3,
        image: "/hero-3.png",
        title: "Connect & Share",
        subtitle: "With Readers",
        description: "Build a community of book lovers. Exchange stories, ideas, and knowledge."
    }
];

export default function HeroCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full max-w-4xl mx-auto h-[400px] md:h-[500px] flex items-center justify-center mb-8">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
                >
                    {/* Image */}
                    <div className="relative w-72 h-72 md:w-96 md:h-96 mb-6 drop-shadow-2xl">
                        <Image
                            src={SLIDES[currentIndex].image}
                            alt={SLIDES[currentIndex].title}
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>

                    {/* Text */}
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-foreground">
                        {SLIDES[currentIndex].title} <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                            {SLIDES[currentIndex].subtitle}
                        </span>
                    </h1>

                    <p className="max-w-xl mx-auto text-base md:text-lg text-muted-foreground leading-relaxed">
                        {SLIDES[currentIndex].description}
                    </p>
                </motion.div>
            </AnimatePresence>

            {/* Indicators */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
                {SLIDES.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === currentIndex ? "bg-primary w-6" : "bg-primary/20 hover:bg-primary/40"
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
