"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserProfile, UserRole } from "@/types";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) setProfile(snap.data() as UserProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signIn = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    if (snap.exists()) setProfile(snap.data() as UserProfile);
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole = "user") => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    const profileData: UserProfile = {
      uid: cred.user.uid,
      email,
      displayName: name,
      role,
      photoURL: `https://api.dicebear.com/7.x/personas/svg?seed=${cred.user.uid}`,
      createdAt: Date.now(),
    };
    await setDoc(doc(db, "users", cred.user.uid), profileData);
    // If astrologer, also create astrologer doc
    if (role === "astrologer") {
      await setDoc(doc(db, "astrologers", cred.user.uid), {
        uid: cred.user.uid,
        name,
        bio: "Experienced astrologer. Update your bio in the dashboard.",
        photoURL: profileData.photoURL,
        languages: ["English"],
        specialties: ["Vedic Astrology"],
        isOnline: false,
        rating: 0,
        totalReviews: 0,
        totalCalls: 0,
        ratePerMinute: 10,
      });
    }
    setProfile(profileData);
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
