"use client";

import { Button } from './ui/Button';
import { useEffect, useState } from 'react';
import ValuePropositionCarousel from './ValuePropositionCarousel';
import { Download, Search, BookOpen, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { usePWA } from '@/context/PWAContext';
import { useRouter } from 'next/navigation';


export default function Hero() {
    const { isInstallable, promptInstall } = usePWA();
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    const handleInstallClick = async () => {
        await promptInstall();
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/explore?q=${encodeURIComponent(searchQuery)}`);
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
            {/* Professional Clean Background */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-background to-background opacity-80"></div>
            <div className="absolute inset-0 -z-10 bg-background">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-slate-400/5 blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gray-400/5 blur-[100px]"></div>
                <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-slate-300/10 blur-[80px]"></div>
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.015] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
            </div>

            <div className="container mx-auto px-4 md:px-6 z-10 flex flex-col items-center max-w-5xl">
                
                {/* 1. Value Proposition (Replaces Carousel) */}
                {/* 1. Value Proposition (Replaces Carousel) */}
                <ValuePropositionCarousel />

                {/* 2. Enhanced Search Bar - Functional Utility */}
                <div className="w-full max-w-2xl mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
                    <form onSubmit={handleSearch} className="relative group w-full">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative flex items-center bg-card border border-border shadow-xl shadow-primary/10 rounded-full overflow-hidden p-1.5 transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                            <div className="pl-4 text-muted-foreground">
                                <Search size={20} />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search by title, author, or ISBN..." 
                                className="w-full py-3 px-3 bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground/70 text-base"
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
                                className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-primary text-primary-foreground shadow-sm shrink-0"
                            >
                                <Search size={20} />
                            </Button>
                        </div>
                    </form>
                    <div className="flex justify-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span>Popular:</span>
                        <button onClick={() => router.push('/explore?q=Engineering')} className="hover:text-primary transition-colors hover:underline">Engineering</button>
                        <button onClick={() => router.push('/explore?q=Medical')} className="hover:text-primary transition-colors hover:underline">Medical</button>
                        <button onClick={() => router.push('/explore?q=Fiction')} className="hover:text-primary transition-colors hover:underline">Fiction</button>
                    </div>
                </div>

                {/* 3. Browse Categories Grid - Fills "Empty" Space with Utility */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-12 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
                    {FEATURED_CATEGORIES.map((cat) => (
                        <Link key={cat.name} href={`/explore?genre=${cat.name}`} className="group">
                            <div className="h-full bg-card hover:bg-muted/50 border border-border rounded-xl p-4 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/20 cursor-pointer">
                                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.icon}</span>
                                <h3 className="font-semibold text-foreground">{cat.name}</h3>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1">{cat.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* 4. Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-400 w-full sm:w-auto mb-16">
                    {isInstallable && (
                        <Button 
                            onClick={handleInstallClick}
                            variant="secondary" 
                            size="lg" 
                            className="w-full sm:w-auto min-w-[180px] h-14 gap-2 bg-card text-foreground border border-border hover:bg-muted hover:border-muted-foreground/30 shadow-sm transition-all hover:scale-[1.02] rounded-xl"
                        >
                            <Download size={18} />
                            Install App
                        </Button>
                    )}
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
