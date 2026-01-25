"use client";

import { Button } from './ui/Button';
import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import Link from 'next/link';
import { usePWA } from '@/context/PWAContext';

export default function Hero() {
    const { isInstallable, promptInstall } = usePWA();

    const handleInstallClick = async () => {
        await promptInstall();
    };

    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 pb-10 md:pt-32 md:pb-20 bg-white">
            {/* Light Theme Background */}
            <div className="absolute inset-0 -z-10 bg-white">
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-accent/5 blur-[100px] animate-pulse-slow delay-1000"></div>
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] bg-center [mask-image:linear-gradient(180deg,black,rgba(255,255,255,0))]"></div>
            </div>

            <div className="container mx-auto px-4 md:px-6 text-center z-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-8 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    The Future of Book Exchange
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 text-gray-900 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    Give Old Books <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">New Life</span>
                </h1>

                <p className="max-w-xl mx-auto text-lg md:text-xl text-gray-600 mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
                    Join thousands of readers trading books effortlessly. 
                    Sustainable, fast, and community-driven.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
                    <Link href="/sell" className="w-full sm:w-auto">
                        <Button size="lg" className="w-full min-w-[160px] h-12 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105">
                            Start Exchanging
                        </Button>
                    </Link>
                    <Link href="/browse" className="w-full sm:w-auto">
                        <Button variant="outline" size="lg" className="w-full min-w-[160px] h-12 text-base font-semibold border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all">
                            Explore Books
                        </Button>
                    </Link>
                    
                    {isInstallable && (
                        <Button 
                            onClick={handleInstallClick}
                            variant="secondary" 
                            size="lg" 
                            className="w-full sm:w-auto min-w-[160px] h-12 gap-2 bg-green-600 text-white hover:bg-green-500 border-green-500 shadow-lg shadow-green-900/20"
                        >
                            <Download size={18} />
                            Install App
                        </Button>
                    )}
                </div>

                {/* Stats */}
                <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 border-t border-gray-100 pt-10 animate-in fade-in duration-1000 delay-500">
                    {[
                        { label: 'Active Readers', value: '10K+' },
                        { label: 'Books Exchanged', value: '50K+' },
                        { label: 'Trees Saved', value: '100+' },
                        { label: 'Rating', value: '4.9/5' },
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col gap-1 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                            <span className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</span>
                            <span className="text-xs md:text-sm text-gray-500 uppercase tracking-wider">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
