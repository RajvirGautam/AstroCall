"use client";
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Session, Review } from "@/types";
import GlassNavBar from "@/components/GlassNavBar";
import { useRouter } from "next/navigation";
import { Clock, Star, Video, Calendar } from "lucide-react";
import { format } from "date-fns";

function formatDuration(s: number) {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}m ${sec}s`;
}

export default function UserDashboard() {
  const { profile, user, loading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  // const [reviews, setReviews] = useState<Review[]>([]); // Reviews removed per user request

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/auth/login"); return; }
    const q = query(collection(db, "sessions"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, snap => {
      let sdocs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Session));
      sdocs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setSessions(sdocs);
    });
    // Reviews removed from UI, keeping listener commented out
    // const rq = query(collection(db, "reviews"), where("userId", "==", user.uid));
    // const unsub2 = onSnapshot(...);

    return () => { unsub(); };
  }, [user, loading, router]);

  const totalMinutes = sessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0) / 60;
  const activeSessions = sessions.filter(s => s.status === "active");

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-mystic-dark"><div className="w-8 h-8 rounded-full border-2 border-cosmic-500 border-t-transparent animate-spin" /></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen relative">
      <GlassNavBar />
      <div className="relative z-content max-w-5xl mx-auto px-4 pt-28 pb-10">
        {/* Header */}
        <div className="mb-8">
          <div className="font-display text-xs tracking-[0.3em] text-gold-500 uppercase mb-1">My Account</div>
          <h1 className="font-display text-4xl text-white">Welcome, <span className="text-gradient">{profile?.displayName?.split(" ")[0]}</span></h1>
          <p className="font-body text-purple-400 italic mt-1">Your cosmic journey at a glance</p>
        </div>

        {/* Active call alert */}
        {activeSessions.map(s => (
          <div key={s.id} className="mb-6 card border-gold-600 p-4 flex items-center justify-between gap-4 animate-pulse-glow">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-gold-400 animate-pulse" />
              <p className="font-display text-gold-300">Active session with {s.astroName}</p>
            </div>
            <button onClick={() => router.push(`/call/${s.id}`)} className="btn-gold py-2 px-4 text-sm">
              Rejoin Call
            </button>
          </div>
        ))}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Calls", value: sessions.length, icon: <Video className="w-5 h-5 text-cosmic-400" /> },
            { label: "Minutes Spent", value: Math.round(totalMinutes), icon: <Clock className="w-5 h-5 text-gold-400" /> },
            { label: "This Month", value: sessions.filter(s => s.startedAt && s.startedAt > Date.now() - 30 * 24 * 3600 * 1000).length, icon: <Calendar className="w-5 h-5 text-purple-400" /> },
          ].map((stat, i) => (
            <div key={i} className="card p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                {stat.icon}
                <span className="font-display text-2xl text-white">{stat.value}</span>
              </div>
              <span className="font-body text-purple-400 text-sm">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Past Calls */}
        <div className="mb-8">
          <h2 className="font-display text-xl text-white mb-4">Past Sessions</h2>
          {sessions.length === 0 ? (
            <div className="card p-8 text-center">
              <div className="text-4xl mb-3">🌙</div>
              <p className="font-body text-purple-400 italic">No calls yet. Connect with an astrologer today.</p>
              <button onClick={() => router.push("/astrologers")} className="btn-primary mt-4">Browse Astrologers</button>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map(s => (
                <div key={s.id} className="card p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full glass-light flex items-center justify-center text-lg">🔮</div>
                    <div>
                      <p className="font-display text-white text-sm">{s.astroName}</p>
                      <p className="font-body text-purple-400 text-xs">
                        {s.startedAt ? format(new Date(s.startedAt), "d MMM yyyy · h:mm a") : "Not started"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-body text-purple-400 text-xs">{formatDuration(s.durationSeconds || 0)}</span>
                    <span className={`text-xs font-display px-2 py-0.5 rounded-full border ${s.status === "ended" ? "text-green-300 border-green-700 bg-green-900/20" :
                      s.status === "active" ? "text-gold-300 border-gold-600 bg-gold-900/20" :
                        "text-purple-400 border-purple-700"
                      }`}>
                      {s.status}
                    </span>
                    {s.status === "active" && (
                      <button onClick={() => router.push(`/call/${s.id}`)} className="btn-primary text-xs py-1 px-3">
                        Rejoin
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
