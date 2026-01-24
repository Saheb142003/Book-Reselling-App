"use client";

import { Button } from './ui/Button';
import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

export default function Hero() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstallable, setIsInstallable] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            setDeferredPrompt(null);
            setIsInstallable(false);
        }
    };

    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>

            <div className="container mx-auto px-6 text-center">
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8 backdrop-blur-sm">
                    <span>✨ The Future of Book Exchange</span>
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                    Give Your Old Books <br />
                    <span className="text-gradient">A New Life</span>
                </h1>

                <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
                    Join the community of readers who buy, sell, and exchange books effortlessly.
                    Sustainable reading starts here.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button size="lg" className="min-w-[180px]">
                        Start Trading
                    </Button>
                    <Button variant="outline" size="lg" className="min-w-[180px]">
                        Explore Collection
                    </Button>
                    
                    {isInstallable && (
                        <Button 
                            onClick={handleInstallClick}
                            variant="secondary" 
                            size="lg" 
                            className="min-w-[180px] gap-2 bg-green-600 text-white hover:bg-green-700 border-green-500"
                        >
                            <Download size={18} />
                            Install App
                        </Button>
                    )}
                </div>

                {/* Stats */}
                <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/5 pt-10">
                    {[
                        { label: 'Active Readers', value: '10K+' },
                        { label: 'Books Exchanged', value: '50K+' },
                        { label: 'Trees Saved', value: '100+' },
                        { label: 'Community Rating', value: '4.9/5' },
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col gap-1">
                            <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                            <span className="text-sm text-muted-foreground">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
