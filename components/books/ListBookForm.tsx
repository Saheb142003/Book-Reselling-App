"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { addBook } from "@/lib/db/books";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export default function ListBookForm() {
    const { user } = useAuth();
    const router = useRouter();

    const [isbn, setIsbn] = useState("");
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [description, setDescription] = useState("");
    const [condition, setCondition] = useState("Good");
    const [genre, setGenre] = useState("Fiction");

    // Changing coverUrl string to file state
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCoverFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        setError("");

        try {
            let finalCoverUrl = "";

            // Upload Image if selected
            if (coverFile) {
                const storageRef = ref(storage, `book-covers/${user.uid}/${Date.now()}_${coverFile.name}`);
                await uploadBytes(storageRef, coverFile);
                finalCoverUrl = await getDownloadURL(storageRef);
            }

            await addBook({
                sellerId: user.uid,
                isbn: isbn || "N/A",
                title,
                authors: [author], // Simple array for now
                description,
                credits: 0, // Admin assigns credits
                price: 0, // Deprecated
                condition: condition as any,
                genre,
                coverUrl: finalCoverUrl || "https://placehold.co/400x600?text=No+Cover", // Default
                status: 'available',
                approvalStatus: 'pending' // Admin must approve
            });

            alert("Book listed successfully! It is now pending approval.");
            router.push("/profile");
            router.refresh(); // Update profile counts
        } catch (err: any) {
            console.error(err);
            setError("Failed to list book. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto flex flex-col gap-6 p-8 rounded-2xl glass shadow-xl">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">List a Book</h2>
                <p className="text-muted-foreground text-sm">Share your book with the community.</p>
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium ml-1 text-foreground">Title</label>
                    <input
                        type="text"
                        required
                        className="bg-white/50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground placeholder:text-gray-400 transition-all"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="The Great Gatsby"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium ml-1 text-foreground">Author</label>
                    <input
                        type="text"
                        required
                        className="bg-white/50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground placeholder:text-gray-400 transition-all"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="F. Scott Fitzgerald"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium ml-1 text-foreground">Description</label>
                <textarea
                    required
                    rows={4}
                    className="bg-white/50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none text-foreground placeholder:text-gray-400 transition-all"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe the book..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium ml-1 text-foreground">Condition</label>
                    <div className="relative">
                        <select
                            className="w-full bg-white/50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground appearance-none cursor-pointer transition-all"
                            value={condition}
                            onChange={(e) => setCondition(e.target.value)}
                        >
                            <option value="New">New</option>
                            <option value="Like New">Like New</option>
                            <option value="Good">Good</option>
                            <option value="Fair">Fair</option>
                            <option value="Poor">Poor</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium ml-1 text-foreground">Genre</label>
                    <div className="relative">
                        <select
                            className="w-full bg-white/50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground appearance-none cursor-pointer transition-all"
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
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium ml-1 text-foreground">Book Cover</label>
                    <div className="flex items-center gap-4">
                        <label className="flex-grow cursor-pointer group bg-white/50 border border-gray-200 rounded-xl p-3 hover:bg-white/80 transition-all border-dashed text-center text-muted-foreground text-sm flex items-center justify-center gap-2 h-[50px]">
                            <svg className="text-gray-400 group-hover:text-primary transition-colors" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                            <span className="truncate max-w-[150px]">{coverFile ? coverFile.name : "Upload Image"}</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                        {previewUrl && (
                            <div className="relative h-[50px] w-[40px] shrink-0 rounded overflow-hidden border border-gray-200 shadow-sm">
                                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium ml-1 text-foreground">ISBN (Optional)</label>
                <input
                    type="text"
                    className="bg-white/50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground placeholder:text-gray-400 transition-all"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="978-3-16-148410-0"
                />
            </div>

            <Button type="submit" className="mt-4 w-full py-6 text-lg font-medium shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all" disabled={loading}>
                {loading ? "Listing Book..." : "List Book"}
            </Button>
        </form>
    );
}
