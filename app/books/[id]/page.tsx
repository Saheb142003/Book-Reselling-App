"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getBook } from "@/lib/db/books";
import { buyBookInstant, createExchangeRequest } from "@/lib/db/exchanges";
import { Book } from "@/types/book";
import { useAuth } from "@/context/AuthContext";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function BookDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [book, setBook] = useState<Book | null>(null);
    const [sellerName, setSellerName] = useState("Unknown");
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState(false);

    useEffect(() => {
        const fetchBook = async () => {
            if (!id) return;
            try {
                const data = await getBook(id as string);
                setBook(data);
                if (data && data.sellerId) {
                    const userSnap = await getDoc(doc(db, "users", data.sellerId));
                    if (userSnap.exists()) {
                        setSellerName(userSnap.data().displayName || "Unknown");
                    }
                }
            } catch (error) {
                console.error("Error fetching book:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBook();
    }, [id]);

    const handleBuyNow = async () => {
        if (!user) {
            router.push("/login");
            return;
        }
        if (!book) return;

        // Calculate fees for display
        const basePrice = book.credits || 0;
        const buyerFee = Math.ceil(basePrice * 0.05);
        const totalCost = basePrice + buyerFee;

        if (!confirm(`Buy "${book.title}" instantly?\n\nPrice: ${basePrice} Credits\nFee (5%): ${buyerFee} Credits\nTotal: ${totalCost} Credits`)) return;

        setBuying(true);
        try {
            await buyBookInstant(book, user.uid, user.displayName || "Unknown Buyer");
            alert("Purchase successful! The book is yours.");
            router.push("/exchanges");
        } catch (error: any) {
            alert("Purchase failed: " + error.message);
        } finally {
            setBuying(false);
        }
    };

    const handleRequest = async () => {
        if (!user) {
            router.push("/login");
            return;
        }
        if (!book) return;

        if (!confirm(`Send an exchange request for "${book.title}"?\nThe seller will need to approve this request.`)) return;

        setBuying(true); // Reuse buying state for loading
        try {
            await createExchangeRequest(book, user.uid, user.displayName || "Unknown Requester", book.credits);
            alert("Request sent successfully! You can track it in your Dashboard.");
            router.push("/exchanges?tab=requests");
        } catch (error: any) {
            alert("Request failed: " + error.message);
        } finally {
            setBuying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-main flex flex-col">
                <div className="flex-grow flex items-center justify-center pt-32">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="min-h-screen bg-gradient-main flex flex-col">
                <div className="flex-grow flex items-center justify-center pt-32 text-muted-foreground">
                    Book not found.
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-main flex flex-col">
            <main className="flex-grow pt-32 pb-10 px-4 container mx-auto">
                <div className="bg-white border border-gray-200 shadow-lg rounded-2xl overflow-hidden max-w-4xl mx-auto flex flex-col md:flex-row">
                    {/* Image Section */}
                    <div className="w-full md:w-1/2 h-96 md:h-auto relative bg-gray-100">
                        <Image
                            src={book.coverUrl || "/placeholder-book.png"}
                            alt={book.title}
                            fill
                            className="object-contain p-8"
                        />
                    </div>

                    {/* Details Section */}
                    <div className="w-full md:w-1/2 p-8 flex flex-col">
                        <div className="flex-grow">
                            <div className="flex justify-between items-start mb-4">
                                <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold border border-primary/20">
                                    {book.credits} Credits
                                </span>
                            </div>
                            
                            <p className="text-lg text-gray-700 mb-6">{book.authors.join(", ")}</p>
                            
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="font-medium text-gray-900">Seller:</span>
                                    <span>{sellerName}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="font-medium text-gray-900">Condition:</span>
                                    <span className="capitalize">{book.condition}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="font-medium text-gray-900">Posted:</span>
                                    <span>{new Date(book.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="prose prose-sm text-gray-600 mb-8">
                                <p>{book.description}</p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            {user?.uid === book.sellerId ? (
                                <Button disabled className="w-full bg-gray-200 text-gray-500 cursor-not-allowed">
                                    You own this book
                                </Button>
                            ) : book.status !== 'available' ? (
                                <Button disabled className="w-full bg-gray-200 text-gray-500 cursor-not-allowed">
                                    {book.status === 'sold' ? 'Sold Out' : 'Unavailable'}
                                </Button>
                            ) : (
                                <div className="space-y-3">
                                    <Button 
                                        onClick={handleBuyNow} 
                                        disabled={buying}
                                        className="w-full bg-primary hover:bg-primary/90 text-white shadow-md text-lg py-6"
                                    >
                                        {buying ? "Processing..." : `Buy Instantly (${book.credits} Credits)`}
                                    </Button>
                                    
                                    <div className="relative flex items-center gap-2 py-2">
                                        <div className="h-px bg-gray-200 flex-grow"></div>
                                        <span className="text-xs text-muted-foreground uppercase">OR</span>
                                        <div className="h-px bg-gray-200 flex-grow"></div>
                                    </div>

                                    <Button 
                                        onClick={handleRequest} 
                                        disabled={buying}
                                        variant="outline"
                                        className="w-full border-primary text-primary hover:bg-primary/5 text-lg py-6"
                                    >
                                        Request Exchange
                                    </Button>
                                    <p className="text-xs text-center text-muted-foreground">
                                        Request approval from the seller before exchanging.
                                    </p>
                                </div>
                            )}
                            <p className="text-xs text-center text-muted-foreground mt-3">
                                * 5% Transaction Fee applies on completion
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <div className="hidden md:block">
                <Footer />
            </div>
        </div>
    );
}
