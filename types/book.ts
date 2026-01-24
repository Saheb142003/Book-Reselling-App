export interface Book {
    id?: string; // Optional because it's not present before creation
    sellerId: string;
    isbn: string;
    title: string;
    authors: string[];
    description: string;
    price?: number; // Deprecated, use credits
    credits: number;
    condition: 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor';
    coverUrl: string;
    publishedDate?: string;
    createdAt: Date; // Firestore Timestamp converted to Date
    status: 'available' | 'sold';
    approvalStatus: 'pending' | 'approved' | 'rejected';
}
