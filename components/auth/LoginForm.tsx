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

            if (userSnap.exists()) {
                const userData = userSnap.data();
                
                // Safe Role Check: Default to 'user' if missing
                const userRole = userData.role || 'user';
                
                if (userRole !== role) {
                    await signOut(auth);
                    throw new Error(`Access Denied: You are not an ${role === 'admin' ? 'Admin' : 'User'}.`);
                }
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
        <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full max-w-sm mx-auto p-6 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold text-center mb-2 text-foreground">Welcome Back</h2>
            {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md border border-red-100">{error}</p>}

            <div className="flex bg-muted p-1 rounded-lg">
                <button
                    type="button"
                    onClick={() => setRole("user")}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === "user" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    User Login
                </button>
                <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === "admin" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    Admin Login
                </button>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium ml-1 text-foreground">Email</label>
                <input
                    type="email"
                    required
                    className="bg-background border border-input rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium ml-1 text-foreground">Password</label>
                <input
                    type="password"
                    required
                    className="bg-background border border-input rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <Button type="submit" className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
            </Button>
        </form>
    );
}
