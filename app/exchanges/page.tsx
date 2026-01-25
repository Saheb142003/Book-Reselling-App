"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserExchanges } from "@/lib/db/exchanges";
import { getUserBooks } from "@/lib/db/books";
import { Exchange } from "@/types/exchange";
import { Book } from "@/types/book";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import { ArrowLeft } from "lucide-react";
import BookCard from "@/components/books/BookCard";

import { Suspense } from "react";

function ExchangesContent() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // State
    const [purchases, setPurchases] = useState<Exchange[]>([]);
    const [soldBooks, setSoldBooks] = useState<Exchange[]>([]);
    const [myBooks, setMyBooks] = useState<Book[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [activeTab, setActiveTab] = useState<'listings' | 'purchases' | 'sold'>('listings');

    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam === 'listings' || tabParam === 'purchases' || tabParam === 'sold') {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/login");
                return;
            }
            fetchDashboardData();
        }
    }, [user, loading, router]);

    const fetchDashboardData = async () => {
        if (!user) return;
        try {
            const [exchangesData, booksData] = await Promise.all([
                getUserExchanges(user.uid),
                getUserBooks(user.uid)
            ]);
            
            setSoldBooks(exchangesData.incoming); 
            setPurchases(exchangesData.outgoing);
            setMyBooks(booksData);

        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingData(false);
        }
    };

    if (loading || isLoadingData) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <div className="flex-grow flex items-center justify-center pt-32">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
            </div>
        );
    }

    const ExchangeCard = ({ item, type }: { item: Exchange, type: 'purchase' | 'sold' }) => {
        return (
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden flex flex-col h-full transition-all hover:shadow-md">
                <div className="aspect-[2/3] w-full relative bg-gray-100">
                    <Image
                        src={item.bookCoverUrl || "/placeholder-book.png"}
                        alt={item.bookTitle}
                        fill
                        className="object-cover"
                    />
                    <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                        type === 'sold' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                        {type === 'sold' ? 'SOLD' : 'BOUGHT'}
                    </div>
                </div>

                <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-sm text-gray-900 line-clamp-2 mb-1">{item.bookTitle}</h3>
                    
                    <div className="text-xs text-gray-500 mb-3 space-y-1">
                        <p>{type === 'purchase' ? `Seller: ${item.ownerName}` : `Buyer: ${item.requesterName}`}</p>
                        <p>{new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs text-gray-400 uppercase tracking-wider">{type === 'purchase' ? 'Cost' : 'Earned'}</span>
                        <span className="font-bold text-primary">{item.creditsCost}c</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
            <main className="flex-grow pt-24 px-4 container mx-auto max-w-5xl">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex-grow flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                        <Button onClick={() => router.push('/sell')} size="sm" className="shadow-sm text-xs h-8">
                            List Book
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                    {(['listings', 'purchases', 'sold'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => {
                                setActiveTab(tab);
                                router.push(`/exchanges?tab=${tab}`, { scroll: false });
                            }}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                                activeTab === tab 
                                ? "bg-gray-900 text-white border-gray-900" 
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                            }`}
                        >
                            {tab === 'listings' ? `Listings (${myBooks.length})` :
                             tab === 'purchases' ? `Purchases (${purchases.length})` :
                             `Sold (${soldBooks.length})`}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="min-h-[300px]">
                    {activeTab === 'listings' && (
                        myBooks.length === 0 ? (
                            <div className="text-center py-12 bg-white border border-dashed border-gray-200 rounded-2xl">
                                <p className="text-gray-500 text-sm mb-4">You haven't listed any books yet.</p>
                                <Button onClick={() => router.push('/sell')} variant="outline" size="sm">Start Selling</Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {myBooks.map(book => (
                                    <div key={book.id} className="h-full">
                                        <BookCard book={book} />
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {activeTab === 'purchases' && (
                        purchases.length === 0 ? (
                            <div className="text-center py-12 bg-white border border-dashed border-gray-200 rounded-2xl text-gray-500 text-sm">No purchases yet.</div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {purchases.map(ex => <ExchangeCard key={ex.id} item={ex} type="purchase" />)}
                            </div>
                        )
                    )}

                    {activeTab === 'sold' && (
                        soldBooks.length === 0 ? (
                            <div className="text-center py-12 bg-white border border-dashed border-gray-200 rounded-2xl text-gray-500 text-sm">No books sold yet.</div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {soldBooks.map(ex => <ExchangeCard key={ex.id} item={ex} type="sold" />)}
                            </div>
                        )
                    )}
                </div>
            </main>
        </div>
    );
}

export default function SellerDashboard() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <div className="flex-grow flex items-center justify-center pt-32">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
            </div>
        }>
            <ExchangesContent />
        </Suspense>
    );
}
