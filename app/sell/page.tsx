"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ListBookForm from "@/components/books/ListBookForm";
import Header from "@/components/Header";


export default function SellPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) return null;

    return (
        <div className="min-h-screen bg-gradient-main flex flex-col">
            <Header />
            <main className="flex-grow pt-32 pb-10 px-4 container mx-auto">
                <ListBookForm />
            </main>

        </div>
    );
}
