"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getPendingBooks, getAllBooks, getAdminStats, getAdminTransactions, approveBook, rejectBook, getUsers, updateUserRole } from "@/lib/db/admin";
import { Book } from "@/types/book";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
            <div className="min-h-screen bg-gradient-main flex flex-col">
                <Header />
                <div className="flex-grow flex items-center justify-center pt-32">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
            </div>
        );
    }

    if (!user || user.role !== 'admin') return null;

    return (
        <div className="min-h-screen bg-gradient-main flex flex-col">
            <Header />
            <main className="flex-grow pt-32 pb-10 px-4 container mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-muted-foreground">Manage books, users, and transactions.</p>
                    </div>
                    <Button onClick={fetchDashboardData} variant="outline" size="sm" className="bg-white hover:bg-gray-50">
                        Refresh Data
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
                        <h3 className="text-muted-foreground text-sm uppercase tracking-wider">Total Users</h3>
                        <p className="text-3xl font-bold mt-2 text-gray-900">{stats.totalUsers}</p>
                    </div>
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
                        <h3 className="text-muted-foreground text-sm uppercase tracking-wider">Total Books</h3>
                        <p className="text-3xl font-bold mt-2 text-gray-900">{stats.totalBooks}</p>
                    </div>
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
                        <h3 className="text-muted-foreground text-sm uppercase tracking-wider">Total Transactions</h3>
                        <p className="text-3xl font-bold mt-2 text-gray-900">{transactions.length}</p>
                    </div>
                </div>

                {/* Tabs & Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
                    <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm self-start overflow-x-auto max-w-full">
                        {(['pending', 'all', 'transactions', 'users'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                                    activeTab === tab 
                                    ? "bg-primary text-white shadow" 
                                    : "text-muted-foreground hover:text-gray-900 hover:bg-gray-50"
                                }`}
                            >
                                {tab === 'pending' ? 'Pending' : tab === 'all' ? 'All Books' : tab === 'transactions' ? 'Transactions' : 'Users'}
                            </button>
                        ))}
                    </div>

                    {activeTab !== 'transactions' && (
                        <input
                            type="text"
                            placeholder={activeTab === 'users' ? "Search users..." : "Search books..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full md:w-64 text-gray-900"
                        />
                    )}
                </div>

                {/* Content Area */}
                <div className="space-y-4">
                    {activeTab === 'transactions' && (
                        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-muted-foreground border-b border-gray-200">
                                    <tr>
                                        <th className="p-4 font-medium">Date</th>
                                        <th className="p-4 font-medium">Book</th>
                                        <th className="p-4 font-medium">Buyer</th>
                                        <th className="p-4 font-medium">Seller</th>
                                        <th className="p-4 font-medium">Price</th>
                                        <th className="p-4 font-medium">Fee (10%)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 text-gray-600">
                                                {tx.timestamp ? new Date(tx.timestamp).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="p-4 font-medium text-gray-900">{tx.bookTitle}</td>
                                            <td className="p-4 text-gray-600">{tx.buyerName}</td>
                                            <td className="p-4 text-gray-600">{tx.sellerName}</td>
                                            <td className="p-4 font-bold text-gray-900">{tx.basePrice}</td>
                                            <td className="p-4 font-bold text-green-600">+{tx.platformFee}</td>
                                        </tr>
                                    ))}
                                    {transactions.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-muted-foreground">No transactions yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-muted-foreground border-b border-gray-200">
                                    <tr>
                                        <th className="p-4 font-medium">User</th>
                                        <th className="p-4 font-medium">Email</th>
                                        <th className="p-4 font-medium">Role</th>
                                        <th className="p-4 font-medium">Credits</th>
                                        <th className="p-4 font-medium">Joined</th>
                                        <th className="p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredUsers.map((u) => (
                                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 font-medium text-gray-900 flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                                    {u.displayName?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                {u.displayName || 'Unknown'}
                                            </td>
                                            <td className="p-4 text-gray-600">{u.email}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {u.role || 'user'}
                                                </span>
                                            </td>
                                            <td className="p-4 font-bold text-gray-900">{u.credits || 0}</td>
                                            <td className="p-4 text-gray-600">
                                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="p-4">
                                                <Button 
                                                    onClick={() => handleRoleChange(u.id, u.role || 'user')} 
                                                    variant="outline" 
                                                    size="sm"
                                                    className="text-xs h-8"
                                                >
                                                    {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-muted-foreground">No users found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {(activeTab === 'pending' || activeTab === 'all') && (
                        <div className="grid gap-4">
                            {filteredBooks.length === 0 ? (
                                <div className="p-10 text-center text-muted-foreground bg-white border border-gray-200 shadow-sm rounded-xl">
                                    No books found.
                                </div>
                            ) : (
                                filteredBooks.map((book) => (
                                    <div key={book.id} className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 flex flex-col lg:flex-row gap-6 items-start lg:items-center transition-all hover:shadow-md">
                                        <div className="h-24 w-16 relative flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden shadow-sm border border-gray-200">
                                            <Image
                                                src={book.coverUrl && book.coverUrl.startsWith('http') ? book.coverUrl : "https://placehold.co/400x600?text=No+Cover"}
                                                alt={book.title}
                                                fill
                                                className="object-cover"
                                                sizes="64px"
                                            />
                                        </div>

                                        <div className="flex-grow min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-lg text-gray-900 truncate">{book.title}</h3>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                                    book.approvalStatus === 'approved' ? 'border-green-200 text-green-700 bg-green-50' :
                                                    book.approvalStatus === 'rejected' ? 'border-red-200 text-red-700 bg-red-50' :
                                                    'border-yellow-200 text-yellow-700 bg-yellow-50'
                                                }`}>
                                                    {book.approvalStatus?.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2">Seller: <span className="font-medium text-gray-700">{book.sellerName}</span></p>
                                            <div className="flex gap-4 text-xs text-muted-foreground">
                                                <span>{book.condition}</span>
                                                <span>•</span>
                                                <span>{new Date(book.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {/* Actions only for Pending Tab */}
                                        {activeTab === 'pending' && (
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0 w-full lg:w-auto bg-gray-50 p-4 rounded-xl border border-gray-200">
                                                <div className="flex flex-col">
                                                    <label className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">Assign Credits</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="100"
                                                        value={creditInputs[book.id!] || 1}
                                                        onChange={(e) => setCreditInputs(prev => ({ ...prev, [book.id!]: parseInt(e.target.value) || 0 }))}
                                                        className="w-24 bg-white border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-center font-bold text-gray-900"
                                                    />
                                                </div>
                                                <Button onClick={() => handleApprove(book)} className="bg-green-600 hover:bg-green-700 text-white h-full shadow-sm">
                                                    Approve
                                                </Button>
                                                <Button onClick={() => handleReject(book.id)} variant="outline" className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 h-full">
                                                    Reject
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
