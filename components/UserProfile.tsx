"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";

export default function UserProfile() {
    const { user, logout, loading } = useAuth();

    if (loading) {
        return <div className="text-center p-10">Loading profile...</div>;
    }

    if (!user) {
        return <div className="text-center p-10">Please log in to view your profile.</div>;
    }

    return (
        <div className="glass-nav border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white">My Profile</h1>
                <Button variant="outline" size="sm" onClick={logout} className="text-red-400 hover:bg-red-500/10 border-red-500/20 hover:text-red-300">
                    Sign Out
                </Button>
            </div>

            <div className="grid gap-6">
                <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                    <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center text-2xl text-white font-bold">
                        {user.displayName?.[0] || user.email?.[0] || "U"}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">{user.displayName || "No Name Set"}</h3>
                        <p className="text-gray-300 text-sm">{user.email}</p>
                        <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white border border-white/20">
                            {user.role?.toUpperCase() || "USER"}
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                        <span className="text-sm text-gray-300 block mb-1 uppercase tracking-wider">Credits</span>
                        <span className="font-bold text-2xl text-accent">{user.credits || 0}</span>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                        <span className="text-sm text-gray-300 block mb-1 uppercase tracking-wider">Listed</span>
                        <span className="font-bold text-2xl text-white">{user.booksListed || 0}</span>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                        <span className="text-sm text-gray-300 block mb-1 uppercase tracking-wider">Sold</span>
                        <span className="font-bold text-2xl text-white">{user.booksSold || 0}</span>
                    </div>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <span className="text-sm text-gray-300 block mb-1">Member Since</span>
                    <span className="font-medium text-white">
                        {user.createdAt ? (
                            user.createdAt instanceof Date
                                ? user.createdAt.toLocaleDateString()
                                : new Date(user.createdAt).toLocaleDateString()
                        ) : "N/A"}
                    </span>
                </div>
            </div>


        </div>
    );
}
