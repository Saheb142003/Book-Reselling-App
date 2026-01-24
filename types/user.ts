export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role: 'user' | 'admin';
    credits: number;
    booksListed: number;
    booksSold: number;
    createdAt: Date; // Store as Date in app, Firestore Timestamp in DB
    bio?: string;
    location?: string;
    phoneNumber?: string;
}
