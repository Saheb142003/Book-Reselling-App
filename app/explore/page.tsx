"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import BookCard from "@/components/books/BookCard";
import { getBooks } from "@/lib/db/books";
import { Book } from "@/types/book";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Search, X } from "lucide-react";
import { useSearchParams } from "next/navigation";

const GENRES = [
    "All",
    "Fiction",
    "Non-Fiction",
    "Sci-Fi",
    "Mystery",
    "Romance",
    "Thriller",
    "Fantasy",
    "Biography",
    "History",
    "Self-Help",
    "Textbook"
];

function ExploreContent() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get("q") || "";
    const initialGenre = searchParams.get("genre") || "All";

    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [selectedGenre, setSelectedGenre] = useState(initialGenre);

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

    const filteredBooks = useMemo(() => {
        return books.filter(book => {
            const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  book.authors?.some(author => author.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesGenre = selectedGenre === "All" || book.genre === selectedGenre;
            return matchesSearch && matchesGenre;
        });
    }, [books, searchQuery, selectedGenre]);

    return (
        <div className="container mx-auto px-4 md:px-6">
            
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Explore Books</h1>
                    <p className="text-muted-foreground">
                        Discover {books.length > 0 ? books.length : "thousands of"} pre-loved books looking for a new home.
                    </p>
                </div>

                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <input 
                            type="text" 
                            placeholder="Search by title or author..." 
                            className="w-full h-10 pl-9 pr-4 rounded-full border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Genre Filters */}
            <div className="mb-8 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                <div className="flex items-center gap-2">
                    {GENRES.map((genre) => (
                        <button
                            key={genre}
                            onClick={() => setSelectedGenre(genre)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                                selectedGenre === genre
                                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                                    : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                            }`}
                        >
                            {genre}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="h-72 bg-muted/20 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : filteredBooks.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {filteredBooks.map((book) => (
                        <BookCard key={book.id} book={book} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/10 rounded-3xl border border-dashed border-border">
                    <div className="h-16 w-16 bg-muted/20 rounded-full flex items-center justify-center mb-4 text-muted-foreground">
                        <Search size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">No books found</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        We couldn't find any books matching your search. Try adjusting your filters or search terms.
                    </p>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => { setSearchQuery(""); setSelectedGenre("All"); }}>
                            Clear Filters
                        </Button>
                        <Link href="/sell">
                            <Button>List a Book</Button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ExplorePage() {
    return (
        <div className="min-h-screen bg-background flex flex-col pt-20 pb-20 md:pt-24">
            <Suspense fallback={<div className="container mx-auto px-4 py-10 text-center">Loading...</div>}>
                <ExploreContent />
            </Suspense>
        </div>
    );
}
