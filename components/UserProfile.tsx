"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { getUserBooks, deleteBook } from "@/lib/db/books";
import { getUserTransactions, Transaction } from "@/lib/db/transactions";
import { Book } from "@/types/book";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function UserProfile() {
    const { user, logout, loading } = useAuth();
    const router = useRouter();
    
    // Data States
    const [myBooks, setMyBooks] = useState<Book[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    
    // UI States
    const [activeTab, setActiveTab] = useState<'listings' | 'history'>('listings');
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
            const [books, txs] = await Promise.all([
                getUserBooks(user.uid),
                getUserTransactions(user.uid)
            ]);
            setMyBooks(books);
            setTransactions(txs);
        } catch (error) {
            console.error("Failed to fetch user data:", error);
        } finally {
            setLoadingData(false);
        }
    };

    const handleDelete = async (bookId?: string) => {
        if (!bookId) return;
        if (!confirm("Are you sure you want to delete this listing? This cannot be undone.")) return;
        
        try {
            await deleteBook(bookId);
            setMyBooks(prev => prev.filter(b => b.id !== bookId));
        } catch (error) {
            alert("Failed to delete book.");
        }
    };

    const handleEdit = (bookId?: string) => {
        if (!bookId) return;
        router.push(`/sell?edit=${bookId}`);
    };

    if (loading) {
        return <div className="text-center p-10">Loading profile...</div>;
    }

    if (!user) {
        return <div className="text-center p-10">Please log in to view your profile.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Profile Card */}
            <div className="glass-nav border border-white/10 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-white">My Profile</h1>
                    <Button variant="outline" size="sm" onClick={logout} className="text-red-400 hover:bg-red-500/10 border-red-500/20 hover:text-red-300">
                        Sign Out
                    </Button>
                </div>

                <div className="grid gap-6">
                    <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                        <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center text-2xl text-white font-bold">
                            {user.displayName?.[0] || user.email?.[0] || "U"}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{user.displayName || "No Name Set"}</h3>
                            <p className="text-gray-300 text-sm">{user.email}</p>
                            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white border border-white/20">
                                {user.role?.toUpperCase() || "USER"}
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                            <span className="text-sm text-gray-300 block mb-1 uppercase tracking-wider">Credits</span>
                            <span className="font-bold text-2xl text-accent">{user.credits || 0}</span>
                        </div>
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                            <span className="text-sm text-gray-300 block mb-1 uppercase tracking-wider">Listed</span>
                            <span className="font-bold text-2xl text-white">{user.booksListed || 0}</span>
                        </div>
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                            <span className="text-sm text-gray-300 block mb-1 uppercase tracking-wider">Sold</span>
                            <span className="font-bold text-2xl text-white">{user.booksSold || 0}</span>
                        </div>
                    </div>

                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                        <span className="text-sm text-gray-300 block mb-1">Member Since</span>
                        <span className="font-medium text-white">
                            {user.createdAt ? (
                                user.createdAt instanceof Date
                                    ? user.createdAt.toLocaleDateString()
                                    : new Date(user.createdAt).toLocaleDateString()
                            ) : "N/A"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('listings')}
                    className={`pb-2 px-4 text-sm font-medium transition-colors relative ${
                        activeTab === 'listings' 
                        ? "text-primary border-b-2 border-primary" 
                        : "text-muted-foreground hover:text-gray-900"
                    }`}
                >
                    My Listings
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-2 px-4 text-sm font-medium transition-colors relative ${
                        activeTab === 'history' 
                        ? "text-primary border-b-2 border-primary" 
                        : "text-muted-foreground hover:text-gray-900"
                    }`}
                >
                    Transaction History
                </button>
            </div>

            {/* Tab Content */}
            <div className="glass rounded-2xl p-8 shadow-sm min-h-[300px]">
                {loadingData ? (
                    <div className="text-center py-10 text-muted-foreground">Loading data...</div>
                ) : activeTab === 'listings' ? (
                    /* Listings Tab */
                    myBooks.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground bg-gray-50 rounded-xl border border-gray-200">
                            You haven't listed any books yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {myBooks.map((book) => (
                                <div key={book.id} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 hover:shadow-md transition-all relative group">
                                    <div className="h-24 w-16 relative flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                        <Image
                                            src={book.coverUrl || "/placeholder-book.png"}
                                            alt={book.title}
                                            fill
                                            className="object-cover"
                                            sizes="64px"
                                        />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-gray-900 truncate pr-2">{book.title}</h3>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${
                                                book.status === 'sold' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                                                book.approvalStatus === 'approved' ? 'border-green-200 text-green-700 bg-green-50' :
                                                book.approvalStatus === 'rejected' ? 'border-red-200 text-red-700 bg-red-50' :
                                                'border-yellow-200 text-yellow-700 bg-yellow-50'
                                            }`}>
                                                {book.status === 'sold' ? 'SOLD' : book.approvalStatus?.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-1">{book.authors?.join(", ")}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                                            <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{book.condition}</span>
                                            <span>•</span>
                                            <span>{book.createdAt ? new Date(book.createdAt).toLocaleDateString() : 'N/A'}</span>
                                        </div>

                                        {/* Actions */}
                                        {book.status !== 'sold' && (
                                            <div className="mt-3 flex gap-2">
                                                <Button 
                                                    onClick={() => handleEdit(book.id)} 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="h-7 text-xs px-2"
                                                >
                                                    Edit
                                                </Button>
                                                <Button 
                                                    onClick={() => handleDelete(book.id)} 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="h-7 text-xs px-2 text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50"
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    /* History Tab */
                    transactions.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground bg-gray-50 rounded-xl border border-gray-200">
                            No transactions found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-muted-foreground border-b border-gray-200">
                                    <tr>
                                        <th className="p-4 font-medium">Date</th>
                                        <th className="p-4 font-medium">Type</th>
                                        <th className="p-4 font-medium">Book</th>
                                        <th className="p-4 font-medium">Amount</th>
                                        <th className="p-4 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {transactions.map((tx) => {
                                        const isBuyer = tx.buyerId === user.uid;
                                        return (
                                            <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4 text-gray-600">
                                                    {tx.timestamp ? new Date(tx.timestamp).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        isBuyer ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                                    }`}>
                                                        {isBuyer ? 'BOUGHT' : 'SOLD'}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-medium text-gray-900">{tx.bookTitle}</td>
                                                <td className="p-4 font-bold text-gray-900">
                                                    {isBuyer ? `-${tx.buyerPaid}` : `+${tx.sellerReceived}`}
                                                </td>
                                                <td className="p-4 text-green-600 font-medium">
                                                    Completed
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
