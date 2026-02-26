"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff } from "lucide-react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Cinzel:wght@400;500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.lp-root{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;background:#06030f;overflow:hidden}
@media(max-width:768px){.lp-root{grid-template-columns:1fr}.lp-left{display:none!important}}

/* LEFT — content shifted upward */
.lp-left{
  position:relative;
  display:flex;
  flex-direction:column;
  justify-content:flex-start;        /* ← was center, now starts from top */
  align-items:center;
  padding:3rem 3rem 4rem;            /* ← less top padding = content moves up */
  padding-top:5rem;                  /* controlled top space */
  overflow:hidden;
  background:linear-gradient(160deg,#0d0520 0%,#06030f 60%)
}
.lp-left::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 70% 60% at 30% 40%,rgba(120,50,200,.18) 0%,transparent 65%),radial-gradient(ellipse 50% 40% at 70% 80%,rgba(200,130,30,.10) 0%,transparent 60%);pointer-events:none}
.lp-mandala{position:absolute;width:520px;height:520px;top:50%;left:50%;transform:translate(-50%,-50%);opacity:.06;animation:lpSpin 80s linear infinite}
@keyframes lpSpin{to{transform:translate(-50%,-50%) rotate(360deg)}}
.lp-lcontent{position:relative;z-index:2;text-align:center;max-width:380px}
.lp-emblem{width:88px;height:88px;margin:0 auto 2rem;border-radius:50%;border:1px solid rgba(210,170,70,.35);background:radial-gradient(circle at 38% 35%,rgba(210,170,70,.12),rgba(80,20,140,.18));display:flex;align-items:center;justify-content:center;font-size:2.4rem;animation:lpGlow 4s ease infinite}
@keyframes lpGlow{0%,100%{box-shadow:0 0 40px rgba(210,170,70,.12),0 0 80px rgba(100,40,180,.10)}50%{box-shadow:0 0 60px rgba(210,170,70,.22),0 0 120px rgba(100,40,180,.16)}}

/* TAG — was #c9a84c, kept same (already decent) but bumped font-size slightly */
.lp-tag{
  font-family:'Cinzel',serif;
  font-size:.65rem;                  /* ← was .6rem */
  letter-spacing:.32em;
  color:#d4a84b;                     /* ← brighter gold */
  margin-bottom:1.2rem;
  font-weight:600;                   /* ← was 500 */
}

.lp-h2{font-family:'Cormorant Garamond',serif;font-size:2.8rem;font-weight:300;color:#f0e8d0;line-height:1.15;margin-bottom:1.4rem}
.lp-h2 em{font-style:italic;color:#d4a84b}

/* DESC — was rgba(180,165,140,.75), made brighter */
.lp-desc{
  font-family:'EB Garamond',serif;
  font-size:1.08rem;                 /* ← slightly larger */
  color:rgba(210,195,165,.88);       /* ← was .75 opacity, now .88 + brighter base */
  line-height:1.85;
  font-style:italic;
  margin-bottom:2.5rem;
}

.lp-div{display:flex;align-items:center;gap:1rem;margin-bottom:2rem}
.lp-div span{flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(210,170,70,.25),transparent)}
.lp-div em{font-family:serif;color:#c9a84c;font-size:1rem}
.lp-pills{display:flex;flex-direction:column;gap:.6rem;text-align:left}
.lp-pill{display:flex;align-items:center;gap:.75rem;background:rgba(255,255,255,.03);border:1px solid rgba(210,170,70,.15);border-radius:8px;padding:.65rem 1rem}
.lp-pill-i{font-size:1rem;flex-shrink:0}

/* PILL TEXT — was rgba(200,185,155,.75), boosted visibility */
.lp-pill-t{
  font-family:'EB Garamond',serif;
  font-size:.96rem;                  /* ← was .92rem */
  color:rgba(215,200,170,.88);       /* ← was .75 opacity */
  line-height:1.4;
}

/* PILL STRONG (title inside pill) — was #d4c49a, made brighter + slightly bigger */
.lp-pill-t strong{
  color:#e8d4a0;                     /* ← brighter cream-gold */
  font-weight:600;
  display:block;
  font-size:.8rem;                   /* ← was .78rem */
  font-family:'Cinzel',serif;
  letter-spacing:.06em;              /* ← was .04em */
  margin-bottom:.1rem;
}

/* RIGHT */
.lp-right{display:flex;flex-direction:column;justify-content:center;align-items:center;padding:3rem 2rem;background:linear-gradient(180deg,#08041a 0%,#050210 100%);position:relative}
.lp-right::before{content:'';position:absolute;top:0;left:0;width:1px;height:100%;background:linear-gradient(180deg,transparent,rgba(210,170,70,.15),transparent)}
.lp-right::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 50% at 60% 40%,rgba(90,20,160,.08) 0%,transparent 65%);pointer-events:none}
.lp-form{position:relative;z-index:2;width:100%;max-width:400px}
.lp-top{text-align:center;margin-bottom:2.5rem}
.lp-logo{display:inline-flex;align-items:center;gap:.6rem;margin-bottom:2rem;text-decoration:none}

/* STAR — golden yellow filled star */
.lp-logo-star{
  font-size:1.5rem;
  color:#f5c518;
  filter:drop-shadow(0 0 8px rgba(245,197,24,.90)) drop-shadow(0 0 18px rgba(245,180,0,.50));
  line-height:1;
}

/* ASTROCALL — two color logo */
.lp-logo-name{
  font-family:'Cinzel',serif;
  font-size:1.1rem;
  font-weight:400;
  letter-spacing:.32em;
  line-height:1;
}
.lp-logo-astro{
  color:#a78bfa;                      /* purple/lavender */
  text-shadow:0 0 20px rgba(167,139,250,.35);
}
.lp-logo-call{
  color:#d4a84b;                      /* gold */
  text-shadow:0 0 20px rgba(212,168,75,.35);
}
.lp-welcome{font-family:'Cormorant Garamond',serif;font-size:2.2rem;font-weight:300;color:#f0e8d0;margin-bottom:.4rem}

/* SUB TAGLINE — was .7 opacity, made more visible */
.lp-sub{
  font-family:'EB Garamond',serif;
  font-size:1.05rem;                 /* ← was 1rem */
  color:rgba(185,168,132,.82);       /* ← was .7 opacity */
  font-style:italic;
}

.lp-card{background:linear-gradient(160deg,rgba(20,10,45,.8),rgba(8,4,20,.95));border:1px solid rgba(210,170,70,.14);border-radius:16px;padding:2.5rem 2.2rem;backdrop-filter:blur(20px);box-shadow:0 0 0 1px rgba(255,255,255,.02),0 20px 60px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.03)}
.lp-fg{margin-bottom:1.4rem}

/* LABEL — was .7 opacity, made crisper */
.lp-label{
  display:block;
  font-family:'Cinzel',serif;
  font-size:.62rem;                  /* ← was .6rem */
  letter-spacing:.16em;
  color:rgba(200,178,122,.82);       /* ← brighter gold tone */
  margin-bottom:.55rem;
  font-weight:600;                   /* ← was 500 */
}

.lp-fw{position:relative}
.lp-input{width:100%;padding:.85rem 1rem;background:rgba(10,5,25,.7);border:1px solid rgba(120,80,200,.18);border-radius:8px;color:#e8dfc8;font-family:'EB Garamond',serif;font-size:1.05rem;outline:none;transition:border-color .2s,box-shadow .2s}
.lp-input::placeholder{color:rgba(120,100,75,.55);font-style:italic}  /* ← slightly more visible placeholder */
.lp-input:focus{border-color:rgba(210,170,70,.38);box-shadow:0 0 0 3px rgba(210,170,70,.06)}
.lp-input.pr{padding-right:2.8rem}
.lp-eye{position:absolute;right:.85rem;top:50%;transform:translateY(-50%);background:none;border:none;color:rgba(140,120,80,.5);cursor:pointer;padding:.2rem;display:flex;transition:color .2s}
.lp-eye:hover{color:rgba(210,170,70,.7)}
.lp-err{background:rgba(180,30,30,.12);border:1px solid rgba(200,60,60,.25);border-radius:8px;padding:.7rem 1rem;margin-bottom:1.2rem;font-family:'EB Garamond',serif;font-size:.95rem;color:#e8a0a0;display:flex;align-items:center;gap:.5rem}
.lp-btn{width:100%;padding:.95rem;border:none;border-radius:8px;background:linear-gradient(110deg,#c9922a,#e8b84b,#c9922a);background-size:200% 100%;color:#1a0e00;font-family:'Cinzel',serif;font-size:.72rem;font-weight:700;letter-spacing:.2em;cursor:pointer;transition:background-position .4s,transform .15s,box-shadow .2s;box-shadow:0 4px 20px rgba(200,145,40,.30);margin-top:.5rem}
.lp-btn:hover:not(:disabled){background-position:100% 0;box-shadow:0 6px 30px rgba(200,145,40,.45);transform:translateY(-1px)}
.lp-btn:disabled{opacity:.6;cursor:not-allowed;transform:none}
.lp-divider{display:flex;align-items:center;gap:.9rem;margin:1.5rem 0}
.lp-divider span{flex:1;height:1px;background:rgba(120,80,200,.14)}

/* DIVIDER TEXT */
.lp-divider em{
  font-family:'EB Garamond',serif;
  font-size:.86rem;                  /* ← was .82rem */
  color:rgba(165,140,100,.65);       /* ← was .5 opacity */
  font-style:normal;
}

.lp-demo{background:rgba(8,4,18,.5);border:1px solid rgba(210,170,70,.09);border-radius:10px;padding:1.1rem 1.3rem}

/* DEMO TITLE */
.lp-demo-t{
  font-family:'Cinzel',serif;
  font-size:.6rem;                   /* ← was .58rem */
  letter-spacing:.2em;
  color:#d4a84b;                     /* ← was #c9a84c, slightly brighter */
  margin-bottom:.8rem;
  font-weight:600;
}

.lp-demo-row{display:flex;align-items:center;justify-content:space-between;padding:.45rem 0;border-bottom:1px solid rgba(120,80,200,.07);cursor:pointer;transition:opacity .15s}
.lp-demo-row:hover{opacity:.75}
.lp-demo-row:last-child{border-bottom:none}

/* DEMO ROLE */
.lp-demo-role{
  display:flex;
  align-items:center;
  gap:.5rem;
  font-family:'Cinzel',serif;
  font-size:.62rem;                  /* ← was .6rem */
  letter-spacing:.06em;
  color:rgba(200,175,115,.78);       /* ← was .65 opacity */
}

/* DEMO CREDENTIALS */
.lp-demo-cred{
  font-family:'EB Garamond',serif;
  font-size:.88rem;                  /* ← was .82rem */
  color:rgba(180,162,128,.68);       /* ← was .55 opacity */
  font-style:italic;
}

/* FOOTER */
.lp-footer{
  text-align:center;
  margin-top:1.8rem;
  font-family:'EB Garamond',serif;
  font-size:1rem;                    /* ← was .95rem */
  color:rgba(160,142,105,.75);       /* ← was .6 opacity */
}
.lp-footer a{color:#d4a84b;text-decoration:none;transition:opacity .2s}   /* ← brighter gold link */
.lp-footer a:hover{opacity:.8;text-decoration:underline}

/* ORNAMENT */
.lp-ornament{
  text-align:center;
  margin-top:1.2rem;
  font-family:'Cormorant Garamond',serif;
  font-size:.74rem;                  /* ← was .72rem */
  color:rgba(150,128,85,.42);        /* ← was .3 opacity, now more readable */
  letter-spacing:.14em;
}
`;

export default function LoginPage() {
  const { signIn, profile } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* ── inject CSS client-side to avoid hydration mismatch ── */
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "lp-styles";
    el.textContent = CSS;
    if (!document.getElementById("lp-styles")) document.head.appendChild(el);
    return () => { document.getElementById("lp-styles")?.remove(); };
  }, []);

  /* ── redirect after profile loads ── */
  useEffect(() => {
    if (profile) {
      router.push(profile.role === "astrologer" ? "/dashboard/astrologer" : "/dashboard/user");
    }
  }, [profile]);

  /* ── star canvas ── */
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const resize = () => { cv.width = window.innerWidth; cv.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * cv.width,
      y: Math.random() * cv.height,
      r: 0.3 + Math.random() * 1.1,
      op: 0.15 + Math.random() * 0.5,
      speed: 0.4 + Math.random() * 1.2,
      phase: Math.random() * Math.PI * 2,
    }));
    let raf: number;
    const draw = (ts: number) => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      stars.forEach(s => {
        const o = s.op * (0.5 + 0.5 * Math.sin(ts / 1000 * s.speed + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,245,210,${o})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />

      <div className="lp-root">

        {/* ══ LEFT ══ */}
        <div className="lp-left">
          <svg className="lp-mandala" viewBox="0 0 400 400" fill="none">
            <circle cx="200" cy="200" r="190" stroke="white" strokeWidth="0.5" />
            <circle cx="200" cy="200" r="150" stroke="white" strokeWidth="0.5" />
            <circle cx="200" cy="200" r="110" stroke="white" strokeWidth="0.5" />
            <circle cx="200" cy="200" r="70" stroke="white" strokeWidth="0.5" />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => {
              const r = (a * Math.PI) / 180;
              return <line key={a}
                x1={200 + 70 * Math.cos(r)} y1={200 + 70 * Math.sin(r)}
                x2={200 + 190 * Math.cos(r)} y2={200 + 190 * Math.sin(r)}
                stroke="white" strokeWidth="0.4" />;
            })}
          </svg>

          <div className="lp-lcontent">
            <div className="lp-emblem">✦</div>
            <p className="lp-tag">✦ EST. 2024 &nbsp;·&nbsp; VEDIC MASTERS ✦</p>
            <h2 className="lp-h2">
              Seek Wisdom<br />from the <em>Cosmos</em>
            </h2>
            <p className="lp-desc">
              Connect face-to-face with India&apos;s most trusted certified Vedic astrologers.
              Real-time consultations, ancient wisdom.
            </p>
            <div className="lp-div"><span /><em>✦</em><span /></div>
            <div className="lp-pills">
              {[
                { i: "🛡️", t: "VERIFIED EXPERTS", d: "Background-checked & certified Vedic masters" },
                { i: "🔒", t: "100% CONFIDENTIAL", d: "All sessions encrypted. Your secrets stay sacred." },
                { i: "⭐", t: "4.9★ RATED PLATFORM", d: "Over 50,000 consultations completed" },
              ].map((p, idx) => (
                <div className="lp-pill" key={idx}>
                  <span className="lp-pill-i">{p.i}</span>
                  <div className="lp-pill-t"><strong>{p.t}</strong>{p.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ RIGHT ══ */}
        <div className="lp-right">
          <div className="lp-form">
            <div className="lp-top">
              <a href="/" className="lp-logo">
                <span className="lp-logo-star">★</span>
                <span className="lp-logo-name">
                  <span className="lp-logo-astro">Astro</span><span className="lp-logo-call">Call</span>
                </span>
              </a>
              <h1 className="lp-welcome">Welcome Back</h1>
              <p className="lp-sub">The stars have been waiting for you</p>
            </div>

            <div className="lp-card">
              {error && <div className="lp-err"><span>⚠</span>{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="lp-fg">
                  <label className="lp-label" htmlFor="lp-email">EMAIL ADDRESS</label>
                  <div className="lp-fw">
                    <input id="lp-email" type="email" className="lp-input"
                      placeholder="your@email.com" value={email}
                      onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                  </div>
                </div>

                <div className="lp-fg">
                  <label className="lp-label" htmlFor="lp-pw">PASSWORD</label>
                  <div className="lp-fw">
                    <input id="lp-pw" type={showPw ? "text" : "password"} className="lp-input pr"
                      placeholder="Enter your password" value={password}
                      onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
                    <button type="button" className="lp-eye" onClick={() => setShowPw(!showPw)}>
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="lp-btn" disabled={loading}>
                  {loading ? "CONSULTING THE STARS…" : "SIGN IN TO ASTROCALL"}
                </button>
              </form>

              <div className="lp-divider"><span /><em>demo accounts</em><span /></div>

              <div className="lp-demo">
                <p className="lp-demo-t">✦ QUICK ACCESS — click to autofill</p>
                {[
                  { i: "👤", r: "USER", e: "user@demo.com", p: "demo1234" },
                  { i: "🔮", r: "ASTROLOGER", e: "astro@demo.com", p: "demo1234" },
                  { i: "⚙️", r: "ADMIN", e: "admin@demo.com", p: "demo1234" },
                ].map((d, idx) => (
                  <div className="lp-demo-row" key={idx}
                    onClick={() => { setEmail(d.e); setPassword(d.p); }}>
                    <span className="lp-demo-role">{d.i} {d.r}</span>
                    <span className="lp-demo-cred">{d.e}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="lp-footer">
              New seeker?{" "}
              <Link href="/auth/register">Begin your journey →</Link>
            </p>
            <p className="lp-ornament">✦ &nbsp; ASTROCALL · ANCIENT WISDOM, MODERN PLATFORM &nbsp; ✦</p>
          </div>
        </div>

      </div>
    </>
  );
}