"use client";

import { Button } from './ui/Button';
import { useEffect, useState } from 'react';
import ValuePropositionCarousel from './ValuePropositionCarousel';
import { Search, BookOpen, Sparkles, X } from 'lucide-react';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function Hero() {
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();



    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const FEATURED_CATEGORIES = [
        { name: "Engineering", icon: "⚙️", desc: "Textbooks & Manuals" },
        { name: "Medical", icon: "🩺", desc: "Anatomy & Guides" },
        { name: "Fiction", icon: "📚", desc: "Bestsellers & Classics" },
        { name: "Competitive", icon: "🎯", desc: "Exam Prep" },
    ];

    return (
        <section className="relative min-h-[90dvh] flex items-center justify-center overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24 bg-background">
            <div className="container mx-auto px-4 md:px-6 z-10 flex flex-col items-center max-w-5xl">
                
                {/* 1. Value Proposition (Replaces Carousel) */}
                <ValuePropositionCarousel />

                {/* 2. Enhanced Search Bar - Functional Utility */}
                <div className="w-full max-w-2xl mb-12">
                    <form onSubmit={handleSearch} className="relative w-full">
                        <div className="relative flex items-center bg-card border border-border rounded-lg p-1.5 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                            <div className="pl-3 text-muted-foreground">
                                <Search size={20} />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search by title, author, or ISBN..." 
                                className="w-full py-2.5 px-3 bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground/70 text-base"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button 
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    className="p-2 mr-1 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            )}
                            <Button 
                                type="submit" 
                                size="sm" 
                                className="h-9 px-4 shrink-0 rounded-md"
                            >
                                Search
                            </Button>
                        </div>
                    </form>
                    <div className="flex justify-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span>Popular:</span>
                        <button onClick={() => navigate('/explore?q=Engineering')} className="hover:text-primary transition-colors hover:underline">Engineering</button>
                        <button onClick={() => navigate('/explore?q=Medical')} className="hover:text-primary transition-colors hover:underline">Medical</button>
                        <button onClick={() => navigate('/explore?q=Fiction')} className="hover:text-primary transition-colors hover:underline">Fiction</button>
                    </div>
                </div>

                {/* 3. Browse Categories Grid - Fills "Empty" Space with Utility */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-12">
                    {FEATURED_CATEGORIES.map((cat) => (
                        <Link key={cat.name} to={`/explore?genre=${cat.name}`} className="group">
                            <div className="h-full bg-card hover:bg-muted border border-border rounded-lg p-4 flex flex-col items-center text-center transition-all duration-150 cursor-pointer">
                                <span className="text-3xl mb-2">{cat.icon}</span>
                                <h3 className="font-semibold text-foreground">{cat.name}</h3>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1">{cat.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>



                {/* 5. Stats Section (Refined) */}
                <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 border-t border-border pt-10 animate-in fade-in duration-1000 delay-500">
                    {[
                        { label: 'Active Learners', value: '12K+' },
                        { label: 'Books Listed', value: '85K+' },
                        { label: 'Money Saved', value: '₹50L+' },
                        { label: 'Community Rating', value: '4.9/5' },
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col items-center justify-center p-4">
                            <span className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">{stat.value}</span>
                            <span className="text-xs md:text-sm text-muted-foreground font-medium uppercase tracking-wider mt-1">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
