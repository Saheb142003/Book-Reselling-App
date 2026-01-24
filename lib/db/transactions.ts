import { db } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit
} from "firebase/firestore";

export interface Transaction {
    id: string;
    bookId: string;
    bookTitle: string;
    bookCoverUrl?: string;
    buyerId: string;
    buyerName: string;
    sellerId: string;
    sellerName: string;
    basePrice: number;
    buyerPaid: number;
    sellerReceived: number;
    platformFee: number;
    timestamp: Date;
}

export async function getUserTransactions(userId: string) {
    try {
        // Firestore doesn't support logical OR in queries easily for different fields (buyerId OR sellerId)
        // So we make two queries and merge them.
        
        const buyerQ = query(
            collection(db, "transactions"),
            where("buyerId", "==", userId),
            orderBy("timestamp", "desc"),
            limit(50)
        );

        const sellerQ = query(
            collection(db, "transactions"),
            where("sellerId", "==", userId),
            orderBy("timestamp", "desc"),
            limit(50)
        );

        const [buyerSnap, sellerSnap] = await Promise.all([
            getDocs(buyerQ),
            getDocs(sellerQ)
        ]);

        const transactions: Transaction[] = [];

        buyerSnap.forEach(doc => {
            transactions.push({ id: doc.id, ...doc.data(), timestamp: doc.data().timestamp?.toDate() } as Transaction);
        });

        sellerSnap.forEach(doc => {
            // Avoid duplicates if user bought from themselves (unlikely but possible in dev)
            if (!transactions.find(t => t.id === doc.id)) {
                transactions.push({ id: doc.id, ...doc.data(), timestamp: doc.data().timestamp?.toDate() } as Transaction);
            }
        });

        // Re-sort merged results
        return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    } catch (error) {
        console.error("Error fetching user transactions:", error);
        return [];
    }
}
