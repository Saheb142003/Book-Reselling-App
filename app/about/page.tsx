import Header from "@/components/Header";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            <Header />
            <main className="container mx-auto px-4 pt-32 pb-20 max-w-3xl">
                <h1 className="text-4xl font-bold mb-8 text-gray-900">About BookExchange</h1>
                
                <div className="prose prose-lg text-gray-600">
                    <p className="lead text-xl mb-6">
                        We believe that every book deserves a new reader. BookExchange is a community-driven platform designed to make trading books simple, sustainable, and fun.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Mission</h2>
                    <p>
                        Our mission is to reduce paper waste and promote literacy by creating a seamless circular economy for books. By using a credit-based system, we ensure that trading is fair and accessible to everyone, regardless of budget.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How It Works</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>List Books:</strong> Upload books you've finished reading.</li>
                        <li><strong>Earn Credits:</strong> Get credits when someone requests your book.</li>
                        <li><strong>Get New Books:</strong> Use your credits to get books from other members.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Join the Community</h2>
                    <p>
                        Whether you're a casual reader or a bibliophile, there's a place for you here. Start trading today and give your old books a new life!
                    </p>
                </div>
            </main>
        </div>
    );
}
