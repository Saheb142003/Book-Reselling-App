"use client";

import Hero from "@/components/Hero";
import Features from "@/components/Features";
import BookCard from "@/components/books/BookCard";
import { getBooks } from "@/lib/db/books";
import { Book } from "@/types/book";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentBooks() {
      try {
        const books = await getBooks();
        // Sort by createdAt desc if available, otherwise take first 5
        setRecentBooks(books.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch recent books", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRecentBooks();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-grow">
        <Hero />
        
        {/* Recent Listings Section */}
        <section className="py-20 container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Fresh Arrivals</h2>
              <p className="text-muted-foreground">Check out the latest books added by our community.</p>
            </div>
            <Link href="/explore">
              <Button variant="ghost" className="gap-2 text-primary hover:text-primary/80">
                View All <ArrowRight size={16} />
              </Button>
            </Link>
          </div>

          {loading ? (
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-80 bg-muted/20 rounded-xl animate-pulse"></div>
                ))}
            </div>
          ) : recentBooks.length > 0 ? (
            <div className="flex overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 md:-mx-6 md:px-6 gap-4 md:gap-6 hide-scrollbar">
              {recentBooks.map((book) => (
                <div key={book.id} className="snap-start shrink-0 w-[160px] md:w-[220px]">
                  <BookCard book={book} />
                </div>
              ))}
              
              {/* Explore More Card */}
              <div className="snap-start shrink-0 w-[160px] md:w-[220px]">
                <Link href="/explore" className="h-full block">
                    <div className="h-full min-h-[300px] bg-muted/30 border-2 border-dashed border-primary/20 hover:border-primary/50 hover:bg-muted/50 rounded-2xl flex flex-col items-center justify-center p-6 text-center transition-all group cursor-pointer">
                        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <ArrowRight className="text-primary" size={32} />
                        </div>
                        <h3 className="font-bold text-lg text-foreground mb-1">Explore More</h3>
                        <p className="text-xs text-muted-foreground">Discover thousands of books</p>
                    </div>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/10 rounded-2xl border border-dashed border-border">
              <p className="text-muted-foreground mb-4">No books listed yet. Be the first!</p>
              <Link href="/sell">
                <Button>List a Book</Button>
              </Link>
            </div>
          )}
        </section>

        <Features />
      </main>
    </div>
  );
}
