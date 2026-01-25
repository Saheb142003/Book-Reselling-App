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
        <div className="group relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl hover:border-primary/20">
            <div className="aspect-[2/3] w-full overflow-hidden bg-gray-100 relative">
                <Image
                    src={book.coverUrl && book.coverUrl.startsWith('http') ? book.coverUrl : "https://placehold.co/400x600?text=No+Cover"}
                    alt={book.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-2 right-2 px-2 py-1 rounded bg-white/90 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-gray-900 border border-gray-200 z-10 shadow-sm">
                    {book.condition}
                </div>
            </div>

            <div className="p-4">
                <h3 className="text-lg font-bold leading-tight line-clamp-1 mb-1 text-gray-900" title={book.title}>
                    {book.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-1 mb-3">
                    {book.authors?.join(", ") || "Unknown Author"}
                </p>

                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <div className="flex items-center gap-1">
                                <input 
                                    type="number" 
                                    value={credits} 
                                    onChange={(e) => setCredits(Number(e.target.value))}
                                    className="w-16 px-1 py-0.5 border rounded text-sm"
                                    min="0"
                                />
                                <button onClick={handleSave} disabled={loading} className="text-green-600 hover:bg-green-50 p-1 rounded">
                                    <Check size={14} />
                                </button>
                                <button onClick={() => { setIsEditing(false); setCredits(book.credits); }} className="text-red-600 hover:bg-red-50 p-1 rounded">
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <span className="text-lg font-bold text-primary flex items-center gap-2">
                                {credits} Credits
                                {user?.role === 'admin' && (
                                    <button 
                                        onClick={(e) => { e.preventDefault(); setIsEditing(true); }}
                                        className="text-gray-400 hover:text-primary transition-colors"
                                    >
                                        <Pencil size={12} />
                                    </button>
                                )}
                            </span>
                        )}
                    </div>
                    
                    <Link href={`/books/${book.id}`}>
                        <button className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-900 hover:bg-primary hover:text-white transition-colors">
                            View Details
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
