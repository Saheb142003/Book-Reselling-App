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
        <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-2xl mx-auto shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                <Button variant="outline" size="sm" onClick={logout} className="text-red-600 hover:bg-red-50 border-red-200">
                    Sign Out
                </Button>
            </div>

            <div className="grid gap-6">
                <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl text-primary font-bold">
                        {user.displayName?.[0] || user.email?.[0] || "U"}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{user.displayName || "No Name Set"}</h3>
                        <p className="text-muted-foreground text-sm">{user.email}</p>
                        <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                            {user.role?.toUpperCase() || "USER"}
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-center">
                        <span className="text-sm text-muted-foreground block mb-1 uppercase tracking-wider">Credits</span>
                        <span className="font-bold text-2xl text-primary">{user.credits || 0}</span>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-center">
                        <span className="text-sm text-muted-foreground block mb-1 uppercase tracking-wider">Listed</span>
                        <span className="font-bold text-2xl text-gray-900">{user.booksListed || 0}</span>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-center">
                        <span className="text-sm text-muted-foreground block mb-1 uppercase tracking-wider">Sold</span>
                        <span className="font-bold text-2xl text-gray-900">{user.booksSold || 0}</span>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                    <span className="text-sm text-muted-foreground block mb-1">Member Since</span>
                    <span className="font-medium text-gray-900">
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
