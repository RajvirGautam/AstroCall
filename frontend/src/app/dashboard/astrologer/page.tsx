"use client";
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Session, Astrologer, Review } from "@/types";
import GlassNavBar from "@/components/GlassNavBar";
import { useRouter } from "next/navigation";
import { Clock, Star, Video, ToggleLeft, ToggleRight, Edit2, Check, X, Phone, PhoneOff } from "lucide-react";
import { format } from "date-fns";
import { startSession, declineSession } from "@/lib/sessions";

function formatDuration(s: number) {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}m ${sec}s`;
}


// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function AstrologerDashboard() {
  const { profile, user, loading } = useAuth();
  const router = useRouter();
  const [astroData, setAstroData] = useState<Astrologer | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [togglingOnline, setTogglingOnline] = useState(false);
  const [editBio, setEditBio] = useState(false);
  const [bio, setBio] = useState("");
  const [savingBio, setSavingBio] = useState(false);
  const [incomingCall, setIncomingCall] = useState<Session | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/auth/login"); return; }
    if (profile?.role !== "astrologer") { router.push("/dashboard/user"); return; }

    // Astrologer doc
    const unsubAstro = onSnapshot(doc(db, "astrologers", user.uid), snap => {
      if (snap.exists()) {
        const data = { uid: snap.id, ...snap.data() } as Astrologer;
        setAstroData(data);
        setBio(data.bio);
      }
    });

    // Debug: print UID
    console.log("[AstrologerDash] Logged-in UID:", user.uid);

    // ── Listener 1: Pending calls only (NO orderBy = no composite index needed)
    const pendingQ = query(
      collection(db, "sessions"),
      where("astroId", "==", user.uid),
      where("status", "==", "pending")
    );
    const unsubPending = onSnapshot(
      pendingQ,
      (snap) => {
        const pending = snap.docs.map(d => ({ id: d.id, ...d.data() } as Session));
        console.log("[AstrologerDash] Pending calls:", pending.length);
        setIncomingCall(pending[0] || null);
      },
      (err) => console.error("[AstrologerDash] Pending query error:", err)
    );

    // ── Listener 2: All sessions for history/stats (ordered)
    const q = query(
      collection(db, "sessions"),
      where("astroId", "==", user.uid)
    );
    const unsubSess = onSnapshot(
      q,
      (snap) => {
        let docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Session));
        docs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        console.log("[AstrologerDash] All sessions:", docs.length);
        setSessions(docs);
      },
      (err) => console.error("[AstrologerDash] Sessions query error:", err)
    );

    // Reviews (Removed from UI per user request, but keeping listener if needed later, or just remove)
    // const rq = query(collection(db, "reviews"), where("astroId", "==", user.uid));
    // const unsubRev = onSnapshot(rq, snap => { ... });

    return () => { unsubAstro(); unsubPending(); unsubSess(); };
  }, [user, profile, loading, router]);


  const handleAccept = async () => {
    if (!incomingCall || accepting) return;
    setAccepting(true);
    try {
      await startSession(incomingCall.id);
      router.push(`/call/${incomingCall.id}`);
    } catch (e) {
      console.error(e);
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!incomingCall) return;
    try {
      await declineSession(incomingCall.id);
      setIncomingCall(null);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleOnline = async () => {
    if (!user || !astroData) return;
    setTogglingOnline(true);
    await updateDoc(doc(db, "astrologers", user.uid), { isOnline: !astroData.isOnline });
    setTogglingOnline(false);
  };

  const saveBio = async () => {
    if (!user) return;
    setSavingBio(true);
    await updateDoc(doc(db, "astrologers", user.uid), { bio });
    setSavingBio(false);
    setEditBio(false);
  };

  const todaySessions = sessions.filter(s => s.startedAt && s.startedAt > new Date().setHours(0, 0, 0, 0));
  const totalMinutes = sessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0) / 60;
  const activeSessions = sessions.filter(s => s.status === "active");

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-mystic-dark"><div className="w-8 h-8 rounded-full border-2 border-cosmic-500 border-t-transparent animate-spin" /></div>;
  if (!user || profile?.role !== "astrologer") return null;

  return (
    <div className="min-h-screen relative">
      <GlassNavBar />



      <div className="relative z-content max-w-5xl mx-auto px-4 pt-28 pb-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="font-display text-xs tracking-[0.3em] text-gold-500 uppercase mb-1">Astrologer Portal</div>
            <h1 className="font-display text-4xl text-white">
              {profile?.displayName?.split(" ")[0]}<span className="text-gradient">&apos;s Studio</span>
            </h1>
            {/* DEBUG: your UID — make sure Chrome user calls THIS astrologer */}
            <p className="font-mono text-xs text-purple-600 mt-1 select-all" title="Your Firebase UID — Chrome must call this account">
              UID: {user?.uid}
            </p>
          </div>

          {/* Online toggle */}
          <button
            onClick={toggleOnline}
            disabled={togglingOnline}
            className={`flex items-center gap-3 px-5 py-3 rounded-xl border font-display text-sm tracking-wide transition-all ${astroData?.isOnline
              ? "border-green-600 bg-green-900/20 text-green-300"
              : "border-mystic-border text-purple-400 hover:border-cosmic-700"
              }`}
          >
            {astroData?.isOnline
              ? <ToggleRight className="w-5 h-5" />
              : <ToggleLeft className="w-5 h-5" />}
            {astroData?.isOnline ? "You're Online" : "Go Online"}
          </button>
        </div>

        {/* Active call alert */}
        {activeSessions.map(s => (
          <div key={s.id} className="mb-6 card border-gold-600 p-4 flex items-center justify-between gap-4 animate-pulse-glow">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-gold-400 animate-pulse" />
              <p className="font-display text-gold-300">Active session with {s.userName}</p>
            </div>
            <button onClick={() => router.push(`/call/${s.id}`)} className="btn-gold py-2 px-4 text-sm">
              Rejoin Call
            </button>
          </div>
        ))}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Sessions", value: sessions.length, icon: <Video className="w-5 h-5 text-cosmic-400" /> },
            { label: "Today's Calls", value: todaySessions.length, icon: <Clock className="w-5 h-5 text-gold-400" /> },
            { label: "Avg Rating", value: astroData?.rating?.toFixed(1) || "—", icon: <Star className="w-5 h-5 text-gold-400" /> },
            { label: "Total Minutes", value: Math.round(totalMinutes), icon: <Clock className="w-5 h-5 text-purple-400" /> },
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

        {/* Bio editor */}
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg text-white">Your Bio</h2>
            {!editBio ? (
              <button onClick={() => setEditBio(true)} className="text-purple-400 hover:text-purple-200 flex items-center gap-1 text-sm">
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={saveBio} disabled={savingBio} className="text-green-400 hover:text-green-200 flex items-center gap-1 text-sm">
                  <Check className="w-3.5 h-3.5" /> {savingBio ? "Saving…" : "Save"}
                </button>
                <button onClick={() => setEditBio(false)} className="text-red-400 hover:text-red-200 flex items-center gap-1 text-sm">
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            )}
          </div>
          {editBio ? (
            <textarea
              className="input-field resize-none h-28 text-sm"
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell clients about your expertise…"
            />
          ) : (
            <p className="font-body text-purple-300 italic leading-relaxed">{astroData?.bio}</p>
          )}
        </div>

        {/* Recent sessions */}
        <div className="mb-8">
          <h2 className="font-display text-xl text-white mb-4">Recent Sessions</h2>
          {sessions.filter(s => s.status !== "pending").length === 0 ? (
            <div className="card p-8 text-center">
              <div className="text-4xl mb-3">🌟</div>
              <p className="font-body text-purple-400 italic">No sessions yet. Go online to start receiving calls.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.filter(s => s.status !== "pending").slice(0, 10).map(s => (
                <div key={s.id} className="card p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full glass-light flex items-center justify-center text-lg">👤</div>
                    <div>
                      <p className="font-display text-white text-sm">{s.userName}</p>
                      <p className="font-body text-purple-400 text-xs">
                        {s.startedAt ? format(new Date(s.startedAt), "d MMM · h:mm a") : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-body text-purple-400 text-xs">{formatDuration(s.durationSeconds || 0)}</span>
                    <span className={`text-xs font-display px-2 py-0.5 rounded-full border ${s.status === "ended" ? "text-green-300 border-green-700 bg-green-900/20" :
                      s.status === "active" ? "text-gold-300 border-gold-600 bg-gold-900/20" :
                        s.status === "declined" ? "text-red-400 border-red-700 bg-red-900/10" :
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
