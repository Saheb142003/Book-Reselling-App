import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

const USERS_COLLECTION = "users";

export async function updateUserRole(uid: string, role: 'user' | 'admin') {
    try {
        const userRef = doc(db, USERS_COLLECTION, uid);
        await updateDoc(userRef, { role });
    } catch (error) {
        console.error("Error updating user role:", error);
        throw error;
    }
}
