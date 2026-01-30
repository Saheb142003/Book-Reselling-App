"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getPendingBooks, getAllBooks, getAdminStats, getAdminTransactions, approveBook, rejectBook, getUsers, updateUserRole } from "@/lib/db/admin";
import { Book } from "@/types/book";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface BookWithSeller extends Book {
    sellerName?: string;
}

interface Stats {
    totalUsers: number;
    totalBooks: number;
    totalExchanges: number;
}

export default function AdminDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // Data States
    const [pendingBooks, setPendingBooks] = useState<BookWithSeller[]>([]);
    const [allBooks, setAllBooks] = useState<BookWithSeller[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalBooks: 0, totalExchanges: 0 });
    
    // UI States
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'transactions' | 'users'>('pending');
    const [searchQuery, setSearchQuery] = useState("");
    const [creditInputs, setCreditInputs] = useState<Record<string, number>>({});

    useEffect(() => {
        if (!loading) {
            if (!user || user.role !== 'admin') {
                router.push("/");
                return;
            }
            fetchDashboardData();
        }
    }, [user, loading, router]);

    const fetchDashboardData = async () => {
        setIsLoadingData(true);
        try {
            const [pending, all, statsData, txs, usersData] = await Promise.all([
                getPendingBooks(),
                getAllBooks(),
                getAdminStats(),
                getAdminTransactions(),
                getUsers()
            ]);

            // Enrich books with seller names
            const enrichBooks = async (books: Book[]) => {
                return await Promise.all(
                    books.map(async (book) => {
                        let sellerName = "Unknown";
                        try {
                            const userSnap = await getDoc(doc(db, "users", book.sellerId));
                            if (userSnap.exists()) {
                                sellerName = userSnap.data().displayName || "No Name";
                            }
                        } catch (e) {
                            console.error("Failed to fetch seller", e);
                        }
                        return { ...book, sellerName };
                    })
                );
            };

            setPendingBooks(await enrichBooks(pending));
            setAllBooks(await enrichBooks(all));
            setStats(statsData);
            setTransactions(txs);
            setUsers(usersData);

            // Initialize credit inputs
            const initialCredits: Record<string, number> = {};
            pending.forEach(b => { if (b.id) initialCredits[b.id] = 1; });
            setCreditInputs(initialCredits);

        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleApprove = async (book: BookWithSeller) => {
        if (!book.id) return;
        const creditsToGive = creditInputs[book.id] || 1;
        try {
            await approveBook(book.id, book.sellerId, creditsToGive);
            setPendingBooks(prev => prev.filter(b => b.id !== book.id));
            fetchDashboardData(); 
            alert(`Approved "${book.title}". Credited ${creditsToGive} credits.`);
        } catch (error) {
            alert("Failed to approve book.");
        }
    };

    const handleReject = async (bookId?: string) => {
        if (!bookId) return;
        if (!confirm("Are you sure you want to reject this listing?")) return;
        try {
            await rejectBook(bookId);
            setPendingBooks(prev => prev.filter(b => b.id !== bookId));
            fetchDashboardData();
        } catch (error) {
            alert("Failed to reject book.");
        }
    };

    const handleRoleChange = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (!confirm(`Change role to ${newRole}?`)) return;
        try {
            await updateUserRole(userId, newRole);
            fetchDashboardData();
        } catch (error) {
            alert("Failed to update role.");
        }
    };

    const filteredBooks = (activeTab === 'pending' ? pendingBooks : allBooks).filter(book => 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        book.sellerName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredUsers = users.filter(u => 
        u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading || isLoadingData) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <div className="flex-grow flex items-center justify-center pt-32">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
            </div>
        );
    }

    if (!user || user.role !== 'admin') return null;

    return (
        <div className="min-h-screen bg-muted/30 flex flex-col pb-24">
            <main className="flex-grow pt-24 px-4 container mx-auto max-w-6xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                        <p className="text-sm text-muted-foreground">Overview of app activity</p>
                    </div>
                    <Button onClick={fetchDashboardData} variant="outline" size="sm" className="bg-card hover:bg-muted text-xs h-8">
                        Refresh Data
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    <div className="bg-card border border-border shadow-sm rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                        <h3 className="text-muted-foreground text-[10px] uppercase tracking-wider font-bold mb-1">Users</h3>
                        <p className="text-2xl font-black text-foreground">{stats.totalUsers}</p>
                    </div>
                    <div className="bg-card border border-border shadow-sm rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                        <h3 className="text-muted-foreground text-[10px] uppercase tracking-wider font-bold mb-1">Books</h3>
                        <p className="text-2xl font-black text-foreground">{stats.totalBooks}</p>
                    </div>
                    <div className="bg-card border border-border shadow-sm rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                        <h3 className="text-muted-foreground text-[10px] uppercase tracking-wider font-bold mb-1">Sales</h3>
                        <p className="text-2xl font-black text-foreground">{transactions.length}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex overflow-x-auto pb-2 mb-4 gap-2 no-scrollbar">
                    {(['pending', 'all', 'transactions', 'users'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                                activeTab === tab 
                                ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20" 
                                : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                            }`}
                        >
                            {tab === 'pending' ? 'Pending' : tab === 'all' ? 'All Books' : tab === 'transactions' ? 'Transactions' : 'Users'}
                        </button>
                    ))}
                </div>

                {/* Search */}
                {activeTab !== 'transactions' && (
                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder={activeTab === 'users' ? "Search users..." : "Search books..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-card border border-input shadow-sm rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm text-foreground placeholder:text-muted-foreground"
                        />
                    </div>
                )}

                {/* Content Area */}
                <div className="space-y-4">
                    {activeTab === 'transactions' && (
                        <div className="space-y-3">
                            {transactions.map((tx) => (
                                <div key={tx.id} className="bg-card border border-border shadow-sm rounded-xl p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-bold text-foreground text-sm">{tx.bookTitle}</h4>
                                            <p className="text-xs text-muted-foreground">{new Date(tx.timestamp).toLocaleDateString()}</p>
                                        </div>
                                        <span className="text-green-600 font-bold text-sm">+{tx.platformFee} Credits</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">
                                        <span>From: <span className="font-medium text-foreground">{tx.sellerName}</span></span>
                                        <span>To: <span className="font-medium text-foreground">{tx.buyerName}</span></span>
                                    </div>
                                </div>
                            ))}
                            {transactions.length === 0 && (
                                <div className="text-center py-10 text-muted-foreground text-sm">No transactions yet.</div>
                            )}
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="space-y-3">
                            {filteredUsers.map((u) => (
                                <div key={u.id} className="bg-card border border-border shadow-sm rounded-xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-muted/20 flex items-center justify-center text-sm font-bold text-muted-foreground">
                                            {u.displayName?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-foreground text-sm">{u.displayName || 'Unknown'}</h4>
                                            <p className="text-xs text-muted-foreground">{u.email}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                                                    u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-muted text-muted-foreground'
                                                }`}>
                                                    {u.role || 'user'}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground">• {u.credits || 0} Credits</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={() => handleRoleChange(u.id, u.role || 'user')} 
                                        variant="ghost" 
                                        size="sm"
                                        className="text-xs h-8 px-2 text-primary hover:bg-primary/5"
                                    >
                                        {u.role === 'admin' ? 'Demote' : 'Promote'}
                                    </Button>
                                </div>
                            ))}
                            {filteredUsers.length === 0 && (
                                <div className="text-center py-10 text-muted-foreground text-sm">No users found.</div>
                            )}
                        </div>
                    )}

                    {(activeTab === 'pending' || activeTab === 'all') && (
                        <div className="space-y-4">
                            {filteredBooks.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground text-sm">No books found.</div>
                            ) : (
                                filteredBooks.map((book) => (
                                    <div key={book.id} className="bg-card border border-border shadow-sm rounded-xl p-4 flex gap-4">
                                        <div className="h-24 w-16 relative flex-shrink-0 bg-muted rounded-lg overflow-hidden border border-border">
                                            <Image
                                                src={book.coverUrl && book.coverUrl.startsWith('http') ? book.coverUrl : "https://placehold.co/400x600?text=No+Cover"}
                                                alt={book.title}
                                                fill
                                                className="object-cover"
                                                sizes="64px"
                                            />
                                        </div>

                                        <div className="flex-grow min-w-0 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-tight mb-1">{book.title}</h3>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ml-2 ${
                                                        book.approvalStatus === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                        book.approvalStatus === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                    }`}>
                                                        {book.approvalStatus?.toUpperCase()}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mb-2">by {book.sellerName}</p>
                                            </div>

                                            {activeTab === 'pending' && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="flex items-center border border-input rounded-lg overflow-hidden h-8 bg-background">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="100"
                                                            value={creditInputs[book.id!] || 1}
                                                            onChange={(e) => setCreditInputs(prev => ({ ...prev, [book.id!]: parseInt(e.target.value) || 0 }))}
                                                            className="w-10 text-center text-xs font-bold focus:outline-none h-full bg-transparent text-foreground"
                                                        />
                                                    </div>
                                                    <Button onClick={() => handleApprove(book)} size="sm" className="h-8 text-xs bg-green-600 hover:bg-green-700 flex-grow text-white">
                                                        Approve
                                                    </Button>
                                                    <Button onClick={() => handleReject(book.id)} size="sm" variant="outline" className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50 w-8 p-0 flex items-center justify-center">
                                                        ✕
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
