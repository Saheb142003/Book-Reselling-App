"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { getUserBooks } from "@/lib/db/books";
import { Book } from "@/types/book";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LayoutDashboard, BookOpen, Edit3 } from "lucide-react";
import BookCard from "@/components/books/BookCard";

export default function UserProfile() {
    const { user, loading } = useAuth();
    const router = useRouter();
    
    const [myBooks, setMyBooks] = useState<Book[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (user) {
            fetchUserData();
        }
    }, [user]);

    const fetchUserData = async () => {
        if (!user) return;
        setLoadingData(true);
        try {
            const books = await getUserBooks(user.uid);
            setMyBooks(books);
        } catch (error) {
            console.error("Failed to fetch user data:", error);
        } finally {
            setLoadingData(false);
        }
    };

    if (loading) return null;

    if (!user) {
        return <div className="text-center p-10">Please log in to view your profile.</div>;
    }

    return (
        <div className="max-w-3xl mx-auto pb-20">
            {/* Header Section */}
            <div className="flex flex-col items-center text-center mb-10">
                <div className="h-28 w-28 rounded-full bg-white p-1 shadow-lg mb-4 relative">
                    <div className="h-full w-full rounded-full bg-gray-100 relative overflow-hidden">
                        {user.photoURL ? (
                            <Image src={user.photoURL} alt={user.displayName || "User"} fill className="object-cover" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-3xl font-bold text-gray-400 bg-gray-50">
                                {user.displayName?.[0] || "U"}
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={() => router.push('/account/personal-details')}
                        className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-md hover:bg-primary/90 transition-colors"
                    >
                        <Edit3 size={14} />
                    </button>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.displayName || "Book Lover"}</h1>
                <p className="text-gray-500 text-sm mb-6 max-w-md">
                    {user.bio || "Passionate reader & book collector. 📚✨ Always looking for the next great story."}
                </p>

                {/* Stats */}
                <div className="flex gap-8 mb-8">
                    <div className="text-center">
                        <span className="block text-xl font-bold text-gray-900">{user.booksSold || 0}</span>
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Sold</span>
                    </div>
                    <div className="text-center">
                        <span className="block text-xl font-bold text-gray-900">{user.credits || 0}</span>
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Credits</span>
                    </div>
                    <div className="text-center">
                        <span className="block text-xl font-bold text-gray-900">{user.booksListed || 0}</span>
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Listed</span>
                    </div>
                </div>
            </div>

            {/* Library Grid */}
            <div className="border-t border-gray-200 pt-8">
                <div className="flex items-center justify-between mb-6 px-4 md:px-0">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <BookOpen size={20} className="text-primary" />
                        My Collection
                    </h2>
                    <span className="text-sm text-gray-500">{myBooks.length} Books</span>
                </div>

                {loadingData ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 px-4 md:px-0">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="aspect-[2/3] bg-gray-100 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : myBooks.length === 0 ? (
                    <div className="text-center py-12 bg-white/50 rounded-3xl border border-dashed border-gray-200 mx-4 md:mx-0">
                        <p className="text-gray-500 text-sm mb-4">Your collection is empty.</p>
                        <Button variant="outline" size="sm" onClick={() => router.push('/sell')}>List a Book</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 px-4 md:px-0">
                        {myBooks.map((book) => (
                            <div key={book.id} className="h-full">
                                <BookCard book={book} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
