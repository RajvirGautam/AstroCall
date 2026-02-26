"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { UserProfile, Session, Astrologer } from "@/types";
import GlassNavBar from "@/components/GlassNavBar";
import { useRouter } from "next/navigation";
import { Shield, Users, Video, Star, ChevronRight, UserCheck } from "lucide-react";
import { format } from "date-fns";

export default function AdminPanel() {
  const { profile, user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [promoting, setPromoting] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    if (profile?.role !== "admin") { router.push("/"); return; }

    const uq = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsub1 = onSnapshot(uq, snap => setUsers(snap.docs.map(d => d.data() as UserProfile)));

    const sq = query(collection(db, "sessions"), orderBy("createdAt", "desc"));
    const unsub2 = onSnapshot(sq, snap => setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Session))));

    return () => { unsub1(); unsub2(); };
  }, [user, profile]);

  const promoteToAstrologer = async (targetUser: UserProfile) => {
    setPromoting(targetUser.uid);
    try {
      // Update user role
      await updateDoc(doc(db, "users", targetUser.uid), { role: "astrologer" });
      // Create/update astrologer doc
      const astroRef = doc(db, "astrologers", targetUser.uid);
      const existing = await getDoc(astroRef);
      if (!existing.exists()) {
        await setDoc(astroRef, {
          uid: targetUser.uid,
          name: targetUser.displayName,
          bio: "Certified astrologer. Bio coming soon.",
          photoURL: targetUser.photoURL || `https://api.dicebear.com/7.x/personas/svg?seed=${targetUser.uid}`,
          languages: ["English"],
          specialties: ["Vedic Astrology"],
          isOnline: false,
          rating: 0,
          totalReviews: 0,
          totalCalls: 0,
          ratePerMinute: 10,
        } as Omit<Astrologer, "uid"> & { uid: string });
      }
      alert(`${targetUser.displayName} has been promoted to astrologer!`);
    } finally {
      setPromoting(null);
    }
  };

  const totalActive = sessions.filter(s => s.status === "active").length;
  const astrologers = users.filter(u => u.role === "astrologer");
  const regularUsers = users.filter(u => u.role === "user");

  return (
    <div className="min-h-screen relative">
      <GlassNavBar />
      <div className="relative z-content max-w-6xl mx-auto px-4 pt-28 pb-10">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <Shield className="w-8 h-8 text-gold-400" />
          <div>
            <div className="font-display text-xs tracking-[0.3em] text-gold-500 uppercase mb-0.5">Control Center</div>
            <h1 className="font-display text-4xl text-white">Admin <span className="text-gradient">Panel</span></h1>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users", value: regularUsers.length, icon: <Users className="w-5 h-5 text-cosmic-400" /> },
            { label: "Astrologers", value: astrologers.length, icon: <Star className="w-5 h-5 text-gold-400" /> },
            { label: "Total Sessions", value: sessions.length, icon: <Video className="w-5 h-5 text-purple-400" /> },
            { label: "Active Now", value: totalActive, icon: <Video className="w-5 h-5 text-green-400" /> },
          ].map((stat, i) => (
            <div key={i} className="card p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">{stat.icon}<span className="font-display text-2xl text-white">{stat.value}</span></div>
              <span className="font-body text-purple-400 text-sm">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User management */}
          <div>
            <h2 className="font-display text-xl text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-cosmic-400" /> User Management
            </h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {users.map(u => (
                <div key={u.uid} className="card p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={u.photoURL || `https://api.dicebear.com/7.x/personas/svg?seed=${u.uid}`}
                      className="w-9 h-9 rounded-full border border-mystic-border object-cover flex-shrink-0"
                      alt=""
                    />
                    <div className="min-w-0">
                      <p className="font-display text-sm text-white truncate">{u.displayName}</p>
                      <p className="font-body text-xs text-purple-500 truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-display px-2 py-0.5 rounded-full border ${u.role === "admin" ? "text-gold-300 border-gold-700 bg-gold-900/20" :
                      u.role === "astrologer" ? "text-cosmic-300 border-cosmic-700 bg-cosmic-900/20" :
                        "text-purple-400 border-purple-800"
                      }`}>{u.role}</span>
                    {u.role === "user" && (
                      <button
                        onClick={() => promoteToAstrologer(u)}
                        disabled={promoting === u.uid}
                        className="flex items-center gap-1 text-xs text-gold-400 hover:text-gold-200 border border-gold-700 rounded-lg px-2 py-1 transition-colors hover:bg-gold-900/20"
                      >
                        <UserCheck className="w-3 h-3" />
                        {promoting === u.uid ? "…" : "Promote"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Session log */}
          <div>
            <h2 className="font-display text-xl text-white mb-4 flex items-center gap-2">
              <Video className="w-5 h-5 text-cosmic-400" /> Session Log
            </h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {sessions.length === 0 ? (
                <div className="card p-6 text-center font-body text-purple-400 italic">No sessions yet</div>
              ) : (
                sessions.slice(0, 30).map(s => (
                  <div key={s.id} className="card p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-sm text-white">
                        {s.userName} → {s.astroName}
                      </p>
                      <p className="font-body text-xs text-purple-500">
                        {s.startedAt ? format(new Date(s.startedAt), "d MMM · h:mm a") : "Pending"}
                        {" · "}{Math.floor((s.durationSeconds || 0) / 60)}m
                      </p>
                    </div>
                    <span className={`text-xs font-display px-2 py-0.5 rounded-full border flex-shrink-0 ${s.status === "ended" ? "text-green-300 border-green-700 bg-green-900/20" :
                      s.status === "active" ? "text-gold-300 border-gold-600 bg-gold-900/20 animate-pulse" :
                        "text-purple-400 border-purple-800"
                      }`}>{s.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
