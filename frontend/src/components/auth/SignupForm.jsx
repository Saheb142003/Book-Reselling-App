import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

export default function SignupForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await axios.post('/auth/register', { 
                email, 
                password, 
                displayName 
            });
            const { token, user } = response.data;
            
            login(token, user);
            navigate("/");

        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else if (err instanceof Error) {
                setError(err.message || "Failed to create account");
            } else {
                setError("An unknown error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSignup} className="flex flex-col gap-4 w-full max-w-sm mx-auto p-6 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold text-center mb-2 text-foreground">Create Account</h2>
            {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md border border-red-100">{error}</p>}

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium ml-1 text-foreground">Full Name</label>
                <input
                    type="text"
                    required
                    className="bg-background border border-input rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
                    placeholder="John Doe"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                />
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
                    minLength={6}
                />
            </div>

            <Button type="submit" className="mt-4 w-full" disabled={loading}>
                {loading ? "Creating Account..." : "Sign Up"}
            </Button>
        </form>
    );
}
