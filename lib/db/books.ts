import { db } from "@/lib/firebase";
import { Book } from "@/types/book";
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    query,
    orderBy,
    Timestamp,
    where,
    deleteDoc,
    updateDoc,
    increment,
    runTransaction
} from "firebase/firestore";

const BOOKS_COLLECTION = "books";

export async function addBook(book: Omit<Book, "id" | "createdAt">) {
    try {
        // Use a batch or just concurrent writes. Transaction is safer for consistency.
        const docRef = await addDoc(collection(db, BOOKS_COLLECTION), {
            ...book,
            createdAt: Timestamp.now(),
            status: "available",
            approvalStatus: "pending"
        });

        // Update user's booksListed count
        const userRef = doc(db, "users", book.sellerId);
        await updateDoc(userRef, {
            booksListed: increment(1)
        });

        return docRef.id;
    } catch (error) {
        console.error("Error adding book:", error);
        throw error;
    }
}

export async function getBooks() {
    try {
        const q = query(
            collection(db, BOOKS_COLLECTION),
            where("status", "==", "available"),
            where("approvalStatus", "==", "approved"),
            orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as Book[];
    } catch (error: any) {
        if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
            console.log("Offline: returning empty book list or cached data not found.");
            return [];
        }
        console.error("Error fetching books:", error);
        return [];
    }
}

export async function getUserBooks(userId: string) {
    try {
        const q = query(
            collection(db, BOOKS_COLLECTION),
            where("sellerId", "==", userId),
            orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as Book[];
    } catch (error) {
        console.error("Error fetching user books:", error);
        return [];
    }
}

export async function getBook(id: string) {
    try {
        const docRef = doc(db, BOOKS_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data(),
                createdAt: docSnap.data().createdAt?.toDate() || new Date()
            } as Book;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching book:", error);
        throw error;
    }
}

export async function deleteBook(bookId: string) {
    try {
        const bookRef = doc(db, BOOKS_COLLECTION, bookId);
        const bookSnap = await getDoc(bookRef);

        if (!bookSnap.exists()) {
            console.warn("Book not found, maybe already deleted.");
            return;
        }

        const bookData = bookSnap.data() as Book;
        const sellerId = bookData.sellerId;

        await deleteDoc(bookRef);

        // Decrement user's booksListed count
        if (sellerId) {
             const userRef = doc(db, "users", sellerId);
             await updateDoc(userRef, {
                 booksListed: increment(-1)
             });
        }

    } catch (error) {
        console.error("Error deleting book:", error);
        throw error;
    }
}

export async function updateBook(bookId: string, data: Partial<Book>) {
    try {
        const bookRef = doc(db, BOOKS_COLLECTION, bookId);
        await updateDoc(bookRef, data);
    } catch (error) {
        console.error("Error updating book:", error);
        throw error;
    }
}
