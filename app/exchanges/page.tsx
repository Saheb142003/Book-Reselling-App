"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserExchanges } from "@/lib/db/exchanges";
import { getUserBooks } from "@/lib/db/books";
import { Exchange } from "@/types/exchange";
import { Book } from "@/types/book";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SellerDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // State
    const [purchases, setPurchases] = useState<Exchange[]>([]);
    const [soldBooks, setSoldBooks] = useState<Exchange[]>([]);
    const [myBooks, setMyBooks] = useState<Book[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [activeTab, setActiveTab] = useState<'listings' | 'purchases' | 'sold'>('listings');

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
            
            // Incoming = Requests for my books (Sold/Requested)
            // Outgoing = Requests I made (Purchases)
            
            // In Instant Buy, 'incoming' are effectively sold books (or requested if legacy)
            // 'outgoing' are my purchases
            
            // Filter only accepted/sold ones just in case
            // But with Instant Buy, everything is 'sold' immediately. 
            // We can just use the lists.
            
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
            <div className="min-h-screen bg-gradient-main flex flex-col">
                <Header />
                <div className="flex-grow flex items-center justify-center pt-32">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
            </div>
        );
    }

    const ExchangeCard = ({ item, type }: { item: Exchange, type: 'purchase' | 'sold' }) => {
        return (
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 flex flex-col sm:flex-row gap-6 items-center transition-all hover:shadow-md">
                <div className="h-24 w-16 relative flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    <Image
                        src={item.bookCoverUrl || "/placeholder-book.png"}
                        alt={item.bookTitle}
                        fill
                        className="object-cover"
                    />
                </div>

                <div className="flex-grow text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg text-gray-900">{item.bookTitle}</h3>
                        <span className="text-[10px] uppercase px-2 py-0.5 rounded-full border border-green-200 text-green-700 bg-green-50 self-center sm:self-auto">
                            {type === 'sold' ? 'SOLD' : 'PURCHASED'}
                        </span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-1">
                        {type === 'purchase'
                            ? `Seller: ${item.ownerName}`
                            : `Buyer: ${item.requesterName}`
                        }
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Date: {item.createdAt?.toLocaleDateString()}
                    </p>
                </div>

                <div className="flex flex-col gap-2 min-w-[120px]">
                    <div className="text-center bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <span className="block text-xs text-muted-foreground uppercase tracking-wider">{type === 'purchase' ? 'Paid' : 'Earned'}</span>
                        <span className="font-bold text-primary text-lg">{item.creditsCost} <span className="text-xs font-normal text-muted-foreground">Credits</span></span>
                    </div>
                </div>
            </div>
        );
    };

    const BookCard = ({ book }: { book: Book }) => (
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 flex flex-col sm:flex-row gap-6 items-center transition-all hover:shadow-md">
            <div className="h-24 w-16 relative flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <Image
                    src={book.coverUrl || "/placeholder-book.png"}
                    alt={book.title}
                    fill
                    className="object-cover"
                />
            </div>
            <div className="flex-grow text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{book.title}</h3>
                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full border ${
                        book.status === 'sold' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                        book.approvalStatus === 'approved' ? 'border-green-200 text-green-700 bg-green-50' :
                        book.approvalStatus === 'rejected' ? 'border-red-200 text-red-700 bg-red-50' :
                        'border-yellow-200 text-yellow-700 bg-yellow-50'
                    }`}>
                        {book.status === 'sold' ? 'SOLD' : book.approvalStatus?.toUpperCase()}
                    </span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                    Listed on {new Date(book.createdAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground">
                    Condition: {book.condition}
                </p>
            </div>
            <div className="flex flex-col gap-2 min-w-[120px]">
                {book.status === 'sold' ? (
                     <div className="text-center bg-blue-50 rounded-lg p-3 border border-blue-100">
                        <span className="block text-xs text-blue-600 uppercase tracking-wider">Sold</span>
                        <span className="font-bold text-blue-700">Completed</span>
                    </div>
                ) : (
                    <div className="text-center bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <span className="block text-xs text-muted-foreground uppercase tracking-wider">Status</span>
                        <span className="font-medium text-gray-900">
                            {book.approvalStatus === 'pending' ? 'In Review' : 
                             book.approvalStatus === 'approved' ? 'Live' : 'Rejected'}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-main flex flex-col">
            <Header />
            <main className="flex-grow pt-32 pb-10 px-4 container mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <Button onClick={() => router.push('/sell')} size="sm" className="shadow-sm">
                        List New Book
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-gray-200 mb-8 overflow-x-auto">
                    {(['listings', 'purchases', 'sold'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 px-2 text-sm font-medium transition-all relative whitespace-nowrap ${
                                activeTab === tab 
                                ? 'text-primary' 
                                : 'text-muted-foreground hover:text-gray-900'
                            }`}
                        >
                            {tab === 'listings' ? `My Listings (${myBooks.length})` :
                             tab === 'purchases' ? `My Purchases (${purchases.length})` :
                             `Sold Books (${soldBooks.length})`}
                            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="space-y-4">
                    {activeTab === 'listings' && (
                        myBooks.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground bg-white border border-gray-200 rounded-xl shadow-sm">
                                <p className="mb-4">You haven't listed any books yet.</p>
                                <Button onClick={() => router.push('/sell')} variant="outline">Start Selling</Button>
                            </div>
                        ) : (
                            myBooks.map(book => <BookCard key={book.id} book={book} />)
                        )
                    )}

                    {activeTab === 'purchases' && (
                        purchases.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground bg-white border border-gray-200 rounded-xl shadow-sm">No purchases yet.</div>
                        ) : (
                            purchases.map(ex => <ExchangeCard key={ex.id} item={ex} type="purchase" />)
                        )
                    )}

                    {activeTab === 'sold' && (
                        soldBooks.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground bg-white border border-gray-200 rounded-xl shadow-sm">No books sold yet.</div>
                        ) : (
                            soldBooks.map(ex => <ExchangeCard key={ex.id} item={ex} type="sold" />)
                        )
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
