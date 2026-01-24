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
                coverUrl: finalCoverUrl || "https://placehold.co/400x600?text=No+Cover", // Default
                status: 'available',
                approvalStatus: 'pending' // Admin must approve
            });

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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium ml-1 text-gray-700">Title</label>
                    <input
                        type="text"
                        required
                        className="bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:border-primary text-gray-900"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="The Great Gatsby"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium ml-1 text-gray-700">Author</label>
                    <input
                        type="text"
                        required
                        className="bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:border-primary text-gray-900"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="F. Scott Fitzgerald"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium ml-1 text-gray-700">Description</label>
                <textarea
                    required
                    rows={4}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:border-primary resize-none text-gray-900"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe the book..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium ml-1 text-gray-700">Condition</label>
                    <select
                        className="bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:border-primary text-gray-900"
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                    >
                        <option value="New">New</option>
                        <option value="Like New">Like New</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Poor">Poor</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium ml-1 text-gray-700">Book Cover</label>
                    <div className="flex items-center gap-4">
                        <label className="flex-grow cursor-pointer bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors border-dashed text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                            {coverFile ? coverFile.name : "Upload Image"}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                        {previewUrl && (
                            <img src={previewUrl} alt="Preview" className="h-12 w-12 object-cover rounded border border-gray-200" />
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium ml-1 text-gray-700">ISBN (Optional)</label>
                <input
                    type="text"
                    className="bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:border-primary text-gray-900"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="978-3-16-148410-0"
                />
            </div>

            <Button type="submit" className="mt-2 text-white shadow-sm" disabled={loading}>
                {loading ? "Listing Book..." : "List Book"}
            </Button>
        </form>
    );
}
