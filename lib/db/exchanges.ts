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
    limit,
    setDoc,
    updateDoc
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

// 1. Create a Request
export async function createExchangeRequest(book: Book, requesterId: string, requesterName: string, creditCost: number) {
    if (!book.id) throw new Error("Invalid book ID");

    const exchangeRef = doc(collection(db, EXCHANGES_COLLECTION));
    const now = new Date();

    const exchangeData: Exchange = {
        id: exchangeRef.id,
        bookId: book.id,
        bookTitle: book.title,
        bookCoverUrl: book.coverUrl || "",
        
        requesterId,
        requesterName,
        
        ownerId: book.sellerId,
        ownerName: "Seller", // We might want to fetch this, or just rely on ID for now and fetch later
        
        status: 'requested',
        creditsCost: creditCost,
        
        createdAt: now,
        updatedAt: now
    };

    await setDoc(exchangeRef, exchangeData);
    return exchangeRef.id;
}

// 2. Accept Exchange
export async function acceptExchange(exchangeId: string) {
    try {
        await runTransaction(db, async (transaction) => {
            const exchangeRef = doc(db, EXCHANGES_COLLECTION, exchangeId);
            const exchangeDoc = await transaction.get(exchangeRef);

            if (!exchangeDoc.exists()) throw new Error("Exchange request not found");
            const exchange = exchangeDoc.data() as Exchange;

            if (exchange.status !== 'requested') throw new Error("Exchange is not in requested state");

            // Fetch Book and Users used in transaction
            const bookRef = doc(db, BOOKS_COLLECTION, exchange.bookId);
            const buyerRef = doc(db, USERS_COLLECTION, exchange.requesterId);
            const sellerRef = doc(db, USERS_COLLECTION, exchange.ownerId);

            const bookDoc = await transaction.get(bookRef);
            const buyerDoc = await transaction.get(buyerRef);
            const sellerDoc = await transaction.get(sellerRef);

            if (!bookDoc.exists() || bookDoc.data().status !== 'available') {
                 // Auto-reject if book unavailable
                 transaction.update(exchangeRef, { status: 'cancelled', updatedAt: new Date() });
                 throw new Error("Book is no longer available.");
            }

            // Financials
            const basePrice = exchange.creditsCost;
            const buyerFee = Math.ceil(basePrice * 0.05);
            const sellerFee = Math.ceil(basePrice * 0.05);
            const totalBuyerCost = basePrice + buyerFee;
            const sellerReceives = basePrice - sellerFee;
            const platformRevenue = buyerFee + sellerFee;

            const buyerCredits = buyerDoc.data()?.credits || 0;

            if (buyerCredits < totalBuyerCost) {
                throw new Error(`Buyer has insufficient credits.`);
            }

            // Deduct from Buyer
            transaction.update(buyerRef, {
                credits: buyerCredits - totalBuyerCost
            });

            // Add to Seller
            transaction.update(sellerRef, {
                credits: (sellerDoc.data()?.credits || 0) + sellerReceives,
                booksSold: (sellerDoc.data()?.booksSold || 0) + 1
            });

            // Update Book
            transaction.update(bookRef, { status: 'sold' });

            // Update Exchange Status
            transaction.update(exchangeRef, { status: 'accepted', updatedAt: new Date() });

            // Create Transaction Record
            const transactionRef = doc(collection(db, "transactions"));
            transaction.set(transactionRef, {
                bookId: exchange.bookId,
                bookTitle: exchange.bookTitle,
                bookCoverUrl: exchange.bookCoverUrl,
                buyerId: exchange.requesterId,
                buyerName: exchange.requesterName,
                sellerId: exchange.ownerId,
                sellerName: sellerDoc.data()?.displayName || "Unknown",
                basePrice: basePrice,
                buyerPaid: totalBuyerCost,
                sellerReceived: sellerReceives,
                platformFee: platformRevenue,
                timestamp: Timestamp.now(),
                exchangeId: exchangeId
            });
        });
    } catch (error) {
        console.error("Accept exchange failed:", error);
        throw error;
    }
}

// 3. Reject Exchange
export async function rejectExchange(exchangeId: string) {
    const exchangeRef = doc(db, EXCHANGES_COLLECTION, exchangeId);
    await updateDoc(exchangeRef, { 
        status: 'rejected',
        updatedAt: new Date()
    });
}

// 4. Cancel Exchange
export async function cancelExchange(exchangeId: string) {
    const exchangeRef = doc(db, EXCHANGES_COLLECTION, exchangeId);
    await updateDoc(exchangeRef, { 
        status: 'cancelled',
        updatedAt: new Date()
    });
}

// 6. Get User Exchanges (Transactions + Requests)
export async function getUserExchanges(userId: string) {
    // 1. Transactions (Completed Exchanges)
    const tIncomingQ = query(collection(db, "transactions"), where("sellerId", "==", userId), orderBy("timestamp", "desc"));
    const tOutgoingQ = query(collection(db, "transactions"), where("buyerId", "==", userId), orderBy("timestamp", "desc"));

    // 2. Pending Requests (Active Exchanges)
    const rIncomingQ = query(collection(db, EXCHANGES_COLLECTION), where("ownerId", "==", userId), where("status", "==", "requested"));
    const rOutgoingQ = query(collection(db, EXCHANGES_COLLECTION), where("requesterId", "==", userId), where("status", "==", "requested"));

    // 3. Request History (Rejected/Cancelled)
    const rhIncomingQ = query(collection(db, EXCHANGES_COLLECTION), where("ownerId", "==", userId), where("status", "in", ["rejected", "cancelled"]));
    const rhOutgoingQ = query(collection(db, EXCHANGES_COLLECTION), where("requesterId", "==", userId), where("status", "in", ["rejected", "cancelled"]));


    const [tIn, tOut, rIn, rOut, rhIn, rhOut] = await Promise.all([
        getDocs(tIncomingQ), getDocs(tOutgoingQ),
        getDocs(rIncomingQ), getDocs(rOutgoingQ), 
        getDocs(rhIncomingQ), getDocs(rhOutgoingQ)
    ]);

    const mapTransaction = (d: any) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().timestamp?.toDate(),
        status: 'completed',
        creditsCost: d.data().basePrice, // Normalize field
        ownerName: d.data().sellerName,
        requesterName: d.data().buyerName,
    }) as Exchange;

    const mapExchange = (d: any) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date(d.data().createdAt),
    }) as unknown as Exchange;

    return {
        // Sold/Incoming: Completed Sales + Pending Requests for my books
        incoming: [...tIn.docs.map(mapTransaction)], 
        
        // Purchases/Outgoing: Completed Buys + My Pending Requests
        outgoing: [...tOut.docs.map(mapTransaction)],

        // Requests specific buckets if needed, but for now we put them in requests
        requests: {
            incoming: rIn.docs.map(mapExchange), // Requests FOR my books (I am owner)
            outgoing: rOut.docs.map(mapExchange) // Requests I MADE (I am requester)
        },
        
        history: {
             incoming: rhIn.docs.map(mapExchange),
             outgoing: rhOut.docs.map(mapExchange)
        }
    };
}
