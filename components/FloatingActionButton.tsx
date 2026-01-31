"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function FloatingActionButton() {
    const [isVisible, setIsVisible] = useState(false);
    const pathname = usePathname();

    // Hide on login/signup pages if needed, or keeping it global is fine.
    // Usually we don't want it on the "Sell" page itself to avoid redundancy/confusion? 
    // User said "remove buttons from all page", implying this replaces them.
    // Let's hide it on the '/sell' listing form itself so it doesn't separate.
    const shouldHide = pathname === '/sell' || pathname === '/login' || pathname === '/signup';

    useEffect(() => {
        const handleScroll = () => {
            // Optional: Hide on scroll down, show on scroll up logic like Gmail?
            // For now, keep it simple: always visible
            setIsVisible(true); 
        };
        
        // Simple animation on mount
        setIsVisible(true);
    }, []);

    if (shouldHide) return null;

    return (
        <div className={`fixed bottom-20 md:bottom-10 right-6 md:right-10 z-[60] transition-all duration-500 ease-out ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-75'}`}>
            <Link href="/sell">
                <div 
                    className="group relative flex items-center gap-3 bg-primary text-primary-foreground pl-4 pr-6 py-4 rounded-2xl md:rounded-full shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 hover:-translate-y-1 active:scale-95 cursor-pointer"
                >
                    <Plus size={28} className="transition-transform duration-500 group-hover:rotate-90" />
                    <span className="font-semibold text-base tracking-wide hidden md:block">List Book</span>
                    <span className="font-semibold text-base tracking-wide md:hidden">Sell</span>
                    
                    {/* Ripple/Glow effect */}
                    <div className="absolute inset-0 rounded-2xl md:rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all scale-100 group-hover:scale-105 opacity-0 group-hover:opacity-100"></div>
                </div>
            </Link>
        </div>
    );
}
