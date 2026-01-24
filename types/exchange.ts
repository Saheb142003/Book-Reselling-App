import { Timestamp } from "firebase/firestore";

export interface Exchange {
    id?: string;
    bookId: string;
    bookTitle: string;
    bookCoverUrl: string;

    requesterId: string;
    requesterName: string;

    ownerId: string;
    ownerName: string;

    status: 'requested' | 'accepted' | 'rejected' | 'cancelled';
    creditsCost: number; // The amount locked in escrow

    createdAt: Date;
    updatedAt: Date;
}
