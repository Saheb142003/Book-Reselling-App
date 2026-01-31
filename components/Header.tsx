"use client";

import Link from 'next/link';
import { Button } from './ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { 
    Home, 
    Compass, 
    PlusCircle, 
    LayoutDashboard, 
    User, 
    LogOut, 
    Settings, 
    ShoppingBag,
    Wallet
} from 'lucide-react';

export default function Header() {
    const { user, loading, logout } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);

        // Click outside listener
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);

        // Scroll listener for mobile hide/show
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
                setIsVisible(false); // Scrolling down
            } else {
                setIsVisible(true); // Scrolling up
            }
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const handleLogout = async () => {
        await logout();
        setIsDropdownOpen(false);
    };

    const navLinks = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Explore', href: '/explore', icon: Compass },
        { name: 'Sell', href: '/sell', icon: PlusCircle },
    ];

    // if (pathname?.startsWith('/admin')) return null; // Enabled Header for Admin Pages

    return (
        <header 
            className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border transition-all duration-300 shadow-sm
                ${isVisible ? 'translate-y-0' : '-translate-y-full md:translate-y-0'}
            `}
        >
            <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="text-xl md:text-2xl font-bold tracking-tighter text-foreground flex items-center gap-2">
                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">BookExchange</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link 
                                key={link.name} 
                                href={link.href}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2
                                    ${isActive 
                                        ? 'bg-primary/10 text-primary' 
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                    }
                                `}
                            >
                                <Icon size={16} />
                                {link.name}
                            </Link>
                        );
                    })}
                    {user?.role === 'admin' && (
                        <Link 
                            href="/admin"
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2
                                ${pathname.startsWith('/admin')
                                    ? 'bg-yellow-500/10 text-yellow-600' 
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                }
                            `}
                        >
                            <LayoutDashboard size={16} />
                            Admin
                        </Link>
                    )}
                </nav>

                {/* User Section */}
                <div className="flex items-center gap-4">
                    {!mounted || loading ? (
                        // Skeleton Loader
                        <div className="flex items-center gap-4 animate-pulse">
                            <div className="h-9 w-20 bg-muted/20 rounded-md hidden sm:block"></div>
                            <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-muted/20"></div>
                        </div>
                    ) : user ? (
                        <div className="flex items-center gap-4 animate-in fade-in duration-300">
                            {/* Mobile Profile Icon */}
                            <Link href="/profile" className="md:hidden">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary border border-primary/20">
                                    {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                                </div>
                            </Link>

                            {/* Desktop User Dropdown */}
                            <div className="relative hidden md:block" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none group"
                                >
                                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary border border-primary/20 group-hover:shadow-md transition-all">
                                        {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                        {user.displayName?.split(' ')[0]}
                                    </span>
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-card border border-border shadow-xl py-2 animate-in fade-in zoom-in-95 duration-200 z-[100] origin-top-right ring-1 ring-black/5">
                                        <div className="px-4 py-3 border-b border-border/50 bg-muted/30">
                                            <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">Signed in as</p>
                                            <p className="text-sm font-semibold truncate text-foreground">{user.displayName || "User"}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                        </div>

                                        <div className="py-2">
                                            <Link
                                                href="/account"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                <User size={16} />
                                                My Account
                                            </Link>
                                            <Link
                                                href="/sell"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                <PlusCircle size={16} />
                                                List a Book
                                            </Link>
                                            <Link
                                                href="/exchanges"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                <LayoutDashboard size={16} />
                                                Dashboard
                                            </Link>
                                            {/* Wallet Link Removed as per request */}
                                        </div>

                                        <div className="border-t border-border/50 mt-1 pt-1">
                                            <button
                                                onClick={handleLogout}
                                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                                            >
                                                <LogOut size={16} />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 animate-in fade-in duration-300">
                            <Link href="/login">
                                <Button variant="ghost" size="sm" className="text-foreground hover:bg-muted/50 hover:text-primary transition-colors h-9 px-4 font-medium">
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/signup">
                                <Button size="sm" className="shadow-md bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-5 font-medium rounded-full transition-all hover:shadow-lg hover:-translate-y-0.5">
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
