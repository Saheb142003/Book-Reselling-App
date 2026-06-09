import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/Button";
import { useNavigate } from "react-router-dom";
import { BookOpen, Edit3, Save, X, Shield } from "lucide-react";
import BookCard from "./books/BookCard";
import axios from "axios";

export default function UserProfile() {
    const { user, loading, refreshProfile } = useAuth();
    const navigate = useNavigate();
    
    const [myBooks, setMyBooks] = useState([]);
    const [boughtBooks, setBoughtBooks] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [activeTab, setActiveTab] = useState("listings");

    // Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [displayName, setDisplayName] = useState("");
    const [bio, setBio] = useState("");
    const [location, setLocation] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [saveLoading, setSaveLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchUserData();
            setDisplayName(user.displayName || "");
            setBio(user.bio || "");
            setLocation(user.location || "");
            setPhoneNumber(user.phoneNumber || "");
        }
    }, [user]);

    const fetchUserData = async () => {
        if (!user) return;
        setLoadingData(true);
        try {
            const [booksRes, exchangesRes] = await Promise.all([
                axios.get('/books/user/me'),
                axios.get('/exchanges')
            ]);
            setMyBooks(booksRes.data);
            
            const accepted = exchangesRes.data.filter(
                ex => (ex.requesterId?._id || ex.requesterId) === user._id && 
                      ex.status === 'accepted' && 
                      (!ex.bookId || ex.bookId.status !== 'resold')
            );
            setBoughtBooks(accepted);
        } catch (error) {
            console.error("Failed to fetch user data via user/me route, trying fallback:", error);
            try {
                const resFallback = await axios.get('/books');
                const allBooks = resFallback.data;
                const userBooks = allBooks.filter(b => b.sellerId && (b.sellerId._id === user._id || b.sellerId === user._id));
                setMyBooks(userBooks);
            } catch (fallbackError) {
                console.error("Failed to fetch user data via fallback:", fallbackError);
            }
        } finally {
            setLoadingData(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaveLoading(true);
        try {
            await axios.put('/auth/profile', {
                displayName,
                bio,
                location,
                phoneNumber
            });
            await refreshProfile();
            setIsEditing(false);
            alert("Profile updated successfully!");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to update profile.");
        } finally {
            setSaveLoading(false);
        }
    };

    if (loading) return null;

    if (!user) {
        return <div className="text-center p-10">Please log in to view your profile.</div>;
    }

    return (
        <div className="w-full pb-20">
            {/* Header Section */}
            <div className="flex flex-col items-center text-center mb-10 border border-border rounded-lg p-6 bg-card">
                <div className="h-24 w-24 rounded-full bg-muted border border-border mb-4 relative flex items-center justify-center">
                    <div className="h-full w-full rounded-full overflow-hidden flex items-center justify-center">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt={user.displayName || "User"} className="object-cover w-full h-full" />
                        ) : (
                            <div className="text-3xl font-bold text-muted-foreground">
                                {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                            </div>
                        )}
                    </div>
                    {!isEditing && (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-md border border-border hover:opacity-90 transition-opacity"
                        >
                            <Edit3 size={14} />
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <form onSubmit={handleSave} className="w-full max-w-md text-left flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">Name</label>
                            <input 
                                type="text"
                                className="bg-background border border-border rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">Bio</label>
                            <textarea 
                                className="bg-background border border-border rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none h-20"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Describe yourself..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-muted-foreground">Location</label>
                                <input 
                                    type="text"
                                    className="bg-background border border-border rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="City, Country"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-muted-foreground">Phone</label>
                                <input 
                                    type="text"
                                    className="bg-background border border-border rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="Phone number"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end mt-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={saveLoading}>
                                <X size={14} className="mr-1.5" /> Cancel
                            </Button>
                            <Button type="submit" size="sm" disabled={saveLoading}>
                                <Save size={14} className="mr-1.5" /> {saveLoading ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold text-foreground mb-1">{user.displayName || "Book Lover"}</h1>
                        <p className="text-muted-foreground text-sm mb-4 max-w-md">
                            {user.bio || "Passionate reader & book collector. 📚✨"}
                        </p>
                        {user.location && (
                            <p className="text-xs text-muted-foreground mb-4">📍 {user.location}</p>
                        )}
                        {/* Stats */}
                        <div className="flex gap-8 mt-2">
                            <div className="text-center">
                                <span className="block text-xl font-bold text-foreground">{user.booksSold || 0}</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Sold</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-xl font-bold text-foreground">{user.credits || 0}</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Credits</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-xl font-bold text-foreground">{user.booksListed || 0}</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Listed</span>
                            </div>
                        </div>
                        {user.role === 'admin' && (
                            <Button 
                                size="sm" 
                                className="mt-6 flex items-center gap-2"
                                onClick={() => navigate('/admin')}
                            >
                                <Shield size={14} />
                                Go to Admin Dashboard
                            </Button>
                        )}
                    </>
                )}
            </div>

            {/* Library Grid */}
            <div className="border-t border-border pt-8">
                {/* Tabs */}
                <div className="flex gap-4 border-b border-border mb-6 px-4 md:px-0">
                    <button 
                        onClick={() => setActiveTab("listings")} 
                        className={`pb-2.5 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'listings' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        My Listings ({myBooks.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab("bought")} 
                        className={`pb-2.5 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'bought' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        Purchased Books ({boughtBooks.length})
                    </button>
                </div>

                {loadingData ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 px-4 md:px-0">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="aspect-[2/3] bg-muted rounded-lg animate-pulse border border-border"></div>
                        ))}
                    </div>
                ) : activeTab === 'listings' ? (
                    myBooks.length === 0 ? (
                        <div className="text-center py-12 bg-card rounded-lg border border-dashed border-border mx-4 md:mx-0">
                            <p className="text-muted-foreground text-sm mb-4">You haven't listed any books for sale.</p>
                            <Button variant="outline" size="sm" onClick={() => navigate('/sell')}>List a Book</Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 px-4 md:px-0">
                            {myBooks.map((book) => (
                                <div key={book._id} className="h-full">
                                    <BookCard book={book} />
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    boughtBooks.length === 0 ? (
                        <div className="text-center py-12 bg-card rounded-lg border border-dashed border-border mx-4 md:mx-0">
                            <p className="text-muted-foreground text-sm mb-4">You haven't purchased any books yet.</p>
                            <Button variant="outline" size="sm" onClick={() => navigate('/')}>Explore Books</Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 px-4 md:px-0">
                            {boughtBooks.map((ex) => (
                                <div key={ex._id} className="border border-border rounded-lg overflow-hidden bg-card flex flex-col h-full">
                                    <div className="aspect-[2/3] w-full bg-muted relative overflow-hidden border-b border-border">
                                        <img src={ex.bookCoverUrl} alt={ex.bookTitle} className="object-cover w-full h-full" />
                                    </div>
                                    <div className="p-3 flex flex-col flex-grow justify-between gap-3">
                                        <div>
                                            <h4 className="font-bold text-sm line-clamp-1">{ex.bookTitle}</h4>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">Bought for {ex.creditsCost} Credits</p>
                                        </div>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="w-full text-xs"
                                            onClick={() => navigate(`/sell?reimportId=${ex.bookId?._id || ex.bookId}`)}
                                        >
                                            Resell Book
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
