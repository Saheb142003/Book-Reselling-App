export interface Book {
    id?: string; // Optional because it's not present before creation
    sellerId: string;
    isbn: string;
    title: string;
    authors: string[];
    description: string;
    // Price related fields
    price?: number; // Deprecated or used as 'credits' value
    minPrice: number; // Minimum price accepted (in Rupees)
    credits: number; // Listed price in Credits/Rupees
    condition: 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor';
    genre?: string;
    coverUrl: string;
    publishedDate?: string;
    createdAt: Date; // Firestore Timestamp converted to Date
    status: 'available' | 'sold';
    approvalStatus: 'pending' | 'approved' | 'rejected';
}
