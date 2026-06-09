export default function Features() {
    const features = [
        {
            title: "Sell with Ease",
            description: "List your books in seconds. Scan the ISBN, set your price, and find a buyer instantly.",
            icon: "📚",
        },
        {
            title: "Buy for Less",
            description: "Access a vast library of pre-loved books at a fraction of the retail price.",
            icon: "💸",
        },
        {
            title: "Sustainable Reading",
            description: "Help the planet by giving books a second life and reducing paper waste.",
            icon: "🌱",
        },
        {
            title: "Community Trust",
            description: "Safe transactions and verified users ensure a secure exchange environment.",
            icon: "🛡️",
        }
    ];

    return (
        <section className="py-24 bg-accent/5">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose Us?</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        We make book exchanging simple, secure, and sustainable for everyone.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, i) => (
                        <div
                            key={i}
                            className="bg-card border border-border p-6 rounded-lg transition-transform duration-300 hover:-translate-y-1"
                        >
                            <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center text-2xl mb-4 border border-border">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
