"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminSeeder from "@/components/admin/AdminSeeder";

export default function SetupPage() {
    return (
        <div className="min-h-screen bg-gradient-main flex flex-col">
            <Header />
            <main className="flex-grow pt-32 pb-10 px-4 container mx-auto flex items-center justify-center">
                <div className="max-w-md w-full">
                    <h1 className="text-3xl font-bold mb-6 text-center">System Setup</h1>
                    <AdminSeeder />
                </div>
            </main>
            <Footer />
        </div>
    );
}
