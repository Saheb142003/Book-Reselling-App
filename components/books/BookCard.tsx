"use client";

import Image from "next/image";
import Link from "next/link";
import { Book } from "@/types/book";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { updateBookCredits } from "@/lib/db/admin";
import { Pencil, Check, X } from "lucide-react";

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
            // Ideally we should update the global state or revalidate, but for now local state update is fine
            alert("Credits updated!");
        } catch (error) {
            alert("Failed to update credits");
            setCredits(book.credits); // Reset on error
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="group relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/20 h-full flex flex-col">
            <Link href={`/books/${book.id}`} className="aspect-[2/3] w-full overflow-hidden bg-gray-100 relative block">
                <Image
                    src={book.coverUrl && book.coverUrl.startsWith('http') ? book.coverUrl : "https://placehold.co/400x600?text=No+Cover"}
                    alt={book.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
                {!book.coverUrl && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                    </div>
                )}
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-white/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-gray-900 border border-gray-200 z-10 shadow-sm">
                    {book.condition}
                </div>
            </Link>

            <Link href={`/books/${book.id}`} className="flex-grow p-3 flex flex-col">
                <h3 className="text-sm md:text-base font-bold leading-tight line-clamp-2 mb-1 text-gray-900 group-hover:text-primary transition-colors" title={book.title}>
                    {book.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-1 mb-2">
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
                                    className="w-12 px-1 py-0.5 border rounded text-xs"
                                    min="0"
                                />
                                <button onClick={(e) => { e.preventDefault(); handleSave(); }} disabled={loading} className="text-green-600 hover:bg-green-50 p-1 rounded">
                                    <Check size={12} />
                                </button>
                                <button onClick={(e) => { e.preventDefault(); setIsEditing(false); setCredits(book.credits); }} className="text-red-600 hover:bg-red-50 p-1 rounded">
                                    <X size={12} />
                                </button>
                            </div>
                        ) : (
                            <span className="text-sm font-bold text-primary flex items-center gap-1">
                                {credits} <span className="text-[10px] font-normal text-muted-foreground">Credits</span>
                                {user?.role === 'admin' && (
                                    <button 
                                        onClick={(e) => { e.preventDefault(); setIsEditing(true); }}
                                        className="text-gray-400 hover:text-primary transition-colors ml-1"
                                    >
                                        <Pencil size={10} />
                                    </button>
                                )}
                            </span>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
}
