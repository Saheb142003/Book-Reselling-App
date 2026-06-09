import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import axios from "axios";

export default function ListBookForm() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [isbn, setIsbn] = useState("");
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [description, setDescription] = useState("");
    const [condition, setCondition] = useState("Good");
    const [genre, setGenre] = useState("Fiction");

    const [minPrice, setMinPrice] = useState("0");
    const [price, setPrice] = useState(""); // Replaces 'credits' as the main price input

    const [coverFile, setCoverFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [purchasedBooks, setPurchasedBooks] = useState([]);
    const [prefilledFromBought, setPrefilledFromBought] = useState(false);
    const [resoldFromBookId, setResoldFromBookId] = useState("");

    useEffect(() => {
        const fetchPurchasedAndPrefill = async () => {
            try {
                // Fetch exchanges to populate "Quick Resell" dropdown
                const exchangesRes = await axios.get('/exchanges');
                const accepted = exchangesRes.data.filter(
                    ex => (ex.requesterId?._id || ex.requesterId) === user?._id && 
                          ex.status === 'accepted' && 
                          ex.bookId && 
                          ex.bookId.status !== 'resold'
                );
                setPurchasedBooks(accepted);

                // Check for query parameter
                const searchParams = new URLSearchParams(window.location.search);
                const reimportId = searchParams.get("reimportId");
                if (reimportId) {
                    const bookRes = await axios.get(`/books/${reimportId}`);
                    const book = bookRes.data;
                    setIsbn(book.isbn || "");
                    setTitle(book.title || "");
                    setAuthor(book.authors?.[0] || "");
                    setDescription(book.description || "");
                    setGenre(book.genre || "Fiction");
                    setCondition(book.condition || "Good");
                    setPreviewUrl(book.coverUrl || "");
                    setPrice(book.credits || "");
                    setMinPrice(book.minPrice || "0");
                    setPrefilledFromBought(true);
                    setResoldFromBookId(reimportId);
                }
            } catch (err) {
                console.error("Error loading bought books or prefilling form:", err);
            }
        };

        if (user) {
            fetchPurchasedAndPrefill();
        }
    }, [user]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCoverFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        setError("");

        try {
            let finalCoverUrl = previewUrl || "https://placehold.co/400x600?text=No+Cover";

            if (coverFile) {
                const formData = new FormData();
                formData.append("image", coverFile);
                
                const uploadRes = await axios.post('/books/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                
                if (uploadRes.data && uploadRes.data.url) {
                    finalCoverUrl = uploadRes.data.url;
                }
            }

            await axios.post('/books', {
                isbn: isbn || "N/A",
                title,
                authors: [author],
                description,
                credits: Number(price) || 0,
                minPrice: Number(minPrice) || 0,
                price: Number(price) || 0,
                condition: condition,
                genre,
                coverUrl: finalCoverUrl,
                status: 'available',
                approvalStatus: prefilledFromBought ? 'approved' : 'pending',
                resoldFromBookId: resoldFromBookId || undefined
            });

            if (prefilledFromBought) {
                alert("Book listed successfully! Since this is a resold book, it is instantly approved and active on the explore page.");
            } else {
                alert("Book listed successfully! It is now pending admin approval.");
            }
            navigate("/account");
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.message || "Failed to list book. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto flex flex-col gap-6 p-6 rounded-lg border border-border bg-card">
            <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">List a Book</h2>
                <p className="text-muted-foreground text-xs">Share your book with the community.</p>
            </div>

            {error && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm">
                    {error}
                </div>
            )}

            {prefilledFromBought && (
                <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20 text-green-600 text-xs flex items-center justify-between">
                    <span>✨ Pre-filled details from your purchased book.</span>
                    <button 
                        type="button" 
                        onClick={() => {
                            setIsbn("");
                            setTitle("");
                            setAuthor("");
                            setDescription("");
                            setGenre("Fiction");
                            setCondition("Good");
                            setPreviewUrl("");
                            setPrice("");
                            setMinPrice("0");
                            setPrefilledFromBought(false);
                            setResoldFromBookId("");
                            // Clear query string
                            navigate('/sell', { replace: true });
                        }}
                        className="underline hover:opacity-85 text-[10px] font-semibold uppercase tracking-wider"
                    >
                        Clear
                    </button>
                </div>
            )}

            {purchasedBooks.length > 0 && (
                <div className="flex flex-col gap-1.5 p-4 bg-muted/40 rounded-lg border border-border">
                    <label className="text-xs font-semibold text-muted-foreground">Quick Resell: Select one of your purchased books</label>
                    <div className="relative">
                        <select
                            onChange={async (e) => {
                                const selectedId = e.target.value;
                                if (!selectedId) {
                                    setIsbn("");
                                    setTitle("");
                                    setAuthor("");
                                    setDescription("");
                                    setGenre("Fiction");
                                    setCondition("Good");
                                    setPreviewUrl("");
                                    setPrice("");
                                    setMinPrice("0");
                                    setPrefilledFromBought(false);
                                    setResoldFromBookId("");
                                    return;
                                }
                                try {
                                    const bookRes = await axios.get(`/books/${selectedId}`);
                                    const book = bookRes.data;
                                    setIsbn(book.isbn || "");
                                    setTitle(book.title || "");
                                    setAuthor(book.authors?.[0] || "");
                                    setDescription(book.description || "");
                                    setGenre(book.genre || "Fiction");
                                    setCondition(book.condition || "Good");
                                    setPreviewUrl(book.coverUrl || "");
                                    setPrice(book.credits || "");
                                    setMinPrice(book.minPrice || "0");
                                    setPrefilledFromBought(true);
                                    setResoldFromBookId(selectedId);
                                } catch (err) {
                                    console.error("Error loading selected book:", err);
                                }
                            }}
                            className="w-full bg-background border border-border rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground appearance-none cursor-pointer transition-all"
                            defaultValue=""
                        >
                            <option value="">-- Select a purchased book to resell --</option>
                            {purchasedBooks.map((ex) => (
                                <option key={ex._id} value={ex.bookId?._id || ex.bookId}>
                                    {ex.bookTitle} (Bought for {ex.creditsCost} credits)
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Selecting a book will pre-fill all details below. You can customize the selling price and condition.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Title</label>
                    <input
                        type="text"
                        required
                        className="bg-background border border-border rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/50 transition-all"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="The Great Gatsby"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Author</label>
                    <input
                        type="text"
                        required
                        className="bg-background border border-border rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/50 transition-all"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="F. Scott Fitzgerald"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Description</label>
                <textarea
                    required
                    rows={4}
                    className="bg-background border border-border rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none text-foreground placeholder:text-muted-foreground/50 transition-all"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe the book..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/40 rounded-lg border border-border">
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Selling Price (₹)</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">₹</span>
                        <input
                            type="number"
                            required
                            min="0"
                            className="w-full bg-background border border-border rounded-md p-2.5 pl-7 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/50 transition-all"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="299"
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Minimum Acceptable Price (₹)</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">₹</span>
                        <input
                            type="number"
                            min="0"
                            className="w-full bg-background border border-border rounded-md p-2.5 pl-7 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/50 transition-all"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            placeholder="Optional"
                        />
                    </div>
                    <p className="text-[10px] text-muted-foreground">Lowest price you'd accept in a negotiation.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Condition</label>
                    <div className="relative">
                        <select
                            className="w-full bg-background border border-border rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground appearance-none cursor-pointer transition-all"
                            value={condition}
                            onChange={(e) => setCondition(e.target.value)}
                        >
                            <option value="New">New</option>
                            <option value="Like New">Like New</option>
                            <option value="Good">Good</option>
                            <option value="Fair">Fair</option>
                            <option value="Poor">Poor</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Genre</label>
                    <div className="relative">
                        <select
                            className="w-full bg-background border border-border rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground appearance-none cursor-pointer transition-all"
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                        >
                            <option value="Fiction">Fiction</option>
                            <option value="Non-Fiction">Non-Fiction</option>
                            <option value="Sci-Fi">Sci-Fi</option>
                            <option value="Mystery">Mystery</option>
                            <option value="Romance">Romance</option>
                            <option value="Thriller">Thriller</option>
                            <option value="Fantasy">Fantasy</option>
                            <option value="Biography">Biography</option>
                            <option value="History">History</option>
                            <option value="Self-Help">Self-Help</option>
                            <option value="Textbook">Textbook</option>
                            <option value="Other">Other</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Book Cover</label>
                    <div className="flex items-center gap-4">
                        <label className="flex-grow cursor-pointer group bg-background border border-border rounded-md p-2.5 hover:bg-muted/50 transition-all border-dashed text-center text-muted-foreground text-sm flex items-center justify-center gap-2 h-[42px]">
                            <svg className="text-muted-foreground group-hover:text-primary transition-colors" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                            <span className="truncate max-w-[150px]">{coverFile ? coverFile.name : "Upload Image"}</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                        {previewUrl && (
                            <div className="relative h-[42px] w-[32px] shrink-0 rounded border border-border overflow-hidden">
                                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">ISBN (Optional)</label>
                <input
                    type="text"
                    className="bg-background border border-border rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/50 transition-all"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="978-3-16-148410-0"
                />
            </div>

            <Button type="submit" className="mt-2 w-full py-2.5 text-sm font-semibold" disabled={loading}>
                {loading ? "Listing Book..." : "List Book"}
            </Button>
        </form>
    );
}
