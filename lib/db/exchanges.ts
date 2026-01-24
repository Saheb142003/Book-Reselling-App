import { db } from "@/lib/firebase";
import { Exchange } from "@/types/exchange";
import { Book } from "@/types/book";
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    runTransaction,
    Timestamp,
    orderBy,
    limit
} from "firebase/firestore";

const EXCHANGES_COLLECTION = "exchanges";
const BOOKS_COLLECTION = "books";
const USERS_COLLECTION = "users";

// 5. Instant Buy (No Approval)
export async function buyBookInstant(book: Book, buyerId: string, buyerName: string) {
    if (!book.id) throw new Error("Invalid book ID");

    try {
        await runTransaction(db, async (transaction) => {
            // 1. Get Fresh Data
            const bookRef = doc(db, BOOKS_COLLECTION, book.id!);
            const buyerRef = doc(db, USERS_COLLECTION, buyerId);
            const sellerRef = doc(db, USERS_COLLECTION, book.sellerId);

            const bookDoc = await transaction.get(bookRef);
            const buyerDoc = await transaction.get(buyerRef);
            const sellerDoc = await transaction.get(sellerRef);

            if (!bookDoc.exists() || bookDoc.data().status !== 'available') {
                throw new Error("Book is no longer available.");
            }

            // 2. Calculate Fees
            // Buyer Pays: Price + 5%
            // Seller Gets: Price - 5%
            // Admin/Platform: 10% total
            const basePrice = book.credits;
            const buyerFee = Math.ceil(basePrice * 0.05);
            const sellerFee = Math.ceil(basePrice * 0.05);
            
            const totalBuyerCost = basePrice + buyerFee;
            const sellerReceives = basePrice - sellerFee;
            const platformRevenue = buyerFee + sellerFee;

            const buyerCredits = buyerDoc.data()?.credits || 0;

            if (buyerCredits < totalBuyerCost) {
                throw new Error(`Insufficient credits. You need ${totalBuyerCost} credits (Price: ${basePrice} + 5% Fee).`);
            }

            // 3. Process Transfer
            // Deduct from Buyer
            transaction.update(buyerRef, {
                credits: buyerCredits - totalBuyerCost
            });

            // Add to Seller
            transaction.update(sellerRef, {
                credits: (sellerDoc.data()?.credits || 0) + sellerReceives,
                booksSold: (sellerDoc.data()?.booksSold || 0) + 1
            });

            // 4. Update Book
            transaction.update(bookRef, { status: 'sold' });

            // 5. Create Transaction Record (For Admin & History)
            const transactionRef = doc(collection(db, "transactions"));
            transaction.set(transactionRef, {
                bookId: book.id,
                bookTitle: book.title,
                bookCoverUrl: book.coverUrl || null,
                buyerId: buyerId,
                buyerName: buyerName,
                sellerId: book.sellerId,
                sellerName: sellerDoc.data()?.displayName || "Unknown Seller",
                basePrice: basePrice,
                buyerPaid: totalBuyerCost,
                sellerReceived: sellerReceives,
                platformFee: platformRevenue,
                timestamp: Timestamp.now()
            });
        });
    } catch (error) {
        console.error("Instant buy failed:", error);
        throw error;
    }
}

// --- Legacy Functions (kept for reference or backward compatibility if needed) ---

// 1. Create a Request
export async function createExchangeRequest(book: Book, requesterId: string, requesterName: string, creditCost: number) {
    // ... (Legacy implementation)
    // For now, we can leave this or deprecate it. 
    // Since we are switching to Instant Buy, this might not be used anymore.
    if (!book.id) throw new Error("Invalid book ID");
    // ... (rest of the function omitted for brevity, but ideally we keep it or remove it if fully deprecated)
    // Re-implementing just in case existing code calls it, but throwing error to force update
    throw new Error("Please use Instant Buy.");
}

// 2. Accept Exchange
export async function acceptExchange(exchangeId: string) {
     throw new Error("Please use Instant Buy.");
}

// 3. Reject Exchange
export async function rejectExchange(exchangeId: string) {
     throw new Error("Please use Instant Buy.");
}

// 4. Get User Exchanges
export async function getUserExchanges(userId: string) {
    // We need two queries: Requests I made, and Requests for my books
    // Using simple separate queries

    const incomingQ = query(
        collection(db, EXCHANGES_COLLECTION),
        where("ownerId", "==", userId),
        orderBy("createdAt", "desc")
    );

    const outgoingQ = query(
        collection(db, EXCHANGES_COLLECTION),
        where("requesterId", "==", userId),
        orderBy("createdAt", "desc")
    );

    const [incomingSnap, outgoingSnap] = await Promise.all([
        getDocs(incomingQ),
        getDocs(outgoingQ)
    ]);

    const mapDocs = (snap: any) => snap.docs.map((d: any) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate(),
        updatedAt: d.data().updatedAt?.toDate()
    })) as Exchange[];

    return {
        incoming: mapDocs(incomingSnap),
        outgoing: mapDocs(outgoingSnap)
    };
}
