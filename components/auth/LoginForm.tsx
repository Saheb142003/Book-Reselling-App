"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { doc, getDoc } from "firebase/firestore";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<'user' | 'admin'>("user");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);



            const userRef = doc(db, "users", userCredential.user.uid);
            const userSnap = await getDoc(userRef);

            console.log("Login Debug - User ID:", userCredential.user.uid);

            if (userSnap.exists()) {
                const userData = userSnap.data();
                console.log("Login Debug - Firestore Data:", userData);
                
                // Safe Role Check: Default to 'user' if missing
                const userRole = userData.role || 'user';
                
                if (userRole !== role) {
                    console.warn(`Role Mismatch: Expected ${role}, got ${userRole}`);
                    await signOut(auth);
                    throw new Error(`Access Denied: You are not an ${role === 'admin' ? 'Admin' : 'User'}.`);
                }
            } else {
                console.warn("Login Debug - No Firestore document found for user.");
            }

            if (role === 'admin') {
                router.push("/admin");
            } else {
                router.push("/");
            }

            // router.refresh(); // Removed to prevent race condition with push

        } catch (err) {
            console.error(err);
            if (err instanceof Error) {
                setError(err.message || "Invalid email or password");
            } else {
                setError("An unknown error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full max-w-sm mx-auto p-6 glass-nav border border-white/10 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold text-center mb-2 text-white">Welcome Back</h2>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <div className="flex bg-black/40 p-1 rounded-lg">
                <button
                    type="button"
                    onClick={() => setRole("user")}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === "user" ? "bg-primary text-white shadow" : "text-gray-400 hover:text-white"
                        }`}
                >
                    User Login
                </button>
                <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === "admin" ? "bg-primary text-white shadow" : "text-gray-400 hover:text-white"
                        }`}
                >
                    Admin Login
                </button>
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
                {loading ? "Logging in..." : "Login"}
            </Button>
        </form>
    );
}
