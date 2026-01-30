"use client";

import { Button } from './ui/Button';
import { useEffect, useState } from 'react';
import { Download, Search, BookOpen, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePWA } from '@/context/PWAContext';
import { useRouter } from 'next/navigation';
import HeroCarousel from './HeroCarousel';

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

    const QUICK_GENRES = [
        { name: "Fiction", color: "bg-blue-100 text-blue-700 border-blue-200" },
        { name: "Textbook", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
        { name: "Sci-Fi", color: "bg-purple-100 text-purple-700 border-purple-200" },
        { name: "Mystery", color: "bg-amber-100 text-amber-700 border-amber-200" },
    ];

    return (
        <section className="relative min-h-[90dvh] flex items-center justify-center overflow-hidden pt-24 pb-10 md:pt-32 md:pb-20 bg-background">
            {/* Blue/White Theme Background */}
            <div className="absolute inset-0 -z-10 bg-background">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-400/10 blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/10 blur-[80px] animate-pulse-slow delay-1000"></div>
                <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-amber-400/5 blur-[60px] animate-pulse-slow delay-500"></div>
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
            </div>

            <div className="container mx-auto px-4 md:px-6 text-center z-10 flex flex-col items-center">
                
                <HeroCarousel />

                {/* Search Bar */}
                <div className="w-full max-w-md mb-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
                    <form onSubmit={handleSearch} className="relative group">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative flex items-center bg-card border border-border rounded-full shadow-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                            <Search className="ml-4 text-muted-foreground" size={20} />
                            <input 
                                type="text" 
                                placeholder="Search for a book..." 
                                className="w-full py-3 px-3 bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Button type="submit" size="sm" className="mr-1 rounded-full px-6">
                                Search
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Quick Genre Chips */}
                <div className="flex flex-wrap justify-center gap-2 mb-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-400">
                    {QUICK_GENRES.map((genre) => (
                        <Link key={genre.name} href={`/explore?genre=${genre.name}`}>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${genre.color} hover:opacity-80 transition-opacity cursor-pointer`}>
                                {genre.name}
                            </span>
                        </Link>
                    ))}
                    <Link href="/explore">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border hover:bg-muted/80 transition-colors cursor-pointer flex items-center gap-1">
                            View All <BookOpen size={10} />
                        </span>
                    </Link>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500 w-full sm:w-auto">
                    <Link href="/sell" className="w-full sm:w-auto">
                        <Button size="lg" className="w-full sm:w-auto min-w-[160px] h-12 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105 bg-primary text-primary-foreground hover:bg-primary/90">
                            Start Exchanging
                        </Button>
                    </Link>
                    
                    {isInstallable && (
                        <Button 
                            onClick={handleInstallClick}
                            variant="secondary" 
                            size="lg" 
                            className="w-full sm:w-auto min-w-[160px] h-12 gap-2 bg-success text-white hover:bg-success/90 border-success shadow-lg shadow-success/20 animate-pulse-subtle"
                        >
                            <Download size={18} />
                            Install App
                        </Button>
                    )}
                </div>

                {/* Stats */}
                <div className="mt-16 w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 border-t border-border pt-10 animate-in fade-in duration-1000 delay-700">
                    {[
                        { label: 'Active Readers', value: '10K+' },
                        { label: 'Books Exchanged', value: '50K+' },
                        { label: 'Trees Saved', value: '100+' },
                        { label: 'Rating', value: '4.9/5' },
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col gap-1 p-4 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
                            <span className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</span>
                            <span className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
