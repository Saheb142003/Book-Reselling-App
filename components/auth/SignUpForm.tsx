"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export default function SignUpForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { refreshProfile } = useAuth();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // 1. Create Auth User
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Update Auth Profile
            await updateProfile(user, { displayName: name });

            // 3. Create Firestore Document
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                displayName: name,
                photoURL: null,
                role: "user",
                credits: 0,
                booksListed: 0,
                booksSold: 0,
                createdAt: Timestamp.now(), // Use server timestamp in real app
            });

            // 4. Force refresh of AuthContext to get the new Firestore data
            await refreshProfile();

            // 5. Redirect
            router.push("/profile");
        } catch (err) {
            console.error(err);
            // Handle Firebase Errors safely
            if ((err as { code?: string }).code === 'auth/configuration-not-found' || (err as { code?: string }).code === 'auth/operation-not-allowed') {
                setError("Configuration Error: Please enable 'Email/Password' authentication in the Firebase Console.");
            } else if ((err as { code?: string }).code === 'auth/email-already-in-use') {
                setError("This email is already registered. Please log in.");
            } else if (err instanceof Error) {
                setError(err.message || "Failed to sign up");
            } else {
                setError("An unknown error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSignUp} className="flex flex-col gap-4 w-full max-w-sm mx-auto p-6 glass-nav border border-white/10 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold text-center mb-2 text-white">Create Account</h2>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium ml-1 text-gray-200">Full Name</label>
                <input
                    type="text"
                    required
                    className="bg-black/40 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary transition-colors text-white placeholder:text-gray-500"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>



            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium ml-1 text-gray-200">Email</label>
                <input
                    type="email"
                    required
                    className="bg-black/40 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary transition-colors text-white placeholder:text-gray-500"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium ml-1 text-gray-200">Password</label>
                <input
                    type="password"
                    required
                    className="bg-black/40 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-primary transition-colors text-white placeholder:text-gray-500"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <Button type="submit" className="mt-4 bg-primary text-white hover:bg-primary/90 border border-white/10" disabled={loading}>
                {loading ? "Creating Account..." : "Sign Up"}
            </Button>
        </form>
    );
}
