import { db } from "@/lib/firebase";
import { Book } from "@/types/book";
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    runTransaction,
    orderBy,
    getCountFromServer,
    limit
} from "firebase/firestore";

const BOOKS_COLLECTION = "books";
const USERS_COLLECTION = "users";

export async function getPendingBooks() {
    try {
        const q = query(
            collection(db, BOOKS_COLLECTION),
            where("approvalStatus", "==", "pending"),
            orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as Book[];
    } catch (error) {
        console.error("Error fetching pending books:", error);
        throw error;
    }
}

export async function approveBook(bookId: string, sellerId: string, creditAmount: number) {
    try {
        await runTransaction(db, async (transaction) => {
            const bookRef = doc(db, BOOKS_COLLECTION, bookId);
            const userRef = doc(db, USERS_COLLECTION, sellerId);

            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                throw new Error("Seller does not exist!");
            }

            // 1. Update Book Status
            transaction.update(bookRef, { approvalStatus: "approved" });

            // 2. Increment User Credits & Listed Count
            // Use the provided creditAmount
            const newCredits = (userDoc.data().credits || 0) + creditAmount;
            const newListedCount = (userDoc.data().booksListed || 0) + 1;

            transaction.update(userRef, {
                credits: newCredits,
                booksListed: newListedCount
            });
        });
    } catch (error) {
        console.error("Transaction failed: ", error);
        throw error;
    }
}

export async function rejectBook(bookId: string) {
    try {
        // Just update status to rejected, no credits given
        const bookRef = doc(db, BOOKS_COLLECTION, bookId);
        await runTransaction(db, async (transaction) => {
            transaction.update(bookRef, { approvalStatus: "rejected" });
        });
    } catch (error) {
        console.error("Error rejecting book:", error);
        throw error;
    }
}

export async function getAllBooks() {
    try {
        const q = query(
            collection(db, BOOKS_COLLECTION),
            orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as Book[];
    } catch (error) {
        console.error("Error fetching all books:", error);
        return [];
    }
}

export async function getAdminStats() {
    try {
        const usersSnap = await getCountFromServer(collection(db, USERS_COLLECTION));
        const booksSnap = await getCountFromServer(collection(db, BOOKS_COLLECTION));
        // For exchanges, we might not have a direct collection reference if it's not exported, 
        // but we know the name is "exchanges"
        const exchangesSnap = await getCountFromServer(collection(db, "exchanges"));

        return {
            totalUsers: usersSnap.data().count,
            totalBooks: booksSnap.data().count,
            totalExchanges: exchangesSnap.data().count
        };
    } catch (error) {
        console.error("Error fetching stats:", error);
        return { totalUsers: 0, totalBooks: 0, totalExchanges: 0 };
    }
}

export async function getRecentExchanges() {
    // ... existing function (maybe deprecated but keeping for now) ...
    try {
        const q = query(
            collection(db, "exchanges"),
            orderBy("createdAt", "desc"),
            limit(10)
        );
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate()
        }));
    } catch (error) {
        console.error("Error fetching recent exchanges:", error);
        return [];
    }
}

export async function getAdminTransactions() {
    try {
        const q = query(
            collection(db, "transactions"),
            orderBy("timestamp", "desc"),
            limit(50) // Limit to last 50 for performance
        );
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate()
        }));
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return [];
    }
}

export async function getUsers() {
    try {
        const q = query(collection(db, USERS_COLLECTION), limit(50));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate()
        }));
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
}

export async function updateUserRole(userId: string, role: 'user' | 'admin') {
    try {
        await runTransaction(db, async (transaction) => {
            const userRef = doc(db, USERS_COLLECTION, userId);
            transaction.update(userRef, { role });
        });
    } catch (error) {
        console.error("Error updating user role:", error);
        throw error;
    }
}
