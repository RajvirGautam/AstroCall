"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Astrologer } from "@/types";
import AstrologerCard from "@/components/AstrologerCard";
import GlassNavBar from "@/components/GlassNavBar";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, Shield, Star, Users, Clock } from "lucide-react";
import { createSession } from "@/lib/sessions";

const SPECIALTIES = ["All", "Vedic Astrology", "Tarot", "Numerology", "Palmistry", "KP System", "Nadi"];

export default function AstrologersPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [search, setSearch] = useState("");
  const [filterOnline, setFilterOnline] = useState(false);
  const [activeSpecialty, setActiveSpecialty] = useState("All");
  const [callingId, setCallingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "astrologers"), orderBy("isOnline", "desc"));
    const unsub = onSnapshot(q, snap => {
      setAstrologers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as Astrologer)));
    });
    return unsub;
  }, []);

  const filtered = astrologers.filter(a => {
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.specialties.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchSpecialty = activeSpecialty === "All" || a.specialties.includes(activeSpecialty);
    return matchSearch && matchSpecialty && (!filterOnline || a.isOnline);
  });

  const handleCall = async (astrologer: Astrologer) => {
    if (!user || !profile) { router.push("/auth/login"); return; }
    if (profile.role === "astrologer") { alert("Astrologers cannot call other astrologers."); return; }
    setCallingId(astrologer.uid);
    console.log("[Call] Calling astrologer UID:", astrologer.uid, "Name:", astrologer.name);
    try {
      const sessionId = await createSession(user.uid, profile.displayName, astrologer.uid, astrologer.name);
      console.log("[Call] Session created:", sessionId, "astroId:", astrologer.uid);
      router.push(`/call/${sessionId}`);
    } catch (err) {
      console.error(err);
      alert("Could not initiate call. Please try again.");
      setCallingId(null);
    }
  };


  const onlineCount = astrologers.filter(a => a.isOnline).length;

  return (
    <div style={{ minHeight: "100vh", overflowX: "hidden" }}>

      {/* Bg nebula */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 60% 50% at 20% 20%, rgba(60,0,120,0.15) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 70%, rgba(20,0,80,0.12) 0%, transparent 70%)" }} />

      <div style={{ position: "relative", zIndex: 10 }}><GlassNavBar /></div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "8rem 2rem 6rem" }}>

        {/* ── HERO HEADER ── */}
        <div style={{ textAlign: "center", marginBottom: "4rem", animation: "fadeUp 0.8s ease both" }}>

          {/* Live pill */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "100px", padding: "0.4rem 1.1rem", marginBottom: "1.8rem" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 10px #22c55e", display: "inline-block", animation: "livePulse 2s ease infinite" }} />
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.62rem", letterSpacing: "0.28em", color: "#22c55e", fontWeight: 600 }}>{onlineCount} MASTERS ONLINE NOW</span>
          </div>

          <h1 style={{ fontFamily: "'Cinzel',serif", fontWeight: 900, lineHeight: 1.05, marginBottom: "1.2rem" }}>
            <span style={{ display: "block", fontSize: "clamp(2rem,4vw,3.8rem)", color: "#f5f0ff", letterSpacing: "-0.01em" }}>Find Your</span>
            <span style={{ display: "block", fontSize: "clamp(2rem,4vw,3.8rem)", letterSpacing: "-0.01em", background: "linear-gradient(110deg,#c084fc 0%,#7c3aed 50%,#f59e0b 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Cosmic Guide</span>
          </h1>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.15rem", color: "#9ca3af", maxWidth: 500, margin: "0 auto 2rem", fontStyle: "italic", lineHeight: 1.7 }}>
            Live, face-to-face consultations with India&apos;s most trusted Vedic masters
          </p>

          {/* Trust badges */}
          <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap" }}>
            {[
              { icon: <Shield size={13} color="#f59e0b" />, text: "Verified Experts" },
              { icon: <Star size={13} color="#f59e0b" />, text: "4.9★ Avg Rating" },
              { icon: <Users size={13} color="#f59e0b" />, text: "50K+ Sessions" },
              { icon: <Clock size={13} color="#f59e0b" />, text: "Available 24/7" },
            ].map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                {b.icon}
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.62rem", color: "#6b7280", letterSpacing: "0.06em" }}>{b.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── FILTER BAR ── */}
        <div style={{ background: "linear-gradient(145deg,rgba(20,8,45,0.95),rgba(8,3,20,0.98))", border: "1px solid rgba(139,92,246,0.15)", borderRadius: 16, padding: "1.5rem 1.8rem", marginBottom: "2rem", backdropFilter: "blur(16px)", animation: "fadeUp 0.8s ease 0.1s both" }}>

          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.2rem", flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
              <Search size={14} color="#6b7280" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input
                placeholder="Search by name or specialty…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: "100%", paddingLeft: 40, paddingRight: 16, paddingTop: 11, paddingBottom: 11, background: "rgba(109,40,217,0.07)", border: "1px solid rgba(139,92,246,0.18)", borderRadius: 10, color: "#e9d5ff", fontFamily: "'Cormorant Garamond',serif", fontSize: "1rem", outline: "none", boxSizing: "border-box" }}
              />
            </div>
            {/* Online toggle */}
            <button onClick={() => setFilterOnline(!filterOnline)} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.2rem", borderRadius: 10, border: filterOnline ? "1px solid rgba(34,197,94,0.45)" : "1px solid rgba(139,92,246,0.18)", background: filterOnline ? "rgba(34,197,94,0.08)" : "rgba(109,40,217,0.07)", color: filterOnline ? "#22c55e" : "#6b7280", fontFamily: "'Cinzel',serif", fontSize: "0.62rem", letterSpacing: "0.08em", cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: filterOnline ? "#22c55e" : "#6b7280", display: "inline-block", boxShadow: filterOnline ? "0 0 6px #22c55e" : "none" }} />
              ONLINE ONLY
            </button>
          </div>

          {/* Specialty pills */}
          <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
            {SPECIALTIES.map(s => (
              <button key={s} onClick={() => setActiveSpecialty(s)} style={{ fontFamily: "'Cinzel',serif", fontSize: "0.58rem", letterSpacing: "0.07em", padding: "0.32rem 0.8rem", borderRadius: "100px", border: activeSpecialty === s ? "1px solid rgba(192,132,252,0.55)" : "1px solid rgba(139,92,246,0.13)", background: activeSpecialty === s ? "rgba(192,132,252,0.10)" : "transparent", color: activeSpecialty === s ? "#c084fc" : "#4b5563", cursor: "pointer", transition: "all 0.15s" }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Result count */}
        <p style={{ fontFamily: "'Cormorant Garamond',serif", color: "#4b5563", fontSize: "0.9rem", fontStyle: "italic", marginBottom: "1.5rem" }}>
          <span style={{ color: "#22c55e", fontStyle: "normal", fontFamily: "'Cinzel',serif", fontSize: "0.8rem" }}>{filtered.filter(a => a.isOnline).length}</span> online &nbsp;·&nbsp; <span style={{ color: "#6b7280" }}>{filtered.length} total</span>
        </p>

        {/* ── GRID ── */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 2rem", background: "linear-gradient(145deg,rgba(20,8,45,0.85),rgba(8,3,20,0.95))", border: "1px solid rgba(139,92,246,0.12)", borderRadius: 20 }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔭</div>
            <p style={{ fontFamily: "'Cinzel',serif", fontSize: "1.1rem", color: "#c084fc", marginBottom: "0.5rem" }}>No astrologers found</p>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", color: "#6b7280", fontStyle: "italic" }}>The stars are aligning… try a different search</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: "1.25rem" }}>
            {filtered.map((a, idx) => (
              <div key={a.uid} style={{ animation: `fadeUp 0.55s ease ${idx * 0.06}s both` }}>
                <AstrologerCard astrologer={a} onCall={handleCall} isLoading={callingId === a.uid} />
              </div>
            ))}
          </div>
        )}

        {/* ── BOTTOM TRUST ── */}
        <div style={{ marginTop: "4rem", padding: "2.5rem 3rem", background: "linear-gradient(145deg,rgba(20,8,45,0.85),rgba(8,3,20,0.95))", border: "1px solid rgba(139,92,246,0.12)", borderRadius: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "2rem", textAlign: "center" }}>
          {[
            { icon: "🔒", title: "100% Private", desc: "All sessions encrypted and confidential" },
            { icon: "✅", title: "Verified Masters", desc: "Background-checked and certified experts" },
            { icon: "💳", title: "Secure Payments", desc: "Pay only for time spent, no hidden fees" },
            { icon: "⭐", title: "Satisfaction Guaranteed", desc: "Not happy? We'll connect you for free" },
          ].map((f, i) => (
            <div key={i}>
              <div style={{ fontSize: "1.7rem", marginBottom: "0.6rem" }}>{f.icon}</div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.75rem", color: "#e9d5ff", marginBottom: "0.4rem", fontWeight: 600, letterSpacing: "0.04em" }}>{f.title}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "0.88rem", color: "#6b7280", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes livePulse { 0%,100% { opacity:1; box-shadow:0 0 10px #22c55e; } 50% { opacity:0.5; box-shadow:0 0 4px #22c55e; } }
        input::placeholder { color: #374151; font-style: italic; }
        input:focus { border-color: rgba(192,132,252,0.4) !important; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}