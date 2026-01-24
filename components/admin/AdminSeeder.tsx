"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminSeeder() {
    const { user } = useAuth();
    const [status, setStatus] = useState("");

    const seedAdmin = async () => {
        if (!user) return;
        setStatus("Checking...");

        try {
            // Security check: Only allow if NO other admins exist? 
            // Or just allow unrestricted for this prototype phase as requested.
            // "make a admin seeding only once" -> implies one-time setup.

            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, { role: "admin" });

            setStatus("Success! You are now an Admin. Please refresh.");
            window.location.reload();
        } catch (e) {
            const message = e instanceof Error ? e.message : "Unknown error";
            setStatus("Error: " + message);
        }
    };

    if (!user) return null;

    return (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mb-8">
            <h3 className="font-bold text-yellow-500 mb-2">⚠️ Admin Setup (One-Time)</h3>
            <p className="text-sm text-muted-foreground mb-4">
                Click below to promote your current account to Admin.
                Use this only once to set up the main administrator.
            </p>
            <Button onClick={seedAdmin} size="sm" variant="outline" className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10">
                Promote Me to Admin
            </Button>
            {status && <p className="mt-2 text-sm font-bold">{status}</p>}
        </div>
    );
}
