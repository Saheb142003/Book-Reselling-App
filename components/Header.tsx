"use client";

import Link from 'next/link';
import { Button } from './ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useRef } from 'react';

export default function Header() {
    const { user, loading, logout } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);

        // Click outside listener
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        await logout();
        setIsDropdownOpen(false);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 transition-all duration-300">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold tracking-tighter text-gray-900">
                    Book<span className="text-primary">Exchange</span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/browse" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                        Explore Books
                    </Link>
                    <Link href="/how-it-works" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                        How it Works
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    {!mounted || loading ? (
                        // Skeleton Loader for User Section
                        <div className="flex items-center gap-4 animate-pulse">
                            <div className="h-9 w-20 bg-gray-200 rounded-md hidden sm:block"></div>
                            <div className="h-9 w-9 rounded-full bg-gray-200"></div>
                        </div>
                    ) : user ? (
                        <div className="flex items-center gap-4 animate-in fade-in duration-300">
                            <Link href="/sell">
                                <Button size="sm" variant="ghost" className="hidden sm:inline-flex text-gray-700 hover:bg-gray-100 hover:text-primary">
                                    Sell Book
                                </Button>
                            </Link>

                            {/* User Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
                                >
                                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary border border-primary/20">
                                        {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium hidden sm:inline-block text-gray-700">
                                        {user.displayName?.split(' ')[0]}
                                    </span>
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-gray-200 shadow-xl py-1 animate-in fade-in zoom-in-95 duration-200 z-[100] origin-top-right">
                                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                                            <p className="text-xs text-muted-foreground mb-1">Signed in as</p>
                                            <p className="text-sm font-semibold truncate text-gray-900">{user.displayName || "User"}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                        </div>

                                        <Link
                                            href="/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            My Profile
                                        </Link>
                                        <Link
                                            href="/sell"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            List a Book
                                        </Link>
                                        <Link
                                            href="/exchanges"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            My Exchanges
                                        </Link>

                                        <div className="border-t border-gray-100 mt-1 pt-1">
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 animate-in fade-in duration-300">
                            <Link href="/login">
                                <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-gray-700 hover:bg-gray-100">
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/signup">
                                <Button size="sm" className="shadow-sm">
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
