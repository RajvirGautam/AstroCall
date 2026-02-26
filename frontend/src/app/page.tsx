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
  { symbol: "♈", name: "Aries",       dates: "Mar 21 – Apr 19", color: "#ff6b6b", element: "Fire",  ruling: "Mars",    traits: ["Bold", "Passionate", "Driven"] },
  { symbol: "♉", name: "Taurus",      dates: "Apr 20 – May 20", color: "#6ee7b7", element: "Earth", ruling: "Venus",   traits: ["Loyal", "Patient", "Grounded"] },
  { symbol: "♊", name: "Gemini",      dates: "May 21 – Jun 20", color: "#fde68a", element: "Air",   ruling: "Mercury", traits: ["Curious", "Witty", "Adaptable"] },
  { symbol: "♋", name: "Cancer",      dates: "Jun 21 – Jul 22", color: "#c4b5fd", element: "Water", ruling: "Moon",    traits: ["Intuitive", "Caring", "Sensitive"] },
  { symbol: "♌", name: "Leo",         dates: "Jul 23 – Aug 22", color: "#fbbf24", element: "Fire",  ruling: "Sun",     traits: ["Charismatic", "Creative", "Generous"] },
  { symbol: "♍", name: "Virgo",       dates: "Aug 23 – Sep 22", color: "#86efac", element: "Earth", ruling: "Mercury", traits: ["Analytical", "Precise", "Helpful"] },
  { symbol: "♎", name: "Libra",       dates: "Sep 23 – Oct 22", color: "#fb923c", element: "Air",   ruling: "Venus",   traits: ["Balanced", "Charming", "Fair"] },
  { symbol: "♏", name: "Scorpio",     dates: "Oct 23 – Nov 21", color: "#f87171", element: "Water", ruling: "Pluto",   traits: ["Intense", "Mysterious", "Powerful"] },
  { symbol: "♐", name: "Sagittarius", dates: "Nov 22 – Dec 21", color: "#a78bfa", element: "Fire",  ruling: "Jupiter", traits: ["Free", "Optimistic", "Adventurous"] },
  { symbol: "♑", name: "Capricorn",   dates: "Dec 22 – Jan 19", color: "#67e8f9", element: "Earth", ruling: "Saturn",  traits: ["Ambitious", "Disciplined", "Wise"] },
  { symbol: "♒", name: "Aquarius",    dates: "Jan 20 – Feb 18", color: "#818cf8", element: "Air",   ruling: "Uranus",  traits: ["Innovative", "Humanitarian", "Unique"] },
  { symbol: "♓", name: "Pisces",      dates: "Feb 19 – Mar 20", color: "#34d399", element: "Water", ruling: "Neptune", traits: ["Dreamy", "Compassionate", "Artistic"] },
];

const READING_TYPES = [
  { id: "daily",     label: "Today's Reading", icon: "☀️" },
  { id: "love",      label: "Love & Relations", icon: "💕" },
  { id: "career",    label: "Career & Wealth",  icon: "💼" },
  { id: "spiritual", label: "Spiritual Path",   icon: "🔮" },
] as const;

type ReadingTypeId = typeof READING_TYPES[number]["id"];

const LUCKY_LABELS: Record<ReadingTypeId, [string, string, string]> = {
  daily:     ["Lucky Number", "Lucky Color",   "Lucky Time"],
  love:      ["Best Match",   "Love Tip",      "Peak Day"],
  career:    ["Power Number", "Power Day",     "Mantra"],
  spiritual: ["Sacred Crystal","Mantra Word",  "Focus Chakra"],
};

const PROMPTS: Record<ReadingTypeId, (sign: ZodiacSign) => string> = {
  daily: (s) =>
    `You are a wise Vedic astrologer. Give a rich daily horoscope for ${s.name} (${s.dates}). Include: 1) Today's cosmic energy (2 sentences). 2) Key guidance for today (2-3 sentences). 3) A specific opportunity to watch for (1-2 sentences). Then on a new line write exactly: LUCKY: [lucky number 1-99]|[lucky color]|[lucky time of day]. Keep it mystical and specific.`,
  love: (s) =>
    `You are a wise Vedic astrologer. Give a love reading for ${s.name} (${s.dates}). Include: 1) Current love energy (2 sentences). 2) Guidance for singles and couples (2-3 sentences). 3) Best compatible sign right now and why (1-2 sentences). Then on a new line: LUCKY: [best match sign]|[one word love tip]|[peak love day this week].`,
  career: (s) =>
    `You are a wise Vedic astrologer. Give a career and wealth reading for ${s.name} (${s.dates}). Include: 1) Career energy this week (2 sentences). 2) Financial guidance (2-3 sentences). 3) Best professional move right now (1-2 sentences). Then on a new line: LUCKY: [lucky number]|[power day of week]|[2-3 word wealth mantra].`,
  spiritual: (s) =>
    `You are a wise Vedic astrologer. Give a spiritual reading for ${s.name} (${s.dates}). Include: 1) Current soul lesson (2 sentences). 2) Mindfulness focus (2-3 sentences). 3) A cosmic message from the universe (1-2 sentences). Then on a new line: LUCKY: [sacred crystal]|[one word mantra]|[chakra to focus on].`,
};

function StarCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef  = useRef<StarParticle[]>([]);
  const mouseRef  = useRef({ x: -999, y: -999 });
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const resize = () => { cv.width = window.innerWidth; cv.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    starsRef.current = Array.from({ length: 180 }, () => {
      const bx = Math.random() * 100, by = Math.random() * 100;
      return { x: bx, y: by, bx, by, r: 0.4 + Math.random() * 1.4, op: 0.2 + Math.random() * 0.6, speed: 0.5 + Math.random() * 1.5, phase: Math.random() * Math.PI * 2, vx: 0, vy: 0 };
    });
    const onMove = (e: MouseEvent) => { mouseRef.current = { x: (e.clientX / cv.width) * 100, y: (e.clientY / cv.height) * 100 }; };
    window.addEventListener("mousemove", onMove);
    const draw = (ts: number) => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      const mx = mouseRef.current.x, my = mouseRef.current.y;
      starsRef.current.forEach(s => {
        const dx = s.bx - mx, dy = s.by - my, dist = Math.hypot(dx, dy);
        if (dist < 12) { const force = (12 - dist) / 12; s.vx += Math.cos(Math.atan2(dy, dx)) * force * 0.7; s.vy += Math.sin(Math.atan2(dy, dx)) * force * 0.7; }
        s.vx += (s.bx - s.x) * 0.04; s.vy += (s.by - s.y) * 0.04;
        s.vx *= 0.88; s.vy *= 0.88; s.x += s.vx * 0.15; s.y += s.vy * 0.15;
        const op = s.op * (0.55 + 0.45 * Math.sin(ts / 1000 * s.speed + s.phase));
        ctx.beginPath(); ctx.arc((s.x / 100) * cv.width, (s.y / 100) * cv.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${op})`; ctx.fill();
      });
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); window.removeEventListener("mousemove", onMove); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />;
}

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
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.15" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <filter id="wGlow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <circle cx={cx} cy={cy} r={outerR + 55} fill="url(#wBgGlow)" />
        <circle cx={cx} cy={cy} r={outerR + 30} fill="none" stroke="rgba(139,92,246,0.07)" strokeWidth="1" strokeDasharray="2 12" />
        <circle cx={cx} cy={cy} r={outerR + 12} fill="none" stroke="rgba(139,92,246,0.14)" strokeWidth="0.8" />
        <circle cx={cx} cy={cy} r={outerR - 2}  fill="none" stroke="rgba(139,92,246,0.07)" strokeWidth="0.5" />
        <circle cx={cx} cy={cy} r={innerR + 8}  fill="none" stroke="rgba(139,92,246,0.08)" strokeWidth="0.5" strokeDasharray="1 8" />
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
              {isSel && <circle cx={x} cy={y} r={27} fill="none" stroke={z.color} strokeWidth="1" opacity="0.35" style={{ animation: "pulseRing 2s ease infinite" }} />}
              <circle cx={x} cy={y} r={active ? 21 : 17} fill={active ? z.color + "22" : "rgba(10,4,30,0.88)"} stroke={active ? z.color + "cc" : "rgba(109,40,217,0.28)"} strokeWidth={active ? "1.5" : "0.8"} filter={isSel ? "url(#wGlow)" : "none"} style={{ transition: "all 0.2s ease" }} />
              <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fontSize={active ? "20" : "16"} fontFamily="serif" fill={active ? z.color : "#a78bfa"} style={{ pointerEvents: "none", transition: "all 0.2s ease", filter: active ? `drop-shadow(0 0 6px ${z.color})` : "none" }}>{z.symbol}</text>
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

function ReadingPanel({ sign, onClose }: { sign: ZodiacSign; onClose: () => void }) {
  const [activeType, setActiveType] = useState<ReadingTypeId>("daily");
  const [reading,    setReading]    = useState("");
  const [loading,    setLoading]    = useState(false);
  const [luckyInfo,  setLuckyInfo]  = useState<string[]>([]);

  const fetchReading = useCallback(async (type: ReadingTypeId) => {
    setLoading(true); setReading(""); setLuckyInfo([]);
    try {
      // ✅ FIXED: calls our own API route, not Anthropic directly
      const res = await fetch("/api/horoscope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signName: sign.name, readingType: type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      const text = (data.text as string) ?? "";
      const match = text.match(/LUCKY:\s*(.+)/);
      if (match) setLuckyInfo(match[1].split("|").map((s: string) => s.trim()));
      console.log("TEXT:", text);
      setReading(text.replace(/LUCKY:.*$/m, "").trim());
    } catch {
      setReading("The stars are momentarily veiled… Please try again.");
    }
    setLoading(false);
  }, [sign]);

  useEffect(() => { fetchReading(activeType); }, [sign.name, activeType]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "linear-gradient(160deg, rgba(20,8,50,0.97) 0%, rgba(8,2,22,0.99) 100%)", borderLeft: `1px solid ${sign.color}20`, animation: "slideIn 0.35s cubic-bezier(0.16,1,0.3,1) both" }}>
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
            <span style={{ fontSize: "0.82rem" }}>{rt.icon}</span> {rt.label}
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

export default function HomePage() {
  const [rotation,    setRotation]    = useState(0);
  const [hoveredIdx,  setHoveredIdx]  = useState<number | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isPaused,    setIsPaused]    = useState(false);
  const rotRef  = useRef(0);
  const rafRef  = useRef<number>(0);
  const lastRef = useRef<number | null>(null);

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

  const handleSelect = (idx: number) => { setSelectedIdx(prev => prev === idx ? null : idx); setIsPaused(true); };
  const handleClose  = () => { setSelectedIdx(null); setIsPaused(false); };

  return (
    <div style={{ minHeight: "100vh", background: "#05020e", overflowX: "hidden" }}>
      <StarCanvas />
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 55% 45% at 15% 55%,rgba(60,0,120,0.12) 0%,transparent 100%),radial-gradient(ellipse 45% 40% at 85% 15%,rgba(20,0,80,0.10) 0%,transparent 100%)" }} />
      <div style={{ position: "relative", zIndex: 10 }}><Navbar /></div>

      <section style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", alignItems: "center", padding: "6rem 2rem 4rem" }}>
        <div style={{ maxWidth: 1180, width: "100%", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center", marginBottom: "3rem" }}>
            <div style={{ animation: "fadeUp 0.9s ease both" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", background: "rgba(139,92,246,0.10)", border: "1px solid rgba(139,92,246,0.28)", borderRadius: "100px", padding: "0.4rem 1.1rem", marginBottom: "2rem" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 8px #f59e0b88", display: "inline-block" }} />
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.65rem", letterSpacing: "0.3em", color: "#d4a855", fontWeight: 600 }}>LIVE VEDIC CONSULTATIONS</span>
              </div>
              <h1 style={{ fontFamily: "'Cinzel',serif", fontWeight: 900, lineHeight: 1.05, marginBottom: "1.6rem" }}>
                <span style={{ display: "block", fontSize: "clamp(2.8rem,5.5vw,5.2rem)", color: "#f5f0ff", letterSpacing: "-0.01em" }}>THE COSMOS</span>
                <span style={{ display: "block", fontSize: "clamp(2.8rem,5.5vw,5.2rem)", letterSpacing: "-0.01em", background: "linear-gradient(110deg,#c084fc 0%,#7c3aed 45%,#f59e0b 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AWAITS YOU</span>
              </h1>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem", color: "#a78bfa", lineHeight: 1.75, marginBottom: "2rem", maxWidth: 460, fontStyle: "italic" }}>
                Connect face-to-face with certified Vedic masters — or explore your cosmic blueprint right now with our AI reading.
              </p>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "3rem" }}>
                <Link href="/astrologers" style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", fontFamily: "'Cinzel',serif", fontSize: "0.75rem", letterSpacing: "0.12em", fontWeight: 800, color: "#0a0415", background: "linear-gradient(110deg,#f59e0b,#d97706)", padding: "0.95rem 2rem", borderRadius: "10px", textDecoration: "none", boxShadow: "0 4px 24px rgba(245,158,11,0.40)" }}>
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
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: "fadeUp 0.9s ease 0.2s both" }}>
              <ZodiacWheel rotation={rotation} selectedIdx={selectedIdx} hoveredIdx={hoveredIdx} onSelect={handleSelect} onHover={setHoveredIdx} />
            </div>
          </div>

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
                  <span style={{ fontSize: "0.8rem" }}>{z.symbol}</span> {z.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section style={{ position: "relative", zIndex: 1, padding: "7rem 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.65rem", letterSpacing: "0.4em", color: "#f59e0b", marginBottom: "0.8rem", fontWeight: 600 }}>✦ WHY ASTROCALL ✦</div>
            <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "2.25rem", fontWeight: 700, color: "#f5f0ff", marginBottom: "1rem" }}>Written in the <span style={{ background: "linear-gradient(110deg,#c084fc,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Stars</span></h2>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.1rem", color: "#9ca3af", maxWidth: 500, margin: "0 auto", fontStyle: "italic", lineHeight: 1.7 }}>India's most trusted platform for live Vedic astrology consultations</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "1.5rem" }}>
            {[
              { icon: <Award  size={26} color="#f59e0b" />, title: "Certified Vedic Masters",  desc: "Every astrologer is rigorously verified with years of Vedic study and practical experience. No shortcuts — only genuine expertise.", accent: "#f59e0b" },
              { icon: <Video  size={26} color="#818cf8" />, title: "HD Video Consultations",   desc: "Crystal-clear, private video sessions powered by enterprise-grade streaming. See their face, feel the connection in real time.", accent: "#818cf8" },
              { icon: <Zap    size={26} color="#34d399" />, title: "Instant Availability",      desc: "See who's online right now and connect immediately. No waiting lists. Ancient wisdom on modern time.", accent: "#34d399" },
              { icon: <Shield size={26} color="#f87171" />, title: "100% Confidential",         desc: "Your readings, your privacy. All sessions are encrypted and never stored. What the stars reveal stays between you and your astrologer.", accent: "#f87171" },
              { icon: <Users  size={26} color="#a78bfa" />, title: "500+ Specialists",          desc: "Vedic, Nadi, KP, Lal Kitab — find a specialist for every system. Browse by expertise, language, and availability.", accent: "#a78bfa" },
              { icon: <Star   size={26} color="#fbbf24" />, title: "4.9★ Rated Platform",       desc: "Over 50,000 sessions completed with verified reviews from clients who found clarity, direction, and peace.", accent: "#fbbf24" },
            ].map((f, i) => (
              <div key={i} style={{ background: "linear-gradient(145deg,rgba(20,8,45,0.92) 0%,rgba(8,3,20,0.97) 100%)", border: "1px solid rgba(139,92,246,0.14)", borderRadius: "16px", padding: "2.2rem 2rem", backdropFilter: "blur(12px)", boxShadow: "0 4px 30px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.03)", transition: "all 0.25s" }}>
                <div style={{ marginBottom: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center", width: 50, height: 50, borderRadius: "12px", background: `${f.accent}14`, border: `1px solid ${f.accent}22` }}>{f.icon}</div>
                <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: "0.9rem", color: "#e9d5ff", marginBottom: "0.75rem", letterSpacing: "0.05em", fontWeight: 700 }}>{f.title}</h3>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", color: "#9ca3af", lineHeight: 1.75, fontSize: "1.05rem" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ position: "relative", zIndex: 1, padding: "0 2rem 7rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "1.25rem" }}>
          {[
            { quote: "The reading was incredibly accurate. My astrologer explained my birth chart in a way no one ever had before.", name: "Priya S.",  sign: "♋ Cancer" },
            { quote: "I was skeptical at first, but after my session I felt completely at peace. Highly recommend to anyone seeking guidance.", name: "Rahul M.", sign: "♈ Aries" },
            { quote: "Professional, insightful, and deeply knowledgeable. This platform has the best Vedic astrologers I've ever consulted.", name: "Anjali K.", sign: "♍ Virgo" },
          ].map((t, i) => (
            <div key={i} style={{ background: "linear-gradient(145deg,rgba(20,8,45,0.85) 0%,rgba(8,3,20,0.95) 100%)", border: "1px solid rgba(139,92,246,0.12)", borderRadius: "14px", padding: "1.8rem", backdropFilter: "blur(8px)" }}>
              <div style={{ color: "#f59e0b", fontSize: "1.1rem", marginBottom: "1rem" }}>★★★★★</div>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", color: "#d1d5db", fontSize: "1.05rem", lineHeight: 1.72, fontStyle: "italic", marginBottom: "1.2rem" }}>"{t.quote}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#4c1d95)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", flexShrink: 0 }}>{t.sign.charAt(0)}</div>
                <div>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.78rem", color: "#e9d5ff", fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "0.8rem", color: "#6b7280", marginTop: "0.1rem" }}>{t.sign}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ position: "relative", zIndex: 1, padding: "2rem 2rem 8rem", textAlign: "center" }}>
        <div style={{ maxWidth: 580, margin: "0 auto", background: "linear-gradient(145deg,rgba(30,10,70,0.85) 0%,rgba(10,3,25,0.97) 100%)", border: "1px solid rgba(139,92,246,0.22)", borderRadius: "22px", padding: "4rem 2.5rem", backdropFilter: "blur(24px)", boxShadow: "0 0 60px rgba(109,40,217,0.14),0 8px 50px rgba(0,0,0,0.7),inset 0 1px 0 rgba(255,255,255,0.04)" }}>
          <div style={{ fontSize: "2.8rem", marginBottom: "1.2rem", filter: "drop-shadow(0 0 20px rgba(180,100,255,0.6))" }}>🔮</div>
          <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "1.9rem", color: "#f5f0ff", marginBottom: "0.8rem", fontWeight: 700 }}>Your Stars Are Aligned</h2>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", color: "#9ca3af", fontSize: "1.1rem", marginBottom: "2.2rem", lineHeight: 1.75 }}>Over 50,000 seekers have found clarity, direction, and purpose through AstroCall. Your personalized reading awaits.</p>
          <Link href="/astrologers" style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", fontFamily: "'Cinzel',serif", fontSize: "0.78rem", letterSpacing: "0.1em", fontWeight: 800, color: "#0a0415", background: "linear-gradient(110deg,#f59e0b,#d97706)", padding: "1rem 2.5rem", borderRadius: "10px", textDecoration: "none", boxShadow: "0 4px 28px rgba(245,158,11,0.40)" }}>
            <Phone size={15} /> BROWSE ASTROLOGERS
          </Link>
        </div>
      </section>

      <footer style={{ position: "relative", zIndex: 1, padding: "1.5rem 2rem", textAlign: "center", borderTop: "1px solid rgba(139,92,246,0.10)" }}>
        <p style={{ fontFamily: "'Cormorant Garamond',serif", color: "#374151", fontSize: "0.9rem", fontStyle: "italic" }}>✦ AstroCall © {new Date().getFullYear()} · Crafted under the cosmic sky ✦</p>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
        @keyframes fadeUp    { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn   { from { opacity:0; transform:translateX(28px); } to { opacity:1; transform:translateX(0); } }
        @keyframes spinStar  { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes pulseRing { 0%,100% { opacity:0.3; } 50% { opacity:0.65; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(109,40,217,0.3); border-radius: 2px; }
        button { transition: opacity 0.15s ease, transform 0.15s ease; }
        button:hover { opacity: 0.85; }
        a:hover { filter: brightness(1.1); transform: translateY(-1px); }
      `}</style>
    </div>
  );
}