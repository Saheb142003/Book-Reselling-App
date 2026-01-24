"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  User as FirebaseUser,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { UserProfile } from "@/types/user";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

import useFcmToken from "@/hooks/useFcmToken";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Initialize FCM
  useFcmToken();

  const CACHE_KEY = "auth_user_cache";

  const fetchUserProfile = async (firebaseUser: FirebaseUser) => {
    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        // Convert Firestore Timestamp to JS Date
        let createdAt = new Date();
        if (userData.createdAt) {
          createdAt = userData.createdAt.toDate
            ? userData.createdAt.toDate()
            : new Date(userData.createdAt);
        }

        const profile: UserProfile = {
          ...userData,
          createdAt: createdAt,
        } as UserProfile;

        setUser(profile);
        localStorage.setItem(CACHE_KEY, JSON.stringify(profile));
      } else {
        console.warn("User document not found for", firebaseUser.uid);
        // Basic fall back
        const basicProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: "user",
          credits: 0,
          booksListed: 0,
          booksSold: 0,
          createdAt: new Date(),
        } as UserProfile; // Cast to ensure compatibility if types slightly differ
        setUser(basicProfile);
        // Don't cache incomplete profiles potentially
      }
    } catch (error: any) {
      // Silence offline errors completely as requested
      const isOffline =
        error?.code === "unavailable" || error?.message?.includes("offline");
      if (!isOffline) {
        console.error("Error fetching user profile:", error);
      }
    }
  };

  useEffect(() => {
    let unsubscribe: () => void;

    const initAuth = async () => {
      // 1. Try to load from cache immediately for instant UI
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          // Restore Date object
          if (parsed.createdAt) parsed.createdAt = new Date(parsed.createdAt);
          setUser(parsed);
          setLoading(false); // <--- FIX: Enable optimistic UI immediately
        } catch (e) {
          console.error("Cache parse error", e);
          localStorage.removeItem(CACHE_KEY);
        }
      }

      // 2. Listen for Firebase Auth changes
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // setLoading(true); // Removed to prevent flicker if cache is loaded
          // User is signed in
          // If we have a cached user and IDs match, we can keep showing it while we revalidate
          // If no cache, we wait for fetch

          try {
            await fetchUserProfile(firebaseUser);
          } catch (err) {
            console.error("Auth state change error", err);
          }
        } else {
          // User is signed out
          setUser(null);
          localStorage.removeItem(CACHE_KEY);
        }
        setLoading(false); // Auth check complete
      });
    };

    initAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem(CACHE_KEY);
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const refreshProfile = async () => {
    if (auth.currentUser) {
      await fetchUserProfile(auth.currentUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
