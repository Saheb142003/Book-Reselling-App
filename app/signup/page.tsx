import SignUpForm from "@/components/auth/SignUpForm";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function SignUpPage() {
    return (
        <div className="min-h-screen bg-gradient-main flex flex-col">
            <main className="flex-grow flex items-center justify-center pt-24 pb-10 px-4">
                <div className="w-full max-w-md">
                    <SignUpForm />
                    <p className="text-center text-gray-800 dark:text-gray-200 mt-6 text-sm font-medium">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary font-bold hover:underline hover:text-primary/80 transition-colors">
                            Log in
                        </Link>
                    </p>
                </div>
            </main>
            <div className="hidden md:block">
                <Footer />
            </div>
        </div>
    );
}
