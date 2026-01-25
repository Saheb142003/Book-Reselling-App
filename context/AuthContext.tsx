"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
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

  // Use ref for the profile subscription to avoid stale closures in useEffect
  const unsubscribeProfileRef = useRef<(() => void) | null>(null);

  const CACHE_KEY = "auth_user_cache";

  useEffect(() => {
    let authUnsubscribe: () => void;

    const initAuth = async () => {
      if (typeof window === 'undefined') return;

      // 1. Try to load from cache immediately for instant UI
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.createdAt) parsed.createdAt = new Date(parsed.createdAt);
          setUser(parsed);
          setLoading(false);
        } catch (e) {
          console.error("Cache parse error", e);
          localStorage.removeItem(CACHE_KEY);
        }
      }

      // 2. Listen for Firebase Auth changes
      authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // User is signed in - Set up real-time listener for profile
          try {
            const userRef = doc(db, "users", firebaseUser.uid);
            
            // Unsubscribe from previous listener if exists
            if (unsubscribeProfileRef.current) {
                unsubscribeProfileRef.current();
                unsubscribeProfileRef.current = null;
            }

            // Dynamically import onSnapshot to avoid SSR issues if any (though we are in use client)
            const { onSnapshot } = await import("firebase/firestore");
            
            const unsub = onSnapshot(userRef, (docSnap) => {
                if (docSnap.exists()) {
                    const userData = docSnap.data();
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
                    // Fallback if no profile doc
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
                    } as UserProfile;
                    setUser(basicProfile);
                }
                setLoading(false);
            }, (error) => {
                console.error("Profile snapshot error:", error);
            });
            
            unsubscribeProfileRef.current = unsub;

          } catch (err) {
            console.error("Auth setup error", err);
          }
        } else {
          // User is signed out
          if (unsubscribeProfileRef.current) {
              unsubscribeProfileRef.current();
              unsubscribeProfileRef.current = null;
          }
          setUser(null);
          localStorage.removeItem(CACHE_KEY);
          setLoading(false);
        }
      });
    };

    initAuth();

    return () => {
      if (authUnsubscribe) authUnsubscribe();
      if (unsubscribeProfileRef.current) unsubscribeProfileRef.current();
    };
  }, []);

  const logout = async () => {
    try {
      if (unsubscribeProfileRef.current) {
          unsubscribeProfileRef.current();
          unsubscribeProfileRef.current = null;
      }
      await firebaseSignOut(auth);
      localStorage.removeItem(CACHE_KEY);
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const refreshProfile = async () => {
    // With real-time updates, manual refresh is mostly not needed.
    // We could implement a one-time fetch here if strictly necessary, 
    // but the snapshot listener handles updates automatically.
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
