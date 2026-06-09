import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await axios.post('/auth/login', { email, password });
            const { token, user } = response.data;
            
            const userRole = user.role || 'user';
            
            if (userRole !== role) {
                throw new Error(`Access Denied: You are not an ${role === 'admin' ? 'Admin' : 'User'}.`);
            }

            login(token, user);

            if (role === 'admin') {
                navigate("/admin");
            } else {
                navigate("/");
            }

        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else if (err instanceof Error) {
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
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === "user" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                    User Login
                </button>
                <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === "admin" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
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

            <Button type="submit" className="mt-4 w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
            </Button>
        </form>
    );
}
