"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import UserProfile from "@/components/UserProfile";
import Footer from "@/components/Footer";

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) return null; // Or a loading spinner

    return (
        <div className="min-h-screen bg-gradient-main flex flex-col">
            <main className="flex-grow pt-24 pb-10 px-4 container mx-auto">
                <UserProfile />
            </main>
        </div>
    );
}
