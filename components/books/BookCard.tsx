"use client";

import Image from "next/image";
import Link from "next/link";
import { Book } from "@/types/book";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { updateBookCredits } from "@/lib/db/admin";
import { Pencil, Check, X, Trash2 } from "lucide-react";
import { deleteBook } from "@/lib/db/books";

interface BookCardProps {
    book: Book;
}

export default function BookCard({ book }: BookCardProps) {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [credits, setCredits] = useState(book.credits);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!book.id) return;
        setLoading(true);
        try {
            await updateBookCredits(book.id, credits);
            setIsEditing(false);
            alert("Price updated!");
        } catch (error) {
            alert("Failed to update price");
            setCredits(book.credits);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link click
        e.stopPropagation();

        if (!confirm("Are you sure you want to delete this listing? This cannot be undone.")) return;

        setLoading(true);
        try {
            if (book.id) {
                await deleteBook(book.id);
                // In a real app we'd trigger a re-fetch or context update
                // For now, reload to see changes
                window.location.reload();
            }
        } catch (error) {
            console.error("Delete failed", error);
            alert("Failed to delete book");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="group relative overflow-hidden rounded-xl bg-card border border-border shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30 h-full flex flex-col">
            <Link href={`/books/${book.id}`} className="aspect-[2/3] w-full overflow-hidden bg-muted relative block">
                <Image
                    src={book.coverUrl && book.coverUrl.startsWith('http') ? book.coverUrl : "https://placehold.co/400x600?text=No+Cover"}
                    alt={book.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
                {!book.coverUrl && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                    </div>
                )}
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-card/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-foreground border border-border z-10 shadow-sm">
                    {book.condition}
                </div>
            </Link>

            <Link href={`/books/${book.id}`} className="flex-grow p-3 flex flex-col">
                <h3 className="text-sm md:text-base font-bold leading-tight line-clamp-2 mb-1 text-foreground group-hover:text-primary transition-colors" title={book.title}>
                    {book.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                    {book.authors?.join(", ") || "Unknown Author"}
                </p>

                <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
                                <input 
                                    type="number" 
                                    value={credits} 
                                    onChange={(e) => setCredits(Number(e.target.value))}
                                    className="w-16 px-1 py-0.5 border border-input bg-input text-foreground rounded text-xs"
                                    min="0"
                                    placeholder="Price"
                                />
                                <button onClick={(e) => { e.preventDefault(); handleSave(); }} disabled={loading} className="text-green-400 hover:bg-green-500/10 p-1 rounded">
                                    <Check size={12} />
                                </button>
                                <button onClick={(e) => { e.preventDefault(); setIsEditing(false); setCredits(book.credits); }} className="text-red-400 hover:bg-red-500/10 p-1 rounded">
                                    <X size={12} />
                                </button>
                            </div>
                        ) : (
                            <span className="text-sm font-bold text-primary flex items-center gap-1">
                                ₹{credits} 
                                {user?.role === 'admin' && (
                                    <button 
                                        onClick={(e) => { e.preventDefault(); setIsEditing(true); }}
                                        className="text-muted-foreground hover:text-primary transition-colors ml-1"
                                    >
                                        <Pencil size={10} />
                                    </button>
                                )}
                            </span>
                        )}
                    </div>

                    {/* Delete Button (Admin or Owner) */}
                    {(user?.role === 'admin' || user?.uid === book.sellerId) && (
                         <button 
                            onClick={handleDelete}
                            disabled={loading}
                            className="text-muted-foreground hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-red-50"
                            title="Delete Listing"
                        >
                            {loading ? (
                                <span className="h-3 w-3 block rounded-full border-2 border-red-500 border-t-transparent animate-spin"></span>
                            ) : (
                                <Trash2 size={14} />
                            )}
                        </button>
                    )}
                </div>
            </Link>
        </div>
    );
}
