import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/Button';

export default function Exchanges() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [exchanges, setExchanges] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else {
        fetchExchanges();
      }
    }
  }, [user, loading]);

  const fetchExchanges = async () => {
    setLoadingData(true);
    setError('');
    try {
      const res = await axios.get('/exchanges');
      setExchanges(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch exchanges. Please try again.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleUpdateStatus = async (exchangeId, status) => {
    try {
      await axios.put(`/exchanges/${exchangeId}/status`, { status });
      alert(`Request has been ${status}.`);
      fetchExchanges(); // Refresh list
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update exchange status.");
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-sm font-medium animate-pulse text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center max-w-md">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchExchanges}>Retry</Button>
      </div>
    );
  }

  // Filter incoming vs outgoing
  const incoming = exchanges.filter(ex => (ex.ownerId?._id || ex.ownerId) === user._id && ex.status === 'requested');
  const outgoing = exchanges.filter(ex => (ex.requesterId?._id || ex.requesterId) === user._id && ex.status === 'requested');
  const history = exchanges.filter(ex => ex.status !== 'requested');

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trade Dashboard</h1>
          <p className="text-muted-foreground text-sm">Manage your purchase requests, book offers, and transaction history.</p>
        </div>
        <Button variant="outline" onClick={fetchExchanges} size="sm">Refresh</Button>
      </div>

      {/* Incoming requests (Owner role) */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4">Requests to Buy Your Books ({incoming.length})</h2>
        {incoming.length === 0 ? (
          <div className="border border-dashed border-border rounded-lg p-6 text-center text-muted-foreground text-sm bg-card">
            No incoming purchase requests.
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden bg-card divide-y divide-border">
            {incoming.map((ex) => (
              <div key={ex._id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="font-bold text-sm">Book: {ex.bookTitle}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Buyer: <span className="font-semibold text-foreground">{ex.requesterName || ex.requesterId}</span></p>
                  <span className="inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground">
                    Credits Offered: {ex.creditsCost}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleUpdateStatus(ex._id, 'accepted')}>Accept & Sell</Button>
                  <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleUpdateStatus(ex._id, 'rejected')}>Reject</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Outgoing requests (Requester role) */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4">My Sent Purchase Requests ({outgoing.length})</h2>
        {outgoing.length === 0 ? (
          <div className="border border-dashed border-border rounded-lg p-6 text-center text-muted-foreground text-sm bg-card">
            No sent purchase requests pending.
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden bg-card divide-y divide-border">
            {outgoing.map((ex) => (
              <div key={ex._id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="font-bold text-sm">Book: {ex.bookTitle}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Status: <span className="capitalize font-semibold text-amber-600">{ex.status}</span></p>
                  <span className="inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground">
                    Credits: {ex.creditsCost}
                  </span>
                </div>
                <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleUpdateStatus(ex._id, 'cancelled')}>Cancel Request</Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      <div>
        <h2 className="text-lg font-bold mb-4">Completed Trades & History ({history.length})</h2>
        {history.length === 0 ? (
          <div className="border border-dashed border-border rounded-lg p-6 text-center text-muted-foreground text-sm bg-card">
            No past trades found.
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted border-b border-border">
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Book Name</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">My Role</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Credits</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((ex) => {
                  const isOwner = ex.ownerId === user._id || ex.ownerId?._id === user._id;
                  return (
                    <tr key={ex._id} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="p-3 text-sm font-medium">{ex.bookTitle}</td>
                      <td className="p-3 text-sm text-muted-foreground">{isOwner ? 'Seller' : 'Buyer'}</td>
                      <td className="p-3 text-sm">{ex.creditsCost}</td>
                      <td className="p-3 text-sm">
                        <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${
                          ex.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          ex.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {ex.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
