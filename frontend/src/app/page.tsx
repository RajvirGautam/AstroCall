"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Sparkles, ChevronRight, Phone, Award, Video, Zap, Shield, Users, Star } from "lucide-react";

interface ZodiacSign {
  symbol: string; name: string; dates: string; color: string;
  element: string; ruling: string; traits: string[];
}
interface StarParticle {
  x: number; y: number; bx: number; by: number;
  r: number; op: number; speed: number; phase: number;
  vx: number; vy: number;
}

const ZODIAC: ZodiacSign[] = [
  { symbol: "♈", name: "Aries", dates: "Mar 21 – Apr 19", color: "#ff6b6b", element: "Fire", ruling: "Mars", traits: ["Bold", "Passionate", "Driven"] },
  { symbol: "♉", name: "Taurus", dates: "Apr 20 – May 20", color: "#6ee7b7", element: "Earth", ruling: "Venus", traits: ["Loyal", "Patient", "Grounded"] },
  { symbol: "♊", name: "Gemini", dates: "May 21 – Jun 20", color: "#fde68a", element: "Air", ruling: "Mercury", traits: ["Curious", "Witty", "Adaptable"] },
  { symbol: "♋", name: "Cancer", dates: "Jun 21 – Jul 22", color: "#c4b5fd", element: "Water", ruling: "Moon", traits: ["Intuitive", "Caring", "Sensitive"] },
  { symbol: "♌", name: "Leo", dates: "Jul 23 – Aug 22", color: "#fbbf24", element: "Fire", ruling: "Sun", traits: ["Charismatic", "Creative", "Generous"] },
  { symbol: "♍", name: "Virgo", dates: "Aug 23 – Sep 22", color: "#86efac", element: "Earth", ruling: "Mercury", traits: ["Analytical", "Precise", "Helpful"] },
  { symbol: "♎", name: "Libra", dates: "Sep 23 – Oct 22", color: "#fb923c", element: "Air", ruling: "Venus", traits: ["Balanced", "Charming", "Fair"] },
  { symbol: "♏", name: "Scorpio", dates: "Oct 23 – Nov 21", color: "#f87171", element: "Water", ruling: "Pluto", traits: ["Intense", "Mysterious", "Powerful"] },
  { symbol: "♐", name: "Sagittarius", dates: "Nov 22 – Dec 21", color: "#a78bfa", element: "Fire", ruling: "Jupiter", traits: ["Free", "Optimistic", "Adventurous"] },
  { symbol: "♑", name: "Capricorn", dates: "Dec 22 – Jan 19", color: "#67e8f9", element: "Earth", ruling: "Saturn", traits: ["Ambitious", "Disciplined", "Wise"] },
  { symbol: "♒", name: "Aquarius", dates: "Jan 20 – Feb 18", color: "#818cf8", element: "Air", ruling: "Uranus", traits: ["Innovative", "Humanitarian", "Unique"] },
  { symbol: "♓", name: "Pisces", dates: "Feb 19 – Mar 20", color: "#34d399", element: "Water", ruling: "Neptune", traits: ["Dreamy", "Compassionate", "Artistic"] },
];

const READING_TYPES = [
  { id: "daily", label: "Today's Reading", icon: "☀️" },
  { id: "love", label: "Love & Relations", icon: "💕" },
  { id: "career", label: "Career & Wealth", icon: "💼" },
  { id: "spiritual", label: "Spiritual Path", icon: "🔮" },
] as const;
type ReadingTypeId = typeof READING_TYPES[number]["id"];

const LUCKY_LABELS: Record<ReadingTypeId, [string, string, string]> = {
  daily: ["Lucky Number", "Lucky Color", "Lucky Time"],
  love: ["Best Match", "Love Tip", "Peak Day"],
  career: ["Power Number", "Power Day", "Mantra"],
  spiritual: ["Sacred Crystal", "Mantra Word", "Focus Chakra"],
};



/* ─── Planets (fixed, parallax on scroll) ──────────────────────── */
function PlanetLayer({ scrollY }: { scrollY: number }) {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, overflow: "hidden" }}>
      {/* Saturn – top-left */}
      <svg
        width="320" height="200"
        style={{ position: "absolute", top: `${-20 + scrollY * 0.06}px`, left: "-30px", opacity: 0.85, filter: "drop-shadow(0 0 30px rgba(120,60,200,0.5))", transform: `rotate(${scrollY * 0.02}deg)`, transformOrigin: "center" }}
        viewBox="0 0 320 200"
      >
        {/* Ring */}
        <ellipse cx="160" cy="110" rx="140" ry="28" fill="none" stroke="rgba(180,130,255,0.45)" strokeWidth="10" />
        <ellipse cx="160" cy="110" rx="140" ry="28" fill="none" stroke="rgba(140,80,220,0.2)" strokeWidth="20" />
        {/* Planet body */}
        <radialGradient id="satGrad" cx="38%" cy="32%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="50%" stopColor="#4c1d95" />
          <stop offset="100%" stopColor="#1e0a3c" />
        </radialGradient>
        <circle cx="160" cy="110" r="58" fill="url(#satGrad)" />
        {/* Band lines */}
        <ellipse cx="160" cy="100" rx="55" ry="6" fill="none" stroke="rgba(167,139,250,0.15)" strokeWidth="4" />
        <ellipse cx="160" cy="118" rx="52" ry="5" fill="none" stroke="rgba(167,139,250,0.10)" strokeWidth="3" />
        {/* Moon */}
        <circle cx="245" cy="48" r="14" fill="#2e1065" stroke="rgba(167,139,250,0.3)" strokeWidth="1" />
        <circle cx="242" cy="45" r="3" fill="rgba(0,0,0,0.4)" />
        <circle cx="249" cy="52" r="2" fill="rgba(0,0,0,0.3)" />
      </svg>

      {/* Cratered Moon – top-right */}
      <svg
        width="160" height="160"
        style={{ position: "absolute", top: `${10 + scrollY * 0.04}px`, right: "80px", opacity: 0.75, filter: "drop-shadow(0 0 24px rgba(180,160,255,0.35))", transform: `rotate(${scrollY * -0.015}deg)`, transformOrigin: "center" }}
        viewBox="0 0 160 160"
      >
        <radialGradient id="moonGrad" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#6b5b8a" />
          <stop offset="60%" stopColor="#3b2d5e" />
          <stop offset="100%" stopColor="#1a1033" />
        </radialGradient>
        <circle cx="80" cy="80" r="72" fill="url(#moonGrad)" />
        <circle cx="55" cy="50" r="12" fill="none" stroke="rgba(100,80,140,0.5)" strokeWidth="2.5" />
        <circle cx="100" cy="65" r="8" fill="none" stroke="rgba(100,80,140,0.4)" strokeWidth="2" />
        <circle cx="70" cy="105" r="15" fill="none" stroke="rgba(100,80,140,0.45)" strokeWidth="2.5" />
        <circle cx="115" cy="95" r="6" fill="none" stroke="rgba(100,80,140,0.35)" strokeWidth="1.5" />
        <circle cx="45" cy="85" r="5" fill="none" stroke="rgba(100,80,140,0.3)" strokeWidth="1.5" />
      </svg>

      {/* Gas Giant – mid-right */}
      <svg
        width="320" height="320"
        style={{ position: "absolute", top: `${180 + scrollY * 0.1}px`, right: "-80px", opacity: 0.7, filter: "drop-shadow(0 0 50px rgba(100,30,180,0.4))", transform: `rotate(${scrollY * 0.01}deg)`, transformOrigin: "center" }}
        viewBox="0 0 320 320"
      >
        <radialGradient id="gasGrad" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="40%" stopColor="#4c1d95" />
          <stop offset="80%" stopColor="#2e1065" />
          <stop offset="100%" stopColor="#0d0520" />
        </radialGradient>
        <circle cx="160" cy="160" r="150" fill="url(#gasGrad)" />
        {/* Swirl lines */}
        <ellipse cx="160" cy="135" rx="148" ry="14" fill="none" stroke="rgba(139,92,246,0.12)" strokeWidth="10" />
        <ellipse cx="160" cy="160" rx="146" ry="12" fill="none" stroke="rgba(109,40,217,0.10)" strokeWidth="8" />
        <ellipse cx="160" cy="185" rx="145" ry="10" fill="none" stroke="rgba(139,92,246,0.08)" strokeWidth="6" />
        {/* Organic tentacular edge hints */}
        <path d="M295,200 C310,230 305,260 290,280 C280,295 270,300 270,300" fill="none" stroke="rgba(109,40,217,0.35)" strokeWidth="6" strokeLinecap="round" />
        <path d="M300,160 C325,180 320,210 310,230" fill="none" stroke="rgba(139,92,246,0.25)" strokeWidth="5" strokeLinecap="round" />
        <path d="M285,240 C305,265 295,300 280,315" fill="none" stroke="rgba(109,40,217,0.20)" strokeWidth="4" strokeLinecap="round" />
      </svg>

      {/* Comet / streak – top-left-ish */}
      <div style={{
        position: "absolute",
        top: `${60 + scrollY * 0.02}px`,
        left: "60px",
        width: "120px",
        height: "3px",
        background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.8), rgba(255,120,50,0.9))",
        borderRadius: "2px",
        transform: "rotate(-30deg)",
        filter: "blur(1px)",
        boxShadow: "0 0 10px rgba(245,158,11,0.7)",
      }} />
    </div>
  );
}

/* ─── Zodiac Wheel ──────────────────────────────────────────────── */
function ZodiacWheel({ rotation, selectedIdx, hoveredIdx, onSelect, onHover }: {
  rotation: number; selectedIdx: number | null; hoveredIdx: number | null;
  onSelect: (i: number) => void; onHover: (i: number | null) => void;
}) {
  const SIZE = 400, cx = 200, cy = 200, outerR = 158, innerR = 108;
  return (
    <div style={{ position: "relative", width: SIZE, height: SIZE + 36, flexShrink: 0 }}>
      <svg width={SIZE} height={SIZE} style={{ overflow: "visible" }}>
        <defs>
          <radialGradient id="wOrbGrad" cx="38%" cy="32%">
            <stop offset="0%" stopColor="#9333ea" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#3b0764" stopOpacity="0.98" />
            <stop offset="100%" stopColor="#0a0118" />
          </radialGradient>
          <radialGradient id="wBgGlow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.18" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <filter id="wGlow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <circle cx={cx} cy={cy} r={outerR + 60} fill="url(#wBgGlow)" />
        <circle cx={cx} cy={cy} r={outerR + 32} fill="none" stroke="rgba(139,92,246,0.07)" strokeWidth="1" strokeDasharray="2 12" />
        <circle cx={cx} cy={cy} r={outerR + 14} fill="none" stroke="rgba(139,92,246,0.13)" strokeWidth="0.8" />
        <circle cx={cx} cy={cy} r={outerR - 2} fill="none" stroke="rgba(139,92,246,0.06)" strokeWidth="0.5" />
        <circle cx={cx} cy={cy} r={innerR + 8} fill="none" stroke="rgba(139,92,246,0.08)" strokeWidth="0.5" strokeDasharray="1 8" />
        {ZODIAC.map((_, i) => {
          const ang = ((i * 30) + rotation - 90) * (Math.PI / 180);
          return <line key={i} x1={cx + (innerR + 10) * Math.cos(ang)} y1={cy + (innerR + 10) * Math.sin(ang)} x2={cx + (outerR - 5) * Math.cos(ang)} y2={cy + (outerR - 5) * Math.sin(ang)} stroke="rgba(139,92,246,0.06)" strokeWidth="0.5" />;
        })}
        {ZODIAC.map((z, i) => {
          const ang = ((i * 30) + rotation - 90) * (Math.PI / 180);
          const r = (outerR + innerR) / 2 + 6;
          const x = cx + r * Math.cos(ang), y = cy + r * Math.sin(ang);
          const isSel = selectedIdx === i, isHov = hoveredIdx === i, active = isSel || isHov;
          return (
            <g key={i} style={{ cursor: "pointer" }} onClick={() => onSelect(i)} onMouseEnter={() => onHover(i)} onMouseLeave={() => onHover(null)}>
              {isSel && <circle cx={x} cy={y} r={26} fill="none" stroke={z.color} strokeWidth="1" opacity="0.35" style={{ animation: "pulseRing 2s ease infinite" }} />}
              {/* Solid semi-transparent background on hover built via fillOpacity to prevent rendering issues */}
              <circle cx={x} cy={y} r={active ? 24 : 18} fill={active ? z.color : "transparent"} fillOpacity={active ? 0.25 : 0} stroke="none" style={{ transition: "all 0.2s ease" }} />
              <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fontSize={active ? "26" : "20"} fontFamily="serif" fill={active ? z.color : "#a78bfa"} style={{ transition: "all 0.2s ease", filter: active ? `drop-shadow(0 0 8px ${z.color})` : "drop-shadow(0 0 2px rgba(167,139,250,0.5))" }}>
                {z.symbol}
              </text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={innerR - 10} fill="url(#wOrbGrad)" stroke="rgba(139,92,246,0.25)" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r={innerR - 18} fill="none" stroke="rgba(139,92,246,0.10)" strokeWidth="0.5" />
        <text x={cx} y={cy + 2} textAnchor="middle" dominantBaseline="middle" fontSize="28" fill="#e9d5ff" fontFamily="serif" style={{ filter: "drop-shadow(0 0 14px rgba(167,139,250,0.9))" }}>✦</text>
        <text x={cx} y={cy + 26} textAnchor="middle" dominantBaseline="middle" fontSize="7" fill="#5b21b6" fontFamily="'Cinzel',serif" letterSpacing="2">ASTROCALL</text>
      </svg>
      <div style={{ height: 28, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        {(hoveredIdx !== null || selectedIdx !== null) && (() => {
          const z = ZODIAC[hoveredIdx ?? selectedIdx!];
          return (<><span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.9rem", fontWeight: 600, color: z.color, filter: `drop-shadow(0 0 6px ${z.color}88)` }}>{z.name}</span><span style={{ fontFamily: "Georgia,serif", fontSize: "0.78rem", color: "#6b7280", fontStyle: "italic" }}>{z.dates}</span></>);
        })()}
        {hoveredIdx === null && selectedIdx === null && (<span style={{ fontFamily: "Georgia,serif", fontSize: "0.78rem", color: "#374151", fontStyle: "italic" }}>Click a sign to begin your reading</span>)}
      </div>
    </div>
  );
}

/* ─── Reading Panel ─────────────────────────────────────────────── */
function ReadingPanel({ sign, onClose }: { sign: ZodiacSign; onClose: () => void }) {
  const [activeType, setActiveType] = useState<ReadingTypeId>("daily");
  const [reading, setReading] = useState("");
  const [loading, setLoading] = useState(false);
  const [luckyInfo, setLuckyInfo] = useState<string[]>([]);

  const fetchReading = useCallback(async (type: ReadingTypeId) => {
    setLoading(true); setReading(""); setLuckyInfo([]);
    try {
      const res = await fetch("/api/horoscope", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ signName: sign.name, readingType: type }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      const text = (data.text as string) ?? "";
      const match = text.match(/LUCKY:\s*(.+)/);
      if (match) setLuckyInfo(match[1].split("|").map((s: string) => s.trim()));
      setReading(text.replace(/LUCKY:.*$/m, "").trim());
    } catch { setReading("The stars are momentarily veiled… Please try again."); }
    setLoading(false);
  }, [sign]);

  useEffect(() => { fetchReading(activeType); }, [sign.name, activeType, fetchReading]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "linear-gradient(160deg,rgba(20,8,50,0.97) 0%,rgba(8,2,22,0.99) 100%)", borderLeft: `1px solid ${sign.color}20`, animation: "slideIn 0.35s cubic-bezier(0.16,1,0.3,1) both" }}>
      <div style={{ padding: "1.5rem 2rem 1.2rem", borderBottom: "1px solid rgba(139,92,246,0.10)", background: `linear-gradient(135deg,${sign.color}08 0%,transparent 55%)`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: `radial-gradient(circle,${sign.color}30,${sign.color}08)`, border: `1.5px solid ${sign.color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", boxShadow: `0 0 20px ${sign.color}28`, flexShrink: 0 }}>{sign.symbol}</div>
          <div>
            <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "1.25rem", color: sign.color, fontWeight: 700, margin: 0, lineHeight: 1, filter: `drop-shadow(0 0 8px ${sign.color}50)` }}>{sign.name}</h2>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.3rem", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontFamily: "Georgia,serif", fontSize: "0.72rem", color: "#6b7280", fontStyle: "italic" }}>{sign.dates}</span>
              <span style={{ color: "#2d1d45", fontSize: "0.6rem" }}>•</span>
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.65rem", color: "#7c3aed", letterSpacing: "0.05em" }}>{sign.element} · {sign.ruling}</span>
            </div>
            <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.45rem", flexWrap: "wrap" }}>
              {sign.traits.map(t => (<span key={t} style={{ fontFamily: "'Cinzel',serif", fontSize: "0.58rem", letterSpacing: "0.06em", color: sign.color, background: sign.color + "10", border: `1px solid ${sign.color}25`, borderRadius: "100px", padding: "0.18rem 0.5rem" }}>{t}</span>))}
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.18)", color: "#6b7280", cursor: "pointer", borderRadius: "8px", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>×</button>
      </div>
      <div style={{ display: "flex", gap: "0.45rem", padding: "0.85rem 2rem", borderBottom: "1px solid rgba(139,92,246,0.07)", flexShrink: 0, flexWrap: "wrap" }}>
        {READING_TYPES.map(rt => (
          <button key={rt.id} onClick={() => setActiveType(rt.id)} style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontFamily: "'Cinzel',serif", fontSize: "0.62rem", letterSpacing: "0.07em", padding: "0.4rem 0.85rem", borderRadius: "8px", cursor: "pointer", border: activeType === rt.id ? `1px solid ${sign.color}60` : "1px solid rgba(139,92,246,0.14)", background: activeType === rt.id ? sign.color + "16" : "transparent", color: activeType === rt.id ? sign.color : "#6b7280", transition: "all 0.18s ease" }}>
            <span style={{ fontSize: "0.82rem" }}>{rt.icon}</span>{rt.label}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "1.6rem 2rem" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "1rem" }}>
            <div style={{ fontSize: "2.2rem", animation: "spinStar 3s linear infinite" }}>✦</div>
            <p style={{ fontFamily: "Georgia,serif", fontSize: "0.92rem", color: "#4b5563", fontStyle: "italic", margin: 0 }}>The stars are aligning your reading…</p>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: "Georgia,serif", fontSize: "0.98rem", color: "#d1d5db", lineHeight: 1.88, marginBottom: luckyInfo.length ? "1.6rem" : 0 }}>
              {reading.split("\n\n").filter(Boolean).map((para, i) => (<p key={i} style={{ margin: "0 0 1rem" }}>{para}</p>))}
            </div>
            {luckyInfo.length >= 3 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.7rem" }}>
                {luckyInfo.slice(0, 3).map((val, i) => (
                  <div key={i} style={{ background: `linear-gradient(145deg,${sign.color}0c,${sign.color}04)`, border: `1px solid ${sign.color}20`, borderRadius: "12px", padding: "0.9rem 0.65rem", textAlign: "center" }}>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.56rem", color: "#4b5563", letterSpacing: "0.1em", marginBottom: "0.45rem", textTransform: "uppercase" }}>{LUCKY_LABELS[activeType][i]}</div>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.88rem", color: sign.color, fontWeight: 700, filter: `drop-shadow(0 0 4px ${sign.color}50)` }}>{val}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <div style={{ padding: "0.9rem 2rem", borderTop: "1px solid rgba(139,92,246,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <span style={{ fontFamily: "Georgia,serif", fontSize: "0.7rem", color: "#374151", fontStyle: "italic" }}>✦ Powered by Vedic wisdom &amp; cosmic insight</span>
        <button onClick={() => fetchReading(activeType)} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: "'Cinzel',serif", fontSize: "0.62rem", letterSpacing: "0.08em", color: sign.color, background: sign.color + "10", border: `1px solid ${sign.color}28`, borderRadius: "8px", padding: "0.4rem 0.85rem", cursor: "pointer" }}>↻ New Reading</button>
      </div>
    </div>
  );
}

/* ─── HomePage ──────────────────────────────────────────────────── */
export default function HomePage() {
  const [rotation, setRotation] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const rotRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const animate = (ts: number) => {
      if (!lastRef.current) lastRef.current = ts;
      const dt = ts - lastRef.current; lastRef.current = ts;
      if (!isPaused) { rotRef.current += dt * 0.012; setRotation(rotRef.current); }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPaused]);

  const handleSelect = (idx: number) => { setSelectedIdx(prev => prev === idx ? null : idx); };
  const handleClose = () => { setSelectedIdx(null); };

  const features = [
    { icon: <Award size={28} color="#f59e0b" />, symbol: "⚖", title: "Certified Vedic Masters", desc: "Rigorously verified astrologers with decades of Vedic study. No shortcuts.", accent: "#f59e0b" },
    { icon: <Video size={28} color="#818cf8" />, symbol: "📡", title: "HD Video Consultations", desc: "Private, encrypted sessions powered by enterprise-grade streaming.", accent: "#818cf8" },
    { icon: <Zap size={28} color="#34d399" />, symbol: "⚡", title: "Instant Availability", desc: "See who's online right now. Ancient wisdom on modern time — no waiting.", accent: "#34d399" },
    { icon: <Shield size={28} color="#f87171" />, symbol: "🛡", title: "100% Confidential", desc: "All sessions encrypted, never stored. What the stars reveal stays with you.", accent: "#f87171" },
  ];

  return (
    <div style={{ minHeight: "100vh", overflowX: "hidden" }}>
      <PlanetLayer scrollY={scrollY} />

      {/* Nebula atmosphere glows */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 60% 55% at 10% 50%, rgba(60,0,120,0.18) 0%, transparent 100%), radial-gradient(ellipse 50% 45% at 90% 15%, rgba(80,0,160,0.14) 0%, transparent 100%), radial-gradient(ellipse 40% 40% at 80% 80%, rgba(40,0,90,0.10) 0%, transparent 100%)"
      }} />

      {/* Glassmorphic Navbar */}
      <div style={{ position: "relative", zIndex: 50 }}><Navbar /></div>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 2, minHeight: "100vh", display: "flex", alignItems: "center", padding: "2rem 2rem 4rem" }}>
        <div style={{ maxWidth: 1180, width: "100%", margin: "0 auto", position: "relative", zIndex: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center", marginBottom: "3rem" }}>

            {/* Left – copy */}
            <div style={{ animation: "fadeUp 0.9s ease both", marginTop: "8rem" }}>
              {/* Floating spaceship SVG removed per user request */}

              <h1 style={{ fontFamily: "'Cinzel',serif", fontWeight: 900, lineHeight: 1.05, marginBottom: "1.6rem" }}>
                <span style={{ display: "block", fontSize: "clamp(2.8rem,5.5vw,5.2rem)", color: "#f5f0ff", letterSpacing: "-0.01em" }}>THE COSMOS</span>
                <span style={{ display: "block", fontSize: "clamp(2.8rem,5.5vw,5.2rem)", letterSpacing: "-0.01em", background: "linear-gradient(110deg,#c084fc 0%,#7c3aed 45%,#f59e0b 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AWAITS YOU</span>
              </h1>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.18rem", color: "#a78bfa", lineHeight: 1.75, marginBottom: "2rem", maxWidth: 460, fontStyle: "italic" }}>
                Traverse the endless void where planets align and destinies are written. Connect face-to-face with certified Vedic masters — the stars have a message for you.
              </p>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "3rem" }}>
                <Link href="/astrologers" style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", fontFamily: "'Cinzel',serif", fontSize: "0.75rem", letterSpacing: "0.12em", fontWeight: 800, color: "#0a0415", background: "linear-gradient(110deg,#f59e0b,#d97706)", padding: "0.95rem 2rem", borderRadius: "10px", textDecoration: "none", boxShadow: "0 4px 24px rgba(245,158,11,0.4)", animation: "pulseBtn 3s ease infinite" }}>
                  <Sparkles size={15} /> FIND ASTROLOGERS
                </Link>
                <Link href="/auth/register" style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", fontFamily: "'Cinzel',serif", fontSize: "0.75rem", letterSpacing: "0.12em", color: "#c4b5fd", background: "rgba(109,40,217,0.12)", border: "1px solid rgba(139,92,246,0.35)", padding: "0.95rem 2rem", borderRadius: "10px", textDecoration: "none", backdropFilter: "blur(8px)" }}>
                  BEGIN YOUR JOURNEY <ChevronRight size={14} />
                </Link>
              </div>
              <div style={{ display: "flex", gap: "2.5rem", paddingTop: "2rem", borderTop: "1px solid rgba(139,92,246,0.15)", flexWrap: "wrap" }}>
                {[{ n: "500+", l: "Verified Astrologers" }, { n: "50K+", l: "Sessions Completed" }, { n: "4.9★", l: "Average Rating" }].map((b, i) => (
                  <div key={i}>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: "1.6rem", color: "#c084fc", fontWeight: 700, lineHeight: 1 }}>{b.n}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "0.85rem", color: "#6b7280", letterSpacing: "0.05em", marginTop: "0.3rem" }}>{b.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right – Zodiac Wheel, gravity-tinted */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: "fadeUp 0.9s ease 0.2s both", position: "relative", zIndex: 10 }}>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "120%", height: "120%", background: "radial-gradient(circle, rgba(88,28,220,0.18) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />
              <div style={{ position: "relative", zIndex: 2 }}>
                <ZodiacWheel rotation={rotation} selectedIdx={selectedIdx} hoveredIdx={hoveredIdx} onSelect={handleSelect} onHover={setHoveredIdx} />
              </div>
            </div>
          </div>

          {/* Reading panel */}
          {selectedIdx !== null && (
            <div style={{ animation: "fadeUp 0.35s ease both" }}>
              <div style={{ display: "flex", background: "linear-gradient(145deg,rgba(15,5,40,0.97) 0%,rgba(6,2,18,0.99) 100%)", border: "1px solid rgba(109,40,217,0.22)", borderRadius: 20, boxShadow: "0 0 80px rgba(109,40,217,0.08),0 20px 60px rgba(0,0,0,0.7)", overflow: "hidden", height: 420 }}>
                <div style={{ width: 52, background: "rgba(8,3,20,0.6)", borderRight: "1px solid rgba(109,40,217,0.12)", display: "flex", flexDirection: "column", alignItems: "center", padding: "0.75rem 0", gap: "0.2rem", overflowY: "auto", flexShrink: 0 }}>
                  {ZODIAC.map((z, i) => (
                    <button key={i} onClick={() => handleSelect(i)} title={z.name} style={{ width: 36, height: 36, borderRadius: "50%", border: selectedIdx === i ? `1.5px solid ${z.color}aa` : "1px solid transparent", background: selectedIdx === i ? z.color + "18" : "transparent", color: selectedIdx === i ? z.color : "#4b5563", fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "serif", transition: "all 0.15s", flexShrink: 0 }}>{z.symbol}</button>
                  ))}
                </div>
                <ReadingPanel sign={ZODIAC[selectedIdx]} onClose={handleClose} />
              </div>
            </div>
          )}

          {selectedIdx === null && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center", marginTop: "0.5rem", animation: "fadeUp 0.9s ease 0.4s both" }}>
              <span style={{ fontFamily: "Georgia,serif", fontSize: "0.75rem", color: "#374151", fontStyle: "italic", display: "flex", alignItems: "center", marginRight: "0.5rem" }}>Or jump to:</span>
              {ZODIAC.map((z, i) => (
                <button key={i} onClick={() => handleSelect(i)} style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontFamily: "'Cinzel',serif", fontSize: "0.6rem", letterSpacing: "0.05em", padding: "0.32rem 0.7rem", borderRadius: "100px", cursor: "pointer", border: "1px solid rgba(109,40,217,0.18)", background: "rgba(10,4,28,0.6)", color: "#4b5563", transition: "all 0.2s ease" }}>
                  <span style={{ fontSize: "0.8rem" }}>{z.symbol}</span>{z.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── ORGANIC CURVE DIVIDER ────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 2, marginTop: "-2px" }}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "80px" }}>
          <path d="M0,80 L0,40 C120,70 240,10 360,40 C480,70 600,10 720,40 C840,70 960,10 1080,40 C1200,70 1320,10 1440,40 L1440,80 Z" fill="rgba(19,7,38,0.4)" />
        </svg>
      </div>

      {/* ── FEATURE CARDS ────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 2, padding: "5rem 2rem 6rem", background: "rgba(19,7,38,0.4)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.65rem", letterSpacing: "0.4em", color: "#f59e0b", marginBottom: "0.8rem", fontWeight: 600 }}>✦ WHY ASTROCALL ✦</div>
            <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "2.2rem", fontWeight: 700, color: "#f5f0ff", marginBottom: "0.8rem" }}>Written in the <span style={{ background: "linear-gradient(110deg,#c084fc,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Stars</span></h2>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.1rem", color: "#9ca3af", maxWidth: 500, margin: "0 auto", fontStyle: "italic" }}>India&apos;s most trusted platform for live Vedic astrology consultations</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: "1.5rem" }}>
            {features.map((f, i) => (
              <div key={i} className="feature-card" style={{ background: "rgba(15,5,25,0.7)", border: `1px solid ${f.accent}22`, borderRadius: "16px", padding: "2rem 1.5rem", backdropFilter: "blur(16px)", boxShadow: `0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)`, transition: "transform 0.3s ease, box-shadow 0.3s ease" }}>
                {/* Glowing icon with SVG ring */}
                <div style={{ marginBottom: "1.4rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ position: "relative", width: 60, height: 60 }}>
                    <svg width="60" height="60" viewBox="0 0 60 60" style={{ position: "absolute", inset: 0 }}>
                      <circle cx="30" cy="30" r="28" fill="none" stroke={f.accent} strokeWidth="1" strokeOpacity="0.35" strokeDasharray="4 3" />
                      <circle cx="30" cy="30" r="28" fill="none" stroke={f.accent} strokeWidth="0.5" strokeOpacity="0.15" />
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `radial-gradient(circle, ${f.accent}22 0%, transparent 70%)`, borderRadius: "50%" }}>
                      {f.icon}
                    </div>
                  </div>
                </div>
                <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: "0.88rem", color: "#e9d5ff", marginBottom: "0.75rem", letterSpacing: "0.05em", fontWeight: 700 }}>{f.title}</h3>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", color: "#9ca3af", lineHeight: 1.75, fontSize: "1rem" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USER REVIEWS ─────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 2, padding: "2rem 2rem 7rem", background: "rgba(19,7,38,0.4)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "1.25rem" }}>
          {[
            { quote: "The reading was incredibly accurate. My astrologer explained my birth chart in a way no one ever had before.", name: "Priya S.", sign: "♋ Cancer" },
            { quote: "I was skeptical at first, but after my session I felt completely at peace. Highly recommend to anyone seeking guidance.", name: "Rahul M.", sign: "♈ Aries" },
            { quote: "Professional, insightful, and deeply knowledgeable. This platform has the best Vedic astrologers I've ever consulted.", name: "Anjali K.", sign: "♍ Virgo" },
          ].map((t, i) => (
            <div key={i} style={{ background: "linear-gradient(145deg,rgba(20,8,45,0.85) 0%,rgba(8,3,20,0.95) 100%)", border: "1px solid rgba(139,92,246,0.12)", borderRadius: "14px", padding: "1.8rem", backdropFilter: "blur(8px)" }}>
              <div style={{ color: "#f59e0b", fontSize: "1.1rem", marginBottom: "1rem" }}>★★★★★</div>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", color: "#d1d5db", fontSize: "1.05rem", lineHeight: 1.72, fontStyle: "italic", marginBottom: "1.2rem" }}>&quot;{t.quote}&quot;</p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#4c1d95)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", flexShrink: 0, color: "white" }}>{t.sign.charAt(0)}</div>
                <div>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.78rem", color: "#e9d5ff", fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "0.8rem", color: "#6b7280", marginTop: "0.1rem" }}>{t.sign}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECOND CURVE DIVIDER ─────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 2, marginTop: "-2px" }}>
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "100px" }}>
          <path d="M0,0 L1440,0 L1440,60 C1200,100 960,20 720,60 C480,100 240,20 0,60 Z" fill="rgba(19,7,38,0.4)" />
          <path d="M0,60 L1440,60 L1440,100 L0,100 Z" fill="rgba(13,4,30,0.4)" />
        </svg>
      </div>

      {/* ── LANDSCAPE FOOTER / CTA ───────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 2, paddingBottom: 0, background: "rgba(13,4,30,0.4)" }}>
        {/* Landscape SVG — full width */}
        <div style={{ position: "relative", width: "100%", height: "480px", overflowX: "hidden" }}>

          {/* Sky gradient behind landscape */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #0d041e 0%, #1a0535 35%, #3b0764 70%, #5b0f8a 100%)" }} />

          {/* Big planet / moon silhouette in bg */}
          <div style={{ position: "absolute", bottom: "120px", right: "8%", width: "220px", height: "220px", background: "radial-gradient(circle at 40% 35%, #2e0e52, #0d041e)", borderRadius: "50%", boxShadow: "0 0 60px rgba(139,92,246,0.15)", opacity: 0.9 }} />

          {/* A tiny spaceship in the sky */}
          <div style={{ position: "absolute", top: "60px", right: "30%", animation: "floatShip 7s ease-in-out infinite" }}>
            <svg width="55" height="20" viewBox="0 0 55 20" fill="none" style={{ filter: "drop-shadow(0 0 5px rgba(245,158,11,0.5))", opacity: 0.8 }}>
              <ellipse cx="27" cy="11" rx="25" ry="6" fill="#1c0a3a" stroke="rgba(245,158,11,0.4)" strokeWidth="0.8" />
              <ellipse cx="27" cy="9" rx="14" ry="9" fill="#2e0e52" />
              <ellipse cx="27" cy="7" rx="7" ry="5" fill="#4c1d95" />
            </svg>
          </div>

          {/* Mountain silhouettes SVG */}
          <svg viewBox="0 0 1440 340" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "340px" }}>
            {/* Far mountains – lighter purple */}
            <path d="M0,340 L0,200 L80,140 L160,200 L240,120 L360,180 L440,100 L560,170 L680,90 L800,160 L900,80 L1020,150 L1140,70 L1260,140 L1380,80 L1440,130 L1440,340 Z" fill="#1a0535" />
            {/* Mid mountains – darker */}
            <path d="M0,340 L0,240 L60,190 L140,260 L220,180 L320,240 L420,160 L500,230 L600,155 L700,230 L800,160 L920,245 L1040,165 L1160,240 L1280,160 L1380,220 L1440,170 L1440,340 Z" fill="#12022e" />
            {/* Close mountains – darkest */}
            <path d="M0,340 L0,280 L100,240 L200,300 L300,230 L400,280 L500,220 L600,275 L720,210 L840,270 L960,215 L1080,270 L1200,220 L1320,270 L1440,230 L1440,340 Z" fill="#08011a" />
            {/* Trees silhouette on left */}
            <g fill="#05010f">
              {[60, 80, 100, 120, 140].map((x, i) => (<polygon key={i} points={`${x},${300 - i * 8} ${x - 12 + i * 2},${310 - i * 4} ${x + 12 - i * 2},${310 - i * 4}`} />))}
              {[180, 200, 220].map((x, i) => (<polygon key={i} points={`${x},${295 - i * 5} ${x - 10},${310} ${x + 10},${310}`} />))}
            </g>
            {/* Trees silhouette on right */}
            <g fill="#05010f">
              {[1300, 1320, 1340, 1360, 1380].map((x, i) => (<polygon key={i} points={`${x},${300 - i * 6} ${x - 10 + i},${310} ${x + 10 - i},${310}`} />))}
            </g>
            {/* Observatory / dome */}
            <ellipse cx="720" cy="282" rx="80" ry="16" fill="#1a0535" />
            <path d="M648,282 A72,56 0 0 1 792,282 Z" fill="#130726" />
            <path d="M660,282 A60,45 0 0 1 780,282 Z" fill="#1e0b3a" stroke="rgba(139,92,246,0.3)" strokeWidth="1" />
            {/* Dome windows glow */}
            {[686, 720, 754].map((x, i) => (
              <ellipse key={i} cx={x} cy={275 - (i === 1 ? 8 : 4)} rx="8" ry="5" fill="rgba(245,158,11,0.25)" stroke="rgba(245,158,11,0.35)" strokeWidth="0.5" style={{ filter: "blur(0.5px)" }} />
            ))}
            {/* Telescope / antenna */}
            <line x1="720" y1="227" x2="720" y2="260" stroke="rgba(139,92,246,0.5)" strokeWidth="2" />
            <line x1="720" y1="227" x2="700" y2="218" stroke="rgba(139,92,246,0.4)" strokeWidth="1.5" />
            {/* Ground */}
            <rect x="0" y="320" width="1440" height="20" fill="#06000f" />
          </svg>

          {/* CTA text and button centred over dome */}
          <div style={{ position: "absolute", top: "2rem", left: 0, right: 0, textAlign: "center", zIndex: 5, padding: "0 1rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.6rem", filter: "drop-shadow(0 0 18px rgba(180,100,255,0.7))", animation: "floatShip 4s ease-in-out infinite" }}>🔮</div>
            <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "clamp(1.4rem,3vw,2rem)", color: "#f5f0ff", fontWeight: 700, marginBottom: "0.6rem" }}>Your Stars Are Aligned</h2>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", color: "#a78bfa", fontSize: "1.05rem", marginBottom: "1.6rem", maxWidth: "460px", margin: "0 auto 1.6rem", lineHeight: 1.6 }}>
              Over 50,000 seekers have found clarity through AstroCall. Your reading awaits.
            </p>
            <Link href="/astrologers" style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", fontFamily: "'Cinzel',serif", fontSize: "0.78rem", letterSpacing: "0.1em", fontWeight: 800, color: "#0a0415", background: "linear-gradient(110deg,#f59e0b,#d97706)", padding: "0.95rem 2.2rem", borderRadius: "10px", textDecoration: "none", boxShadow: "0 4px 28px rgba(245,158,11,0.45)", animation: "pulseBtn 3s ease infinite" }}>
              <Phone size={15} /> BROWSE ASTROLOGERS
            </Link>
          </div>
        </div>

        {/* Minimal footer strip */}
        <div style={{ background: "#06000f", borderTop: "1px solid rgba(139,92,246,0.12)", padding: "1.2rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", color: "#374151", fontSize: "0.85rem", fontStyle: "italic", margin: 0 }}>✦ AstroCall © {new Date().getFullYear()} · Crafted under the cosmic sky ✦</p>
          <div style={{ display: "flex", gap: "2rem" }}>
            {["Astrologers", "Horoscopes", "Privacy", "Terms"].map(l => (
              <Link key={l} href={`/${l.toLowerCase()}`} style={{ fontFamily: "'Cinzel',serif", fontSize: "0.6rem", letterSpacing: "0.15em", color: "#4b5563", textDecoration: "none", transition: "color 0.2s" }}>{l.toUpperCase()}</Link>
            ))}
          </div>
        </div>
      </section>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap');

        @keyframes fadeUp    { from { opacity:0; transform:translateY(26px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn   { from { opacity:0; transform:translateX(28px); } to { opacity:1; transform:translateX(0); } }
        @keyframes spinStar  { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes pulseRing { 0%,100% { opacity:0.3; } 50% { opacity:0.65; } }
        @keyframes floatShip { 0%,100% { transform:translateY(0) rotate(-2deg); } 50% { transform:translateY(-10px) rotate(1deg); } }
        @keyframes pulseBtn  {
          0%,100% { box-shadow: 0 4px 24px rgba(245,158,11,0.40); }
          50%      { box-shadow: 0 4px 40px rgba(245,158,11,0.70), 0 0 0 6px rgba(245,158,11,0.08); }
        }

        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(109,40,217,0.3); border-radius: 2px; }
        button { transition: opacity 0.15s ease, transform 0.15s ease; }
        button:hover { opacity: 0.85; }
        a:hover { filter: brightness(1.12); transform: translateY(-1px); }

        .feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.6), 0 0 30px rgba(139,92,246,0.10);
        }
      `}</style>
    </div>
  );
}