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
        <header className="fixed top-0 left-0 right-0 z-50 glass-nav transition-all duration-300 border-b border-white/5">
            <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
                <Link href="/" className="text-xl md:text-2xl font-bold tracking-tighter text-white flex items-center gap-2">
                    {/* Mobile Logo Icon could go here if needed */}
                    <span>Book<span className="text-accent">Exchange</span></span>
                </Link>

                {/* Desktop Nav */}
                {user && (
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/browse" className="text-sm font-medium text-gray-200 hover:text-white transition-colors">
                            Explore Books
                        </Link>
                        <Link href="/how-it-works" className="text-sm font-medium text-gray-200 hover:text-white transition-colors">
                            How it Works
                        </Link>
                    </nav>
                )}

                <div className="flex items-center gap-4">
                    {!mounted || loading ? (
                        // Skeleton Loader for User Section
                        <div className="flex items-center gap-4 animate-pulse">
                            <div className="h-9 w-20 bg-white/10 rounded-md hidden sm:block"></div>
                            <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-white/10"></div>
                        </div>
                    ) : user ? (
                        <div className="flex items-center gap-4 animate-in fade-in duration-300">
                            <Link href="/sell" className="hidden md:block">
                                <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                                    Sell Book
                                </Button>
                            </Link>

                            {/* User Profile Pic - Visible on Mobile now */}
                            <Link href="/profile" className="md:hidden">
                                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white border border-white/20">
                                    {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                                </div>
                            </Link>

                            {/* Desktop User Dropdown */}
                            <div className="relative hidden md:block" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
                                >
                                    <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white border border-white/20">
                                        {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-white">
                                        {user.displayName?.split(' ')[0]}
                                    </span>
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#1a252f] border border-white/10 shadow-xl py-1 animate-in fade-in zoom-in-95 duration-200 z-[100] origin-top-right">
                                        <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                                            <p className="text-xs text-gray-400 mb-1">Signed in as</p>
                                            <p className="text-sm font-semibold truncate text-white">{user.displayName || "User"}</p>
                                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                        </div>

                                        <Link
                                            href="/profile"
                                            className="block px-4 py-2 text-sm text-gray-200 hover:bg-white/10 transition-colors"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            My Profile
                                        </Link>
                                        <Link
                                            href="/sell"
                                            className="block px-4 py-2 text-sm text-gray-200 hover:bg-white/10 transition-colors"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            List a Book
                                        </Link>
                                        <Link
                                            href="/exchanges"
                                            className="block px-4 py-2 text-sm text-gray-200 hover:bg-white/10 transition-colors"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            My Exchanges
                                        </Link>

                                        {user.role === 'admin' && (
                                            <Link
                                                href="/admin"
                                                className="block px-4 py-2 text-sm text-yellow-400 hover:bg-white/10 transition-colors font-medium"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                Admin Dashboard
                                            </Link>
                                        )}

                                        <div className="border-t border-white/10 mt-1 pt-1">
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                            >
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
                                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white h-8 px-3 text-xs md:text-sm md:h-9 md:px-4">
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/signup">
                                <Button size="sm" className="shadow-sm bg-primary text-white hover:bg-primary/90 border border-white/10 h-8 px-3 text-xs md:text-sm md:h-9 md:px-4">
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
