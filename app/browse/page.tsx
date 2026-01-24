"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookCard from "@/components/books/BookCard";
import { getBooks } from "@/lib/db/books";
import { Book } from "@/types/book";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function BrowsePage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBooks() {
            try {
                const data = await getBooks();
                setBooks(data);
            } catch (error) {
                console.error("Failed to load books", error);
            } finally {
                setLoading(false);
            }
        }
        fetchBooks();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-main flex flex-col">
            <Header />
            <main className="flex-grow pt-32 pb-10 px-4 container mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Explore Books</h1>
                        <p className="text-muted-foreground">
                            Discover {books.length} pre-loved books looking for a new home.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="h-96 bg-white/5 rounded-xl border border-white/10 animate-pulse"></div>
                        ))}
                    </div>
                ) : books.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {books.map((book) => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                        <h3 className="text-xl font-bold mb-2">No books listed yet</h3>
                        <p className="text-muted-foreground mb-6">Be the first to list a book for sale!</p>
                        <Link href="/sell">
                            <Button>List a Book</Button>
                        </Link>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
