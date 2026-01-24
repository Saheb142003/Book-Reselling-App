export default function Footer() {
    return (
        <footer className="py-10 border-t border-gray-200 bg-gray-50">
            <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <span className="text-xl font-bold tracking-tighter text-gray-900">
                        Book<span className="text-primary">Exchange</span>
                    </span>
                    <p className="text-sm text-gray-500">
                        © 2024 BookExchange. All rights reserved.
                    </p>
                </div>

                <div className="flex gap-6">
                    <a href="#" className="text-gray-500 hover:text-primary transition-colors">Privacy</a>
                    <a href="#" className="text-gray-500 hover:text-primary transition-colors">Terms</a>
                    <a href="#" className="text-gray-500 hover:text-primary transition-colors">Twitter</a>
                    <a href="#" className="text-gray-500 hover:text-primary transition-colors">GitHub</a>
                </div>
            </div>
        </footer>
    );
}
