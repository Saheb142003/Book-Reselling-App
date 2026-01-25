import Header from "@/components/Header";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white">
            <Header />
            <main className="container mx-auto px-4 pt-32 pb-20 max-w-3xl">
                <h1 className="text-3xl font-bold mb-8 text-gray-900">Privacy Policy</h1>
                
                <div className="prose text-gray-600 space-y-6">
                    <p className="text-sm text-gray-400">Last Updated: January 2024</p>
                    
                    <p>
                        At BookExchange, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900">1. Information We Collect</h3>
                    <p>
                        We collect information you provide directly to us, such as your name, email address, and shipping address when you create an account or list a book.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900">2. How We Use Your Information</h3>
                    <p>
                        We use your information to facilitate book exchanges, communicate with you about your transactions, and improve our platform.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900">3. Data Security</h3>
                    <p>
                        We implement appropriate technical and organizational measures to protect your personal data against unauthorized access or disclosure.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900">4. Contact Us</h3>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at support@bookexchange.com.
                    </p>
                </div>
            </main>
        </div>
    );
}
