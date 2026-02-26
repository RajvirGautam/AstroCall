"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Star } from "lucide-react";
import { UserRole } from "@/types";

export default function RegisterPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setError("");
    setLoading(true);
    try {
      await signUp(email, password, name, role);
      router.push(role === "astrologer" ? "/dashboard/astrologer" : "/astrologers");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative z-content">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 rounded-full border border-cosmic-700 flex items-center justify-center animate-pulse-glow">
              <Star className="w-8 h-8 text-gold-400" fill="currentColor" />
            </div>
          </div>
          <h1 className="font-display text-3xl text-gradient">Begin Your Journey</h1>
          <p className="font-body text-purple-400 italic mt-1">Your cosmic path awaits</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-lg p-3 mb-4 text-sm font-body">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-body text-purple-300 text-sm mb-1">Full Name</label>
              <input className="input-field" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block font-body text-purple-300 text-sm mb-1">Email</label>
              <input type="email" className="input-field" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block font-body text-purple-300 text-sm mb-1">Password</label>
              <input type="password" className="input-field" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            <div>
              <label className="block font-body text-purple-300 text-sm mb-2">I am a…</label>
              <div className="grid grid-cols-2 gap-3">
                {(["user", "astrologer"] as UserRole[]).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-3 px-4 rounded-lg border font-display text-sm tracking-wide transition-all ${
                      role === r
                        ? "border-cosmic-500 bg-cosmic-900/50 text-cosmic-300"
                        : "border-mystic-border text-purple-500 hover:border-cosmic-700"
                    }`}
                  >
                    {r === "user" ? "🌟 Seeker" : "🔮 Astrologer"}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-gold w-full py-3 mt-2" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-center font-body text-purple-400 mt-4 text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-cosmic-400 hover:text-cosmic-300 underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
