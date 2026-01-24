import LoginForm from "@/components/auth/LoginForm";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-gradient-main flex flex-col">
            <Header />
            <main className="flex-grow flex items-center justify-center pt-24 pb-10 px-4">
                <div className="w-full max-w-md">
                    <LoginForm />
                    <p className="text-center text-muted-foreground mt-6 text-sm">
                        Don't have an account?{" "}
                        <Link href="/signup" className="text-primary hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
