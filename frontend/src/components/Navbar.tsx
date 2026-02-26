"use client";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Star, Menu, X, LogOut, LayoutDashboard, Users } from "lucide-react";

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const dashLink =
    profile?.role === "astrologer" ? "/dashboard/astrologer" :
    profile?.role === "admin" ? "/admin" : "/dashboard/user";

  return (
    <nav className="relative z-content glass border-b border-mystic-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Star className="w-7 h-7 text-gold-400 animate-float" fill="currentColor" />
            <div className="absolute inset-0 blur-md bg-gold-400 opacity-30 animate-pulse-glow rounded-full" />
          </div>
          <span className="font-display text-xl tracking-widest text-gradient">AstroCall</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/astrologers" className="font-body text-purple-300 hover:text-white transition-colors text-sm tracking-wide">
            Find Astrologers
          </Link>
          {user ? (
            <>
              <Link href={dashLink} className="font-body text-purple-300 hover:text-white transition-colors text-sm tracking-wide flex items-center gap-1">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              {profile?.role === "admin" && (
                <Link href="/admin" className="font-body text-purple-300 hover:text-white transition-colors text-sm tracking-wide flex items-center gap-1">
                  <Users className="w-4 h-4" /> Admin
                </Link>
              )}
              <div className="flex items-center gap-3">
                <img
                  src={profile?.photoURL || `https://api.dicebear.com/7.x/personas/svg?seed=${user.uid}`}
                  className="w-8 h-8 rounded-full border border-cosmic-700 object-cover"
                  alt="avatar"
                />
                <span className="text-sm text-purple-200 font-body">{profile?.displayName?.split(" ")[0]}</span>
                <button onClick={logout} className="text-purple-400 hover:text-red-400 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-3">
              <Link href="/auth/login" className="btn-primary text-sm">Sign In</Link>
              <Link href="/auth/register" className="btn-gold text-sm">Join Free</Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-purple-300" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden glass border-t border-mystic-border px-4 py-4 flex flex-col gap-4 animate-slide-up">
          <Link href="/astrologers" className="text-purple-300" onClick={() => setOpen(false)}>Find Astrologers</Link>
          {user ? (
            <>
              <Link href={dashLink} className="text-purple-300" onClick={() => setOpen(false)}>Dashboard</Link>
              <button onClick={() => { logout(); setOpen(false); }} className="text-left text-red-400">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn-primary text-center" onClick={() => setOpen(false)}>Sign In</Link>
              <Link href="/auth/register" className="btn-gold text-center" onClick={() => setOpen(false)}>Join Free</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
