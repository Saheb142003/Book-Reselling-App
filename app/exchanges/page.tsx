"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserExchanges, acceptExchange, rejectExchange } from "@/lib/db/exchanges";
import { getUserBooks } from "@/lib/db/books";
import { Exchange } from "@/types/exchange";
import { Book } from "@/types/book";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import { ArrowLeft, AlertCircle } from "lucide-react";
import BookCard from "@/components/books/BookCard";

import { Suspense } from "react";

function ExchangesContent() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // State
    const [purchases, setPurchases] = useState<Exchange[]>([]);
    const [soldBooks, setSoldBooks] = useState<Exchange[]>([]);
    const [requests, setRequests] = useState<{incoming: Exchange[], outgoing: Exchange[]}>({ incoming: [], outgoing: [] });
    const [myBooks, setMyBooks] = useState<Book[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'listings' | 'purchases' | 'sold' | 'requests'>('listings');

    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam === 'listings' || tabParam === 'purchases' || tabParam === 'sold' || tabParam === 'requests') {
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
        setError(null);
        try {
            const [exchangesData, booksData] = await Promise.all([
                getUserExchanges(user.uid),
                getUserBooks(user.uid)
            ]);
            
            setSoldBooks(exchangesData.incoming); 
            setPurchases(exchangesData.outgoing);
            setRequests(exchangesData.requests);
            setMyBooks(booksData);

        } catch (e: any) {
            console.error(e);
            if (e?.code === 'permission-denied' || e?.message?.includes('permission')) {
                setError("Missing Permissions. You must deploy your security rules: 'firebase deploy --only firestore:rules'");
            } else {
                setError("Failed to load dashboard data. Please check your connection and try again.");
            }
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleAccept = async (id: string) => {
        if(!confirm("Accept this exchange request?")) return;
        try {
            await acceptExchange(id);
            alert("Exchange accepted!");
            fetchDashboardData(); // Refresh
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleReject = async (id: string) => {
        if(!confirm("Reject this exchange request?")) return;
        try {
            await rejectExchange(id);
            fetchDashboardData();
        } catch (e: any) {
            alert(e.message);
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

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-md w-full text-center">
                    <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                        <AlertCircle size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Something went wrong</h3>
                    <p className="text-sm text-gray-500 mb-6">{error}</p>
                    <Button onClick={fetchDashboardData} className="w-full">
                        Try Again
                    </Button>
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
        <div className="min-h-screen bg-background flex flex-col pb-20">
            <main className="flex-grow pt-24 px-4 container mx-auto max-w-5xl">
                {/* Header & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1">Dashboard</h1>
                        <p className="text-muted-foreground text-sm">Track your exchanges and listed books.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                    {(['listings', 'requests', 'purchases', 'sold'] as const).map(tab => (
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
                             tab === 'requests' ? `Requests (${requests.incoming.length + requests.outgoing.length})` :
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

                    {activeTab === 'requests' && (
                        <div className="space-y-12">
                            {/* Incoming Requests */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    Incoming Requests 
                                    <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">{requests.incoming.length}</span>
                                </h3>
                                {requests.incoming.length === 0 ? (
                                    <p className="text-gray-500 text-sm italic">No open requests for your books.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {requests.incoming.map(req => (
                                            <div key={req.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                                <div className="flex gap-4 mb-4">
                                                    <div className="relative h-16 w-12 bg-gray-100 rounded flex-shrink-0">
                                                        <Image src={req.bookCoverUrl || "/placeholder.png"} alt={req.bookTitle} fill className="object-cover rounded" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-sm line-clamp-2">{req.bookTitle}</h4>
                                                        <p className="text-xs text-muted-foreground mt-1">From: {req.requesterName}</p>
                                                        <p className="text-xs font-bold text-primary mt-1">Offers: {req.creditsCost}c</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" onClick={() => handleAccept(req.id!)} className="flex-1 bg-green-600 hover:bg-green-700 text-white">Accept</Button>
                                                    <Button size="sm" onClick={() => handleReject(req.id!)} variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50">Reject</Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Outgoing Requests */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    Your Requests
                                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{requests.outgoing.length}</span>
                                </h3>
                                {requests.outgoing.length === 0 ? (
                                    <p className="text-gray-500 text-sm italic">You haven't requested any books.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {requests.outgoing.map(req => (
                                            <div key={req.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-4 opacity-75">
                                                <div className="relative h-16 w-12 bg-gray-100 rounded flex-shrink-0">
                                                    <Image src={req.bookCoverUrl || "/placeholder.png"} alt={req.bookTitle} fill className="object-cover rounded" />
                                                </div>
                                                <div className="flex-grow">
                                                    <h4 className="font-bold text-sm line-clamp-1">{req.bookTitle}</h4>
                                                    <p className="text-xs text-muted-foreground">Owner: {req.ownerName}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">Pending</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
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
