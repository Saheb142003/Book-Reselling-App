"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { 
    User, 
    Settings, 
    HelpCircle, 
    Info, 
    Shield, 
    FileText, 
    LogOut, 
    ChevronRight, 
    Download, 
    Bell,
    MapPin,
    Mail
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
        return null;
    }

    const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-4">{title}</h3>
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                {children}
            </div>
        </div>
    );

    const MenuItem = ({ icon: Icon, label, onClick, href, value, danger }: any) => {
        const content = (
            <div className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer ${danger ? 'text-red-600' : 'text-gray-900'}`}>
                <div className="flex items-center gap-3">
                    <Icon size={20} className={danger ? "text-red-500" : "text-gray-500"} />
                    <span className="font-medium">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                    {value && <span className="text-sm text-gray-500">{value}</span>}
                    {!danger && <ChevronRight size={16} className="text-gray-400" />}
                </div>
            </div>
        );

        if (href) {
            return (
                <Link href={href} className="block border-b border-gray-100 last:border-0">
                    {content}
                </Link>
            );
        }

        return (
            <div onClick={onClick} className="border-b border-gray-100 last:border-0">
                {content}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-main pb-24 md:pb-10 pt-20">

            <div className="container mx-auto max-w-2xl pt-6 px-4 md:px-0">
                {/* Profile Snippet */}
                <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-4 mb-6 flex items-center gap-4 shadow-sm">
                    <div className="h-16 w-16 rounded-full bg-gray-100 relative overflow-hidden border border-gray-200">
                        {user.photoURL ? (
                            <Image src={user.photoURL} alt={user.displayName || "User"} fill className="object-cover" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-xl font-bold text-gray-400">
                                {user.displayName?.[0] || "U"}
                            </div>
                        )}
                    </div>
                    <div className="flex-grow">
                        <h2 className="font-bold text-lg text-gray-900">{user.displayName || "Book Lover"}</h2>
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.push('/account/personal-details')} className="text-primary border-primary/20 hover:bg-primary/5">
                        Edit
                    </Button>
                </div>

                {user.role === 'admin' && (
                    <div className="mb-6">
                        <div 
                            onClick={() => router.push('/admin')}
                            className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-primary/10 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Shield size={20} className="text-primary" />
                                </div>
                                <div>
                                    <span className="font-bold text-gray-900 block">Admin Dashboard</span>
                                    <span className="text-xs text-primary font-medium">Manage App & Users</span>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-primary/60" />
                        </div>
                    </div>
                )}

                <Section title="Profile Information">
                    <MenuItem icon={User} label="Personal Details" href="/account/personal-details" value="Name, Bio" />
                    <MenuItem icon={MapPin} label="Saved Addresses" href="/account/addresses" value="Manage" />
                </Section>

                <Section title="App Settings">
                    {isInstallable && (
                        <MenuItem icon={Download} label="Install App" onClick={handleInstallClick} />
                    )}
                    <MenuItem icon={Bell} label="Notifications" onClick={() => {}} value="On" />
                    <MenuItem icon={Settings} label="Preferences" onClick={() => {}} />
                </Section>

                <Section title="Support & Legal">
                    <MenuItem icon={HelpCircle} label="Help & Support" href="/how-it-works" />
                    <MenuItem icon={Info} label="About Us" href="/about" />
                    <MenuItem icon={Shield} label="Privacy Policy" href="/privacy" />
                    <MenuItem icon={FileText} label="Terms of Service" href="/terms" />
                </Section>

                <div className="px-4 md:px-0 mt-8">
                    <Button 
                        variant="outline" 
                        className="w-full bg-white border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-12 text-base font-medium"
                        onClick={logout}
                    >
                        <LogOut size={18} className="mr-2" />
                        Sign Out
                    </Button>
                    <p className="text-center text-xs text-gray-400 mt-4">
                        Version 1.0.0 • Build 2024.1
                    </p>
                </div>
            </div>
        </div>
    );
}
