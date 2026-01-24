import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-gradient-main flex flex-col">
            <Header />
            <main className="flex-grow pt-32 pb-10 px-4 container mx-auto text-center">
                <h1 className="text-4xl font-bold mb-6">How it Works</h1>
                <p className="max-w-2xl mx-auto text-muted-foreground text-lg mb-12">
                    Buying and selling books has never been easier.
                </p>

                <div className="grid md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="text-4xl mb-4">📚</div>
                        <h3 className="text-xl font-bold mb-2">1. List Your Book</h3>
                        <p className="text-muted-foreground">Scan the ISBN, set a price, and add it to our marketplace in seconds.</p>
                    </div>
                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="text-4xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold mb-2">2. Find a Buyer</h3>
                        <p className="text-muted-foreground">Interested readers will contact you to purchase your book.</p>
                    </div>
                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="text-4xl mb-4">🤝</div>
                        <h3 className="text-xl font-bold mb-2">3. Exchange & Earn</h3>
                        <p className="text-muted-foreground">Ship the book or meet up to complete the transaction.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
