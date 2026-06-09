import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Button } from '../components/ui/Button';

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const fetchBookDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/books/${id}`);
      setBook(res.data);
    } catch (err) {
      console.error(err);
      setError('Book details not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPurchase = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user._id === book.sellerId?._id || user._id === book.sellerId) {
      alert("You cannot buy your own book!");
      return;
    }

    const creditsNeeded = book.credits || book.price || 0;
    if (user.credits < creditsNeeded) {
      alert(`Insufficient credits! You need ${creditsNeeded} credits, but you only have ${user.credits}.`);
      return;
    }

    if (!confirm(`Are you sure you want to request this book for ${creditsNeeded} credits?`)) return;

    setRequesting(true);
    try {
      await axios.post('/exchanges', {
        bookId: book._id,
        bookTitle: book.title,
        bookCoverUrl: book.coverUrl || "https://placehold.co/400x600?text=No+Cover",
        requesterName: user.displayName || user.email,
        ownerId: book.sellerId?._id || book.sellerId,
        ownerName: book.sellerId?.displayName || 'Book Owner',
        creditsCost: creditsNeeded
      });
      
      await refreshProfile();
      alert("Purchase request sent successfully! The owner will review your request.");
      navigate('/exchanges');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create purchase request.");
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-sm font-medium animate-pulse text-muted-foreground">Loading book details...</div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <p className="text-red-500 mb-4">{error || 'Failed to load book.'}</p>
        <Button onClick={() => navigate('/explore')}>Back to Explore</Button>
      </div>
    );
  }

  const price = book.credits || book.price || 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Cover Column */}
        <div className="md:col-span-1">
          <div className="border border-border rounded-lg overflow-hidden bg-muted aspect-[2/3] w-full max-w-[280px] mx-auto shadow-sm">
            <img 
              src={book.coverUrl || "https://placehold.co/400x600?text=No+Cover"} 
              alt={book.title} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Info Column */}
        <div className="md:col-span-2 flex flex-col justify-between">
          <div>
            <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground mb-2 capitalize">
              {book.genre || 'General'}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">{book.title}</h1>
            <p className="text-muted-foreground text-sm mb-4">By <span className="font-semibold">{book.authors?.join(', ') || 'Unknown'}</span></p>

            <div className="border-t border-b border-border py-4 my-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="block text-xs text-muted-foreground font-semibold uppercase tracking-wider">Condition</span>
                <span className="font-medium capitalize">{book.condition}</span>
              </div>
              <div>
                <span className="block text-xs text-muted-foreground font-semibold uppercase tracking-wider">ISBN</span>
                <span className="font-medium">{book.isbn || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-xs text-muted-foreground font-semibold uppercase tracking-wider">Price</span>
                <span className="font-bold text-foreground">₹{price} Credits</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Description</h3>
              <p className="text-foreground text-sm leading-relaxed whitespace-pre-line">
                {book.description || 'No description provided.'}
              </p>
            </div>
            
            <div className="mb-6 p-4 border border-border rounded-lg bg-card text-xs flex flex-col gap-1.5">
              <span className="font-semibold text-muted-foreground uppercase tracking-wider">Seller Details</span>
              <span className="font-bold text-sm">{book.sellerId?.displayName || 'Platform User'}</span>
              <span className="text-muted-foreground">{book.sellerId?.email}</span>
            </div>
          </div>

          <div className="flex gap-4 border-t border-border pt-6 mt-6">
            <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>
              Back
            </Button>
            <Button 
              className="flex-1"
              onClick={handleRequestPurchase} 
              disabled={requesting || (user && user._id === (book.sellerId?._id || book.sellerId))}
            >
              {requesting ? "Requesting..." : "Buy with Credits"}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
