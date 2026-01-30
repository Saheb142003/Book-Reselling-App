"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { 
    User, 
    Settings, 
    HelpCircle, 
    Shield, 
    FileText, 
    LogOut, 
    ChevronRight, 
    Download, 
    Bell,
    MapPin,
    Wallet,
    ShoppingBag,
    LayoutDashboard,
    PlusCircle,
    CreditCard,
    Info
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePWA } from "@/context/PWAContext";

export default function AccountPage() {
    const { user, logout, loading } = useAuth();
    const router = useRouter();
    const { isInstallable, promptInstall } = usePWA();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    const handleInstallClick = async () => {
        await promptInstall();
    };

    if (loading || !user) {
        return null; // Or a loading spinner
    }

    const DashboardCard = ({ title, icon: Icon, children, className = "" }: any) => (
        <div className={`bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow ${className}`}>
            <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Icon size={18} />
                </div>
                <h3 className="font-semibold text-foreground">{title}</h3>
            </div>
            {children}
        </div>
    );

    const StatItem = ({ label, value, subtext }: any) => (
        <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</span>
            <span className="text-2xl font-bold text-foreground mt-1">{value}</span>
            {subtext && <span className="text-xs text-muted-foreground">{subtext}</span>}
        </div>
    );

    const MenuLink = ({ icon: Icon, label, href, onClick, danger }: any) => {
        const content = (
            <div className={`flex items-center justify-between py-3 px-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group ${danger ? 'text-red-500 hover:bg-red-50' : 'text-muted-foreground hover:text-foreground'}`}>
                <div className="flex items-center gap-3">
                    <Icon size={18} className={`group-hover:scale-110 transition-transform ${danger ? "text-red-500" : "text-muted-foreground group-hover:text-primary"}`} />
                    <span className="font-medium text-sm">{label}</span>
                </div>
                <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
            </div>
        );

        if (href) return <Link href={href} className="block">{content}</Link>;
        return <div onClick={onClick}>{content}</div>;
    };

    return (
        <div className="min-h-screen bg-muted/30 pb-24 md:pb-10 pt-20">
            <div className="container mx-auto max-w-5xl px-4 md:px-6">
                
                {/* Header Section */}
                <div className="flex flex-row items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Account</h1>
                        <p className="text-muted-foreground hidden md:block">Manage your profile, listings, and settings.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="ghost" 
                            className="bg-red-500 hover:bg-red-600 text-white gap-2 px-4 shadow-sm hover:shadow-md transition-all" 
                            onClick={logout}
                        >
                            <LogOut size={16} />
                            <span className="hidden sm:inline">Sign Out</span>
                        </Button>
                    </div>
                </div>

                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Column 1: Profile & Wallet */}
                    <div className="space-y-6">
                        {/* Admin Card - Visible only to admins */}
                        {user.role === 'admin' && (
                            <DashboardCard title="Admin" icon={Shield} className="border-yellow-500/20 bg-yellow-50/50">
                                <div className="space-y-1">
                                    <MenuLink icon={LayoutDashboard} label="Admin Dashboard" href="/admin" />
                                    <MenuLink icon={FileText} label="Manage Users" href="/admin/users" />
                                    <MenuLink icon={Shield} label="Approvals" href="/admin/approvals" />
                                </div>
                            </DashboardCard>
                        )}

                        {/* Profile Card */}
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-primary/10 to-secondary/10 z-0"></div>
                            <div className="h-24 w-24 rounded-full bg-background p-1 relative z-10 mb-3 shadow-sm">
                                <div className="h-full w-full rounded-full bg-muted/20 relative overflow-hidden">
                                    {user.photoURL ? (
                                        <Image src={user.photoURL} alt={user.displayName || "User"} fill className="object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-3xl font-bold text-muted-foreground">
                                            {user.displayName?.[0] || "U"}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <h2 className="font-bold text-xl text-foreground relative z-10">{user.displayName || "Book Lover"}</h2>
                            <p className="text-sm text-muted-foreground mb-4 relative z-10">{user.email}</p>
                            <div className="flex gap-2 w-full relative z-10">
                                <Link href="/profile" className="flex-1">
                                    <Button variant="outline" className="w-full rounded-full">View Profile</Button>
                                </Link>
                                <Link href="/account/personal-details" className="flex-1">
                                    <Button variant="outline" className="w-full rounded-full">Edit Profile</Button>
                                </Link>
                            </div>
                        </div>

                        {/* Wallet Card */}
                        <DashboardCard title="Wallet & Credits" icon={Wallet}>
                            <div className="flex items-end justify-between mb-6">
                                <StatItem label="Credits" value={user.credits || 0} subtext="Available to spend" />
                                <Link href="/wallet">
                                    <Button size="sm" className="rounded-full h-8 px-4">
                                        <PlusCircle size={14} className="mr-1" /> Add
                                    </Button>
                                </Link>
                            </div>
                            <div className="space-y-1">
                                <MenuLink icon={CreditCard} label="Payment Methods" href="/wallet/methods" />
                                <MenuLink icon={FileText} label="Transaction History" href="/wallet/history" />
                            </div>
                        </DashboardCard>
                    </div>

                    {/* Column 2: Listings & Activity */}
                    <div className="space-y-6">
                        {/* Listings Stats */}
                        <DashboardCard title="My Listings" icon={ShoppingBag}>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-muted/30 p-3 rounded-xl text-center">
                                    <span className="block text-2xl font-bold text-foreground">{user.booksListed || 0}</span>
                                    <span className="text-xs text-muted-foreground font-medium">Active</span>
                                </div>
                                <div className="bg-muted/30 p-3 rounded-xl text-center">
                                    <span className="block text-2xl font-bold text-foreground">{user.booksSold || 0}</span>
                                    <span className="text-xs text-muted-foreground font-medium">Sold</span>
                                </div>
                            </div>
                            <Link href="/sell">
                                <Button className="w-full rounded-full mb-2">List a New Book</Button>
                            </Link>
                            <Link href="/listings">
                                <Button variant="ghost" className="w-full rounded-full text-muted-foreground">Manage Listings</Button>
                            </Link>
                        </DashboardCard>

                        {/* Exchanges */}
                        <DashboardCard title="Exchanges" icon={ShoppingBag}>
                             <div className="space-y-1">
                                <MenuLink icon={ShoppingBag} label="Active Orders" href="/orders" />
                                <MenuLink icon={ShoppingBag} label="Exchange Requests" href="/exchanges" />
                                <MenuLink icon={FileText} label="Order History" href="/orders/history" />
                            </div>
                        </DashboardCard>
                    </div>

                    {/* Column 3: Settings & More */}
                    <div className="space-y-6">
                        {/* Settings */}
                        <DashboardCard title="Settings" icon={Settings}>
                            <div className="space-y-1">
                                <MenuLink icon={MapPin} label="Saved Addresses" href="/account/addresses" />
                                <MenuLink icon={Bell} label="Notifications" onClick={() => {}} />
                                <MenuLink icon={Shield} label="Privacy & Security" href="/privacy" />
                                {isInstallable && (
                                    <MenuLink icon={Download} label="Install App" onClick={handleInstallClick} />
                                )}
                            </div>
                        </DashboardCard>

                        {/* Support */}
                        <DashboardCard title="Support" icon={HelpCircle}>
                            <div className="space-y-1">
                                <MenuLink icon={HelpCircle} label="Help Center" href="/help" />
                                <MenuLink icon={Info} label="About Us" href="/about" />
                                <MenuLink icon={FileText} label="Terms of Service" href="/terms" />
                            </div>
                        </DashboardCard>

                        <div className="text-center pt-4">
                            <p className="text-xs text-muted-foreground">
                                Version 1.0.0 • Build 2024.1
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
