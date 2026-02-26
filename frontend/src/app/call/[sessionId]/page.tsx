"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot, collection, addDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Session } from "@/types";
import { endSession, cancelSession, submitReview } from "@/lib/sessions";
import { useCallTimer } from "@/hooks/useCallTimer";
import RatingModal from "@/components/RatingModal";
import dynamic from "next/dynamic";
import {
  PhoneOff, PhoneCall, X, MessageSquare, ChevronRight,
  Mic, MicOff, Video, VideoOff, Clock,
} from "lucide-react";

import type { ComponentType } from "react";

interface CustomCallRoomProps {
  onEndCall: () => void;
  callEnded: boolean;
  timerDisplay: string;
  otherName: string;
  chatOpen: boolean;
  setChatOpen: (v: boolean) => void;
}

// Dynamically import LiveKit to avoid SSR issues
const LiveKitRoom = dynamic(
  () => import("@livekit/components-react").then(m => m.LiveKitRoom),
  { ssr: false }
);
const CustomCallRoom = dynamic(
  () => import("./CustomCallRoom") as Promise<{ default: ComponentType<CustomCallRoomProps> }>,
  { ssr: false }
);

interface TokenData { token: string; wsUrl: string; }

// ─── Chat message type ───────────────────────────────────────────────────────
interface ChatMsg {
  id: string;
  text: string;
  senderName: string;
  senderId: string;
  createdAt: number;
}

export default function CallPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = Array.isArray(params.sessionId) ? params.sessionId[0] : params.sessionId;
  const { user, profile } = useAuth();
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [error, setError] = useState("");
  const [loadingToken, setLoadingToken] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Chat state
  const [chatOpen, setChatOpen] = useState(true);
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");

  const callEndedRef = useRef(false);
  const [callEnded, setCallEnded] = useState(false);
  const { formatted: timerDisplay } = useCallTimer(session?.startedAt ?? null);

  // ── Session listener ────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) return;
    return onSnapshot(doc(db, "sessions", sessionId), snap => {
      if (!snap.exists()) return;
      const data = { id: snap.id, ...snap.data() } as Session;
      setSession(data);
      if (data.status === "declined" && !callEndedRef.current) {
        callEndedRef.current = true; setCallEnded(true);
      }
      if (data.status === "ended" && !callEndedRef.current) {
        callEndedRef.current = true; setCallEnded(true);
        if (profile?.role === "user") setShowRating(true);
        else router.push("/dashboard/astrologer");
      }
    });
  }, [sessionId, profile?.role, router]);

  // ── Token fetch (only when active) ─────────────────────────────────────
  useEffect(() => {
    if (!sessionId || !user || !profile) return;
    if (session?.status !== "active") return;
    if (tokenData) return;
    const fetchToken = async () => {
      setLoadingToken(true);
      try {
        const res = await fetch("/api/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, identity: profile.displayName || user.uid }),
        });
        if (!res.ok) throw new Error("Failed to get token");
        setTokenData(await res.json());
      } catch (e: any) { setError(e.message); }
      finally { setLoadingToken(false); }
    };
    fetchToken();
  }, [session?.status, sessionId, user, profile, tokenData]);

  // ── Chat messages listener ──────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId || session?.status !== "active") return;
    const q = query(
      collection(db, "sessions", sessionId, "messages"),
      orderBy("createdAt", "asc")
    );
    return onSnapshot(q, snap =>
      setChatMsgs(snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMsg)))
    );
  }, [sessionId, session?.status]);

  const sendChat = async () => {
    if (!chatInput.trim() || !user || !profile) return;
    const text = chatInput.trim();
    setChatInput("");
    await addDoc(collection(db, "sessions", sessionId, "messages"), {
      text, senderName: profile.displayName || "You",
      senderId: user.uid, createdAt: Date.now(),
    });
  };

  const handleEndCall = useCallback(async () => {
    if (!session || callEndedRef.current) return;
    callEndedRef.current = true; setCallEnded(true);
    await endSession(sessionId, session.startedAt);
    if (profile?.role === "user") setShowRating(true);
    else router.push("/dashboard/astrologer");
  }, [session, sessionId, profile?.role, router]);

  const handleCancel = useCallback(async () => {
    if (!sessionId || cancelling) return;
    setCancelling(true);
    await cancelSession(sessionId);
    router.push("/astrologers");
  }, [sessionId, cancelling, router]);

  const handleRatingSubmit = async (rating: number, comment: string) => {
    if (!session || !user || !profile) return;
    await submitReview(sessionId, user.uid, profile.displayName, session.astroId, rating, comment);
    router.push("/dashboard/user");
  };

  if (!user || !profile) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-purple-400">Please sign in.</p>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // DECLINED STATE
  // ─────────────────────────────────────────────────────────────────────────
  if (session?.status === "declined") return (
    <div className="min-h-screen flex items-center justify-center bg-mystic-dark px-4">
      <div className="card p-10 flex flex-col items-center gap-5 max-w-sm w-full text-center">
        <div className="w-20 h-20 rounded-full bg-red-900/30 border border-red-700 flex items-center justify-center">
          <X className="w-10 h-10 text-red-400" />
        </div>
        <div>
          <h2 className="font-display text-2xl text-white mb-2">Call Declined</h2>
          <p className="font-body text-purple-400 italic text-sm">
            {session?.astroName} is unavailable right now.
          </p>
        </div>
        <button onClick={() => router.push("/astrologers")} className="btn-primary w-full">
          Browse Astrologers
        </button>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // PENDING / WAITING STATE
  // ─────────────────────────────────────────────────────────────────────────
  if (session?.status === "pending") return (
    <div className="min-h-screen flex items-center justify-center bg-[#06030f] px-4 relative overflow-hidden pointer-events-auto">
      {/* Background glow for call state */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[500px] max-h-[500px] rounded-full filter blur-[100px] bg-purple-900/20 pointer-events-none" />

      <div className="relative flex flex-col items-center gap-8 max-w-sm w-full text-center z-10 transition-all duration-500">

        {/* Pulsing Avatar/Radar */}
        <div className="relative flex items-center justify-center pt-8 mb-4">
          <div className="absolute w-52 h-52 rounded-full border border-gold-400/20 shadow-[0_0_60px_rgba(245,158,11,0.1)]"
            style={{ animation: 'radarPing 3s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
          <div className="absolute w-40 h-40 rounded-full border border-purple-400/30 shadow-[0_0_40px_rgba(139,92,246,0.15)]"
            style={{ animation: 'radarPing 3s cubic-bezier(0, 0, 0.2, 1) infinite 0.75s' }} />
          <div className="absolute w-28 h-28 rounded-full border-2 border-purple-400/40"
            style={{ animation: 'radarPing 3s cubic-bezier(0, 0, 0.2, 1) infinite 1.5s' }} />

          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-900/90 to-black border-2 border-purple-500/50 flex items-center justify-center z-10 shadow-[0_0_30px_rgba(139,92,246,0.4)]">
            <div className="text-4xl">🔮</div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="font-display text-[0.65rem] tracking-[0.3em] text-gold-400 uppercase font-bold px-4 py-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 inline-block animate-pulse">Establishing Connection</p>
          <h2 className="font-display text-4xl text-white tracking-wide" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
            Calling {session.astroName}
          </h2>
          <p className="font-body text-purple-300 italic text-[1.05rem]">Signaling the cosmos… please hold</p>
        </div>

        <button onClick={handleCancel} disabled={cancelling}
          className="mt-6 flex flex-col items-center justify-center gap-2 group transition-all duration-300 disabled:opacity-50"
        >
          <div className="w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative border border-red-500/30"
            style={{ background: "linear-gradient(135deg, rgba(153, 27, 27, 0.5), rgba(69, 10, 10, 0.8))", boxShadow: "0 10px 20px -5px rgba(185,28,28,0.3)" }}>
            <PhoneOff className="w-6 h-6 text-red-400 group-hover:text-red-300" />
          </div>
          <span className="font-display text-[0.7rem] tracking-widest text-red-500/80 group-hover:text-red-400 uppercase mt-2">
            {cancelling ? "Cancelling" : "End Call"}
          </span>
        </button>

      </div>

      <style jsx>{`
        @keyframes radarPing {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(1.3); opacity: 0; }
        }
      `}</style>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // ACTIVE CALL — full custom layout
  // ─────────────────────────────────────────────────────────────────────────
  const otherName = profile.role === "user" ? session?.astroName : session?.userName;

  return (
    <div style={{ height: "100vh", display: "flex", background: "#05020e", overflow: "hidden" }}>

      {/* ── LEFT: Video area ───────────────────────────────────────────── */}
      <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column" }}>

        {/* Remote video / placeholder */}
        <div style={{ flex: 1, position: "relative", background: "linear-gradient(135deg, #0d0520 0%, #11062b 100%)" }}>
          {loadingToken || !tokenData ? (
            /* Connecting placeholder */
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}>
              <div style={{ width: 120, height: 120, borderRadius: "50%", background: "linear-gradient(135deg,rgba(124,58,237,0.3),rgba(245,158,11,0.1))", border: "2px solid rgba(124,58,237,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>
                🔮
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontFamily: "'Cinzel',serif", fontSize: "1.1rem", color: "#c084fc", marginBottom: 6 }}>{otherName}</p>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", color: "#6b7280", fontStyle: "italic", fontSize: "0.9rem" }}>
                  {loadingToken ? "Connecting to the cosmos…" : "Initialising room…"}
                </p>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid #7c3aed", borderTopColor: "transparent", animation: "spin 0.9s linear infinite" }} />
            </div>
          ) : (
            /* LiveKit room */
            <LiveKitRoom
              token={tokenData.token}
              serverUrl={tokenData.wsUrl}
              connect={true}
              video={true}
              audio={true}
              style={{ position: "absolute", inset: 0 }}
            >
              <CustomCallRoom
                onEndCall={handleEndCall}
                callEnded={callEnded}
                timerDisplay={timerDisplay}
                otherName={otherName || ""}
                chatOpen={chatOpen}
                setChatOpen={setChatOpen}
              />
            </LiveKitRoom>
          )}

          {/* Top-left name badge */}
          <div style={{
            position: "absolute", top: 16, left: 16, zIndex: 10,
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(5,2,14,0.75)", backdropFilter: "blur(12px)",
            borderRadius: 12, border: "1px solid rgba(139,92,246,0.2)", padding: "8px 14px"
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e", animation: "livePulse 2s ease infinite" }} />
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.8rem", color: "#e9d5ff", letterSpacing: "0.04em" }}>{otherName}</span>
          </div>

          {/* Timer badge */}
          {session?.startedAt && (
            <div style={{
              position: "absolute", top: 16, right: 16, zIndex: 10,
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(5,2,14,0.75)", backdropFilter: "blur(12px)",
              borderRadius: 10, border: "1px solid rgba(245,158,11,0.25)", padding: "6px 12px"
            }}>
              <Clock style={{ width: 13, height: 13, color: "#f59e0b" }} />
              <span style={{ fontFamily: "'Courier New',monospace", fontSize: "0.8rem", color: "#fbbf24" }}>{timerDisplay}</span>
            </div>
          )}
        </div>

        {/* Control bar removed -- now handled entirely inside CustomCallRoom.tsx */}
      </div>

      {/* ── RIGHT: Chat panel ──────────────────────────────────────────── */}
      <div style={{
        width: chatOpen ? 320 : 0,
        transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
        background: "rgba(8,3,20,0.97)",
        borderLeft: "1px solid rgba(139,92,246,0.15)",
        display: "flex", flexDirection: "column",
        flexShrink: 0,
      }}>
        <div style={{ width: 320, height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Panel header */}
          <div style={{
            padding: "16px 20px", borderBottom: "1px solid rgba(139,92,246,0.15)",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MessageSquare style={{ width: 16, height: 16, color: "#c084fc" }} />
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.75rem", color: "#e9d5ff", letterSpacing: "0.06em" }}>SESSION CHAT</span>
            </div>
            <button onClick={() => setChatOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#4b5563" }}>
              <ChevronRight style={{ width: 18, height: 18 }} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
            {chatMsgs.length === 0 && (
              <div style={{ textAlign: "center", marginTop: 40 }}>
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>✨</div>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", color: "#374151", fontSize: "0.85rem", fontStyle: "italic" }}>
                  No messages yet.<br />Start the conversation!
                </p>
              </div>
            )}
            {chatMsgs.map(msg => {
              const isMe = msg.senderId === user?.uid;
              return (
                <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.58rem", color: "#4b5563", letterSpacing: "0.04em", marginBottom: 4, paddingInline: 4 }}>
                    {isMe ? "You" : msg.senderName}
                  </span>
                  <div style={{
                    maxWidth: "80%", padding: "9px 13px", borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    background: isMe
                      ? "linear-gradient(135deg,rgba(124,58,237,0.4),rgba(109,40,217,0.3))"
                      : "rgba(255,255,255,0.04)",
                    border: isMe ? "1px solid rgba(139,92,246,0.35)" : "1px solid rgba(255,255,255,0.06)",
                  }}>
                    <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "0.92rem", color: isMe ? "#e9d5ff" : "#9ca3af", margin: 0, lineHeight: 1.5 }}>
                      {msg.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(139,92,246,0.15)", display: "flex", gap: 8 }}>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendChat()}
              placeholder="Type a message…"
              style={{
                flex: 1, background: "rgba(109,40,217,0.08)", border: "1px solid rgba(139,92,246,0.2)",
                borderRadius: 10, padding: "9px 13px", color: "#e9d5ff", outline: "none",
                fontFamily: "'Cormorant Garamond',serif", fontSize: "0.92rem",
              }}
            />
            <button
              onClick={sendChat}
              style={{
                width: 38, height: 38, borderRadius: 10, border: "none", cursor: "pointer",
                background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "white",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}
            >
              <ChevronRight style={{ width: 16, height: 16, transform: "rotate(-90deg)" }} />
            </button>
          </div>
        </div>
      </div>

      {/* Toggle chat button (when closed) */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          style={{
            position: "fixed", right: 16, top: "50%", transform: "translateY(-50%)",
            zIndex: 50, width: 40, height: 40, borderRadius: 10,
            background: "rgba(109,40,217,0.3)", border: "1px solid rgba(139,92,246,0.3)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <MessageSquare style={{ width: 18, height: 18, color: "#c084fc" }} />
        </button>
      )}

      {/* Rating modal */}
      {showRating && session && (
        <RatingModal
          astroName={session.astroName}
          onSubmit={handleRatingSubmit}
          onSkip={() => router.push("/dashboard/user")}
        />
      )}

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes livePulse { 0%,100%{opacity:1;box-shadow:0 0 8px #22c55e;}50%{opacity:0.5;box-shadow:0 0 3px #22c55e;} }
        @keyframes ping { 75%,100%{transform:scale(1.6);opacity:0;} }
        .animate-ping { animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite; }
      `}</style>
    </div>
  );
}