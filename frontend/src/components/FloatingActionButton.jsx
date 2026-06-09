"use client";

import { Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function FloatingActionButton() {
    const [isVisible, setIsVisible] = useState(false);
    const location = useLocation();
    const pathname = location.pathname;

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
            <Link to="/sell">
                <div 
                    className="group relative flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-lg border border-border transition-all duration-200 hover:opacity-90 active:scale-95 cursor-pointer shadow-md"
                >
                    <Plus size={20} className="transition-transform duration-300 group-hover:rotate-90" />
                    <span className="font-semibold text-sm tracking-wide hidden md:block">List Book</span>
                    <span className="font-semibold text-sm tracking-wide md:hidden">Sell</span>
                </div>
            </Link>
        </div>
    );
}
