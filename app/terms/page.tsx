

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white">
            <main className="container mx-auto px-4 pt-32 pb-20 max-w-3xl">
                <h1 className="text-3xl font-bold mb-8 text-gray-900">Terms of Service</h1>
                
                <div className="prose text-gray-600 space-y-6">
                    <p className="text-sm text-gray-400">Last Updated: January 2024</p>
                    
                    <p>
                        By using BookExchange, you agree to these Terms of Service. Please read them carefully.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900">1. Acceptance of Terms</h3>
                    <p>
                        By accessing or using our platform, you agree to be bound by these Terms and all applicable laws and regulations.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900">2. User Conduct</h3>
                    <p>
                        You agree to use the platform only for lawful purposes. You must not post false or misleading information about books you list.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900">3. Book Condition</h3>
                    <p>
                        Sellers are responsible for accurately describing the condition of their books. Buyers understand that books are used and may show signs of wear.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900">4. Termination</h3>
                    <p>
                        We reserve the right to terminate or suspend your account if you violate these Terms.
                    </p>
                </div>
            </main>
        </div>
    );
}
