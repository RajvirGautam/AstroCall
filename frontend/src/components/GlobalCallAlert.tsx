"use client";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Session } from "@/types";
import { useRouter } from "next/navigation";
import { Phone, PhoneOff } from "lucide-react";
import { startSession, declineSession } from "@/lib/sessions";

export default function GlobalCallAlert() {
    const { profile, user, loading } = useAuth();
    const router = useRouter();
    const [incomingCall, setIncomingCall] = useState<Session | null>(null);
    const [accepting, setAccepting] = useState(false);

    useEffect(() => {
        if (loading || !user || profile?.role !== "astrologer") return;

        // Listen to pending calls for the astrologer globally
        const pendingQ = query(
            collection(db, "sessions"),
            where("astroId", "==", user.uid),
            where("status", "==", "pending")
        );

        const unsubPending = onSnapshot(
            pendingQ,
            (snap) => {
                const pending = snap.docs.map(d => ({ id: d.id, ...d.data() } as Session));
                console.log("[GlobalCallAlert] Pending calls:", pending.length);
                setIncomingCall(pending[0] || null);
            },
            (err) => console.error("[GlobalCallAlert] Pending query error:", err)
        );

        return () => unsubPending();
    }, [user, profile, loading]);

    const handleAccept = async () => {
        if (!incomingCall || accepting) return;
        setAccepting(true);
        try {
            await startSession(incomingCall.id);
            router.push(`/call/${incomingCall.id}`);
            setIncomingCall(null);
        } catch (e) {
            console.error(e);
        } finally {
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

    if (!incomingCall) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

            {/* Modal - Layout adapted from mockup */}
            <div
                className="relative flex flex-col p-8 rounded-3xl border max-w-[440px] w-full mx-4 overflow-hidden"
                style={{
                    background: "linear-gradient(145deg, rgba(20,8,45,0.98), rgba(6,2,15,0.99))",
                    borderColor: "rgba(167, 139, 250, 0.2)",
                    boxShadow: "0 0 80px rgba(124, 58, 237, 0.25), inset 0 2px 20px rgba(167, 139, 250, 0.1)",
                }}
            >
                {/* Glow effect at top left */}
                <div style={{ position: "absolute", top: -80, left: -40, width: 200, height: 150, background: "radial-gradient(ellipse at center, rgba(167, 139, 250, 0.3) 0%, transparent 70%)", filter: "blur(40px)" }} />

                {/* Glow effect at bottom right */}
                <div style={{ position: "absolute", bottom: -80, right: -40, width: 200, height: 150, background: "radial-gradient(ellipse at center, rgba(167, 139, 250, 0.15) 0%, transparent 70%)", filter: "blur(40px)" }} />

                <div className="relative z-10">
                    {/* Header Row: Title/Name & Avatar */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="font-display text-2xl text-white font-semibold mb-1 tracking-wide">New Session</h2>
                            <p className="font-body text-purple-300 text-[1.05rem]">{incomingCall.userName}</p>
                        </div>

                        <div className="flex-shrink-0 relative">
                            <div className="absolute -inset-2 rounded-full border border-purple-400/40" style={{ animation: "callRingPremium 2s cubic-bezier(0.21, 0.53, 0.56, 0.8) infinite" }} />
                            <div className="absolute -inset-4 rounded-full border border-purple-400/20" style={{ animation: "callRingPremium 2s cubic-bezier(0.21, 0.53, 0.56, 0.8) infinite 0.6s" }} />

                            <div className="relative w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-800 to-indigo-900 border-2 border-purple-500/50 shadow-[0_0_20px_rgba(139,92,246,0.3)] overflow-hidden">
                                <span className="font-display text-xl text-white font-bold">
                                    {incomingCall.userName?.charAt(0).toUpperCase() || "U"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Topic Section */}
                    <div className="mb-8">
                        <h3 className="font-display text-xl text-white font-semibold mb-2 tracking-wide">Topic</h3>
                        <p className="font-body text-gray-300 text-sm leading-relaxed">
                            A seeker has requested your guidance. Connect now to illuminate their cosmic path and provide clarity.
                        </p>
                    </div>

                    {/* Buttons Section */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleDecline}
                            disabled={accepting}
                            className="w-[120px] py-4 rounded-2xl border bg-black/40 hover:bg-red-950/40 transition-all duration-300 group disabled:opacity-50 flex items-center justify-center gap-2 relative z-10"
                            style={{ borderColor: "rgba(185, 28, 28, 0.3)" }}
                        >
                            <PhoneOff className="w-5 h-5 text-red-500 group-hover:text-red-400 transition-colors" />
                            <span className="font-display text-sm tracking-wide text-red-500 group-hover:text-red-400 font-semibold transition-colors">Decline</span>
                        </button>

                        <button
                            onClick={handleAccept}
                            disabled={accepting}
                            className="flex-1 py-4 rounded-2xl border transition-all duration-300 group disabled:opacity-50 flex items-center justify-center gap-3 relative overflow-hidden"
                            style={{
                                borderColor: "rgba(139, 92, 246, 0.4)",
                                background: "linear-gradient(145deg, rgba(88, 28, 135, 0.8), rgba(59, 7, 100, 0.6))",
                                boxShadow: "0 8px 25px -5px rgba(139, 92, 246, 0.3)"
                            }}
                        >
                            <div className="absolute inset-0 bg-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <span className="font-display text-sm tracking-wider text-white font-bold uppercase relative z-10">
                                {accepting ? "Connecting..." : "Join Meeting"}
                            </span>
                            {!accepting && <Phone className="w-5 h-5 text-white relative z-10" style={{ animation: "phoneVibrate 1.5s ease infinite alternate" }} />}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes callRingPremium {
                    0% { transform: scale(0.8); opacity: 0.8; }
                    100% { transform: scale(1.6); opacity: 0; }
                }
                @keyframes phoneVibrate {
                    from { transform: rotate(-5deg); }
                    to { transform: rotate(5deg); }
                }
            `}</style>
        </div>
    );
}
