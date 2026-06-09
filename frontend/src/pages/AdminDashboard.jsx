import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/Button';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pendingBooks, setPendingBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') {
        navigate('/login');
      } else {
        fetchAdminData();
      }
    }
  }, [user, loading]);

  const fetchAdminData = async () => {
    setLoadingData(true);
    setError('');
    try {
      const [statsRes, booksRes, txRes] = await Promise.all([
        axios.get('/admin/stats'),
        axios.get('/admin/pending-books'),
        axios.get('/admin/transactions')
      ]);
      setStats(statsRes.data);
      setPendingBooks(booksRes.data);
      setTransactions(txRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch admin dashboard data. Please try again.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleApprove = async (bookId) => {
    const creditsStr = prompt("Enter credits amount to award the seller for this book:", "100");
    if (creditsStr === null) return; // cancelled
    const creditAmount = Number(creditsStr);
    if (isNaN(creditAmount) || creditAmount < 0) {
      alert("Please enter a valid positive number.");
      return;
    }

    try {
      await axios.post(`/admin/approve-book/${bookId}`, { creditAmount });
      alert("Book approved successfully!");
      fetchAdminData(); // Refresh data
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to approve book.");
    }
  };

  const handleReject = async (bookId) => {
    if (!confirm("Are you sure you want to reject this book?")) return;
    try {
      await axios.post(`/admin/reject-book/${bookId}`);
      alert("Book rejected.");
      fetchAdminData(); // Refresh data
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to reject book.");
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-background">
        <div className="text-sm font-medium animate-pulse text-muted-foreground">Loading admin dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-4xl text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchAdminData}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">Overview of platform activities and pending reviews.</p>
        </div>
        <Button variant="outline" onClick={fetchAdminData}>Refresh</Button>
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="border border-border p-6 rounded-lg bg-card shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Users</span>
            <h2 className="text-4xl font-extrabold mt-1">{stats.totalUsers}</h2>
          </div>
          <div className="border border-border p-6 rounded-lg bg-card shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Books</span>
            <h2 className="text-4xl font-extrabold mt-1">{stats.totalBooks}</h2>
          </div>
          <div className="border border-border p-6 rounded-lg bg-card shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Exchanges</span>
            <h2 className="text-4xl font-extrabold mt-1">{stats.totalExchanges}</h2>
          </div>
        </div>
      )}

      {/* Pending Books Section */}
      <div>
        <h2 className="text-xl font-bold mb-4">Pending Approvals ({pendingBooks.length})</h2>
        {pendingBooks.length === 0 ? (
          <div className="border border-dashed border-border rounded-lg p-10 text-center text-muted-foreground">
            No books pending approval at the moment.
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted border-b border-border">
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Book Details</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Seller</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Condition / Genre</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingBooks.map((book) => (
                  <tr key={book._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex gap-4">
                        <img 
                          src={book.coverUrl || "https://placehold.co/400x600?text=No+Cover"} 
                          alt={book.title} 
                          className="w-12 h-16 object-cover border border-border rounded"
                        />
                        <div>
                          <h4 className="font-bold text-sm text-foreground">{book.title}</h4>
                          <p className="text-xs text-muted-foreground">By {book.authors?.join(', ')}</p>
                          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-muted font-bold text-foreground">
                            Price: ₹{book.credits || book.price}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="block font-medium text-sm">{book.sellerId?.displayName || 'Unknown Seller'}</span>
                      <span className="block text-xs text-muted-foreground">{book.sellerId?.email}</span>
                    </td>
                    <td className="p-4 text-sm">
                      <span className="block">{book.condition}</span>
                      <span className="block text-xs text-muted-foreground">{book.genre}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleApprove(book._id)}>Approve</Button>
                        <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleReject(book._id)}>Reject</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Log Section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">Transaction History ({transactions.length})</h2>
        {transactions.length === 0 ? (
          <div className="border border-dashed border-border rounded-lg p-10 text-center text-muted-foreground bg-card">
            No transactions recorded yet.
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted border-b border-border">
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Exchange ID</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Book Name</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Buyer (Requester)</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Seller (Owner)</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Base Price (Credits)</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Buyer Cut (5%)</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Seller Cut (5%)</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Total Platform Cut (10%)</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const bFee = tx.buyerFee || Math.floor(tx.creditsCost * 0.05);
                    const sFee = tx.sellerFee || Math.floor(tx.creditsCost * 0.05);
                    const totalCut = bFee + sFee;
                    return (
                      <tr key={tx._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4 text-xs font-mono truncate max-w-[120px]" title={tx._id}>
                          {tx._id}
                        </td>
                        <td className="p-4 text-sm font-semibold text-foreground">
                          {tx.bookTitle}
                        </td>
                        <td className="p-4 text-sm">
                          <span className="block font-medium">{tx.requesterName}</span>
                          <span className="block text-xs text-muted-foreground">{tx.requesterId?.email || 'N/A'}</span>
                        </td>
                        <td className="p-4 text-sm">
                          <span className="block font-medium">{tx.ownerName}</span>
                          <span className="block text-xs text-muted-foreground">{tx.ownerId?.email || 'N/A'}</span>
                        </td>
                        <td className="p-4 text-sm text-right font-medium">
                          {tx.creditsCost}
                        </td>
                        <td className="p-4 text-sm text-right text-red-500 font-medium">
                          -{bFee}
                        </td>
                        <td className="p-4 text-sm text-right text-red-500 font-medium">
                          -{sFee}
                        </td>
                        <td className="p-4 text-sm text-right text-green-600 font-bold">
                          +{totalCut}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
