"use client";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import { Star, Menu, X, LogOut, LayoutDashboard, Users, ChevronDown } from "lucide-react";

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const dashLink =
    profile?.role === "astrologer" ? "/dashboard/astrologer" :
      profile?.role === "admin" ? "/admin" : "/dashboard/user";

  const getDisplayName = () => {
    if (!profile) return "User";
    const rawName = profile.displayName || profile.email?.split("@")[0];
    return rawName ? rawName.split(" ")[0] : "User";
  };

  const getInitials = () => {
    if (!profile) return "U";
    const rawName = profile.displayName || profile.email;
    return rawName ? rawName.charAt(0).toUpperCase() : "U";
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dynamic Scroll Shape/Position
  useEffect(() => {
    const handleUpdate = () => {
      if (!navRef.current) return;

      const scrollY = window.scrollY;
      const maxScroll = 200;
      let ratio = scrollY / maxScroll;
      if (ratio > 1) ratio = 1;
      if (ratio < 0) ratio = 0;

      const isMobile = window.innerWidth < 768;

      const startWidth = isMobile ? 95 : 60;
      const endWidth = 100;
      const currentWidth = startWidth + ((endWidth - startWidth) * ratio);

      const startOffset = 72;
      const currentOffset = startOffset * (1 - ratio);
      const currentLeft = `calc(50% - ${currentOffset}px)`;

      const currentTop = 65 - (65 * ratio);
      const currentRadius = 65 - (65 * ratio);

      const el = navRef.current;
      el.style.width = `${currentWidth}%`;
      el.style.top = `${currentTop}px`;
      el.style.borderTopLeftRadius = `${currentRadius}px`;
      el.style.borderTopRightRadius = `${currentRadius}px`;
      el.style.borderBottomLeftRadius = `${currentRadius}px`;
      el.style.borderBottomRightRadius = `${currentRadius}px`;
    };

    window.addEventListener("scroll", handleUpdate, { passive: true });
    window.addEventListener("resize", handleUpdate);
    handleUpdate();

    return () => {
      window.removeEventListener("scroll", handleUpdate);
      window.removeEventListener("resize", handleUpdate);
    };
  }, []);

  return (
    <nav
      ref={navRef}
      className={`
        fixed z-50 left-1/2 -translate-x-1/2 top-6
        flex items-center justify-between px-6 py-3
        rounded-full
        bg-white/5 dark:bg-[#0a0415]/60
        backdrop-blur-xl
        border border-white/10 dark:border-white/10
        shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(139,92,246,0.15)]
        transition-[background-color,border-color,box-shadow,color] duration-200 ease-out
        hover:bg-white/10 dark:hover:bg-[#0a0415]/80
        hover:shadow-[0_20px_50px_rgba(109,40,217,0.15),inset_0_1px_0_0_rgba(167,139,250,0.25)]
      `}
    >
      {/* Logo Section */}
      <Link href="/" className="flex items-center gap-2 flex-shrink-0 pl-2">
        <div className="w-9 h-9 bg-gradient-to-tr from-[#6d28d9] to-[#c084fc] rounded-xl flex items-center justify-center shadow-lg shadow-[#7c3aed]/20 text-white">
          <Star size={18} fill="currentColor" />
        </div>
        <span className="text-xl font-black text-white tracking-widest hidden sm:inline" style={{ fontFamily: "'Cinzel',serif" }}>
          ASTROCALL
        </span>
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-200">
        <Link href="/astrologers" className="font-body text-[#c4b5fd] hover:text-white transition-colors tracking-wide uppercase text-xs" style={{ fontFamily: "'Cinzel',serif", letterSpacing: "2px" }}>
          Astrologers
        </Link>
        {user && (
          <Link href={dashLink} className="font-body text-[#c4b5fd] hover:text-white transition-colors tracking-wide uppercase text-xs" style={{ fontFamily: "'Cinzel',serif", letterSpacing: "2px" }}>
            Dashboard
          </Link>
        )}

        <div className="h-4 w-[1px] bg-white/10 mx-1"></div>

        {/* Auth Buttons */}
        {!user ? (
          <div className="flex gap-3">
            <Link href="/auth/login" className="py-2 px-5 text-xs bg-white/5 text-white font-bold rounded-full border border-white/10 hover:bg-white/10 transition-colors uppercase" style={{ fontFamily: "'Cinzel',serif", letterSpacing: "1px" }}>
              Sign In
            </Link>
            <Link href="/auth/register" className="py-2 px-5 text-xs bg-gradient-to-r from-[#7c3aed] to-[#d97706] text-white font-bold rounded-full shadow-lg shadow-[#7c3aed]/20 hover:scale-105 transition-transform uppercase" style={{ fontFamily: "'Cinzel',serif", letterSpacing: "1px" }}>
              Join Free
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="group flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 hover:border-white/30 text-white transition-all backdrop-blur-md cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#c084fc] to-[#7c3aed] flex items-center justify-center text-white text-[10px] font-bold shadow-sm overflow-hidden border border-[#a78bfa]/30">
                  {profile?.photoURL ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={profile.photoURL} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </>
                  ) : (
                    getInitials()
                  )}
                </div>
                <span className="text-xs font-bold tracking-wide font-body">
                  {getDisplayName()}
                </span>
                <div className={`opacity-50 group-hover:opacity-100 transition-all duration-200 ${showUserMenu ? "rotate-180" : ""}`}>
                  <ChevronDown size={14} />
                </div>
              </button>

              {/* Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-3 w-56 rounded-xl bg-[#0a0415]/95 border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50">
                  <div className="p-4 border-b border-white/10">
                    <div className="text-[9px] text-[#a78bfa] font-mono uppercase mb-1 tracking-widest">
                      Account
                    </div>
                    <div className="text-sm text-white font-bold truncate">
                      {profile?.displayName || profile?.email || "Seeker"}
                    </div>
                  </div>
                  <Link
                    href={dashLink}
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 w-full px-4 py-3 text-xs uppercase font-bold text-white/70 hover:text-white hover:bg-white/5 transition-colors text-left"
                    style={{ fontFamily: "'Cinzel',serif", letterSpacing: "1px" }}
                  >
                    <LayoutDashboard size={14} /> Dashboard
                  </Link>
                  {profile?.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 w-full px-4 py-3 text-xs uppercase font-bold text-white/70 hover:text-white hover:bg-white/5 transition-colors text-left"
                      style={{ fontFamily: "'Cinzel',serif", letterSpacing: "1px" }}
                    >
                      <Users size={14} /> Admin
                    </Link>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 transition-all backdrop-blur-md"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          className="text-white p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="absolute top-[calc(100%+12px)] left-0 w-full p-4 rounded-3xl border border-white/10 flex flex-col gap-2 bg-[#0a0415]/95 backdrop-blur-2xl shadow-2xl z-50 animate-in slide-in-from-top-4">
          <Link href="/services" className="p-4 rounded-xl hover:bg-white/5 text-white font-bold text-sm uppercase tracking-widest" style={{ fontFamily: "'Cinzel',serif" }} onClick={() => setIsOpen(false)}>Services</Link>
          <Link href="/horoscopes" className="p-4 rounded-xl hover:bg-white/5 text-white font-bold text-sm uppercase tracking-widest" style={{ fontFamily: "'Cinzel',serif" }} onClick={() => setIsOpen(false)}>Horoscopes</Link>
          <Link href="/astrologers" className="p-4 rounded-xl hover:bg-white/5 text-white font-bold text-sm uppercase tracking-widest" style={{ fontFamily: "'Cinzel',serif" }} onClick={() => setIsOpen(false)}>Astrologers</Link>

          {user ? (
            <div className="mt-2 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6d28d9] to-[#c084fc] flex items-center justify-center text-white font-bold overflow-hidden border border-[#a78bfa]/30">
                  {profile?.photoURL ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={profile.photoURL} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </>
                  ) : (
                    getInitials()
                  )}
                </div>
                <div className="overflow-hidden">
                  <div className="text-white font-bold truncate font-body">{getDisplayName()}</div>
                  <div className="text-xs text-white/50 truncate">{profile?.email}</div>
                </div>
              </div>
              <Link href={dashLink} className="w-full py-3 mb-2 bg-white/5 hover:bg-white/10 border border-white/10 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-white text-xs uppercase" style={{ fontFamily: "'Cinzel',serif", letterSpacing: "1px" }} onClick={() => setIsOpen(false)}>
                <LayoutDashboard size={14} /> Dashboard
              </Link>
              <button
                onClick={() => { logout(); setIsOpen(false); }}
                className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-xs uppercase"
                style={{ fontFamily: "'Cinzel',serif", letterSpacing: "1px" }}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 mt-2">
              <Link href="/auth/login" className="w-full py-4 bg-white/5 text-white font-bold rounded-xl text-center text-xs uppercase" style={{ fontFamily: "'Cinzel',serif", letterSpacing: "1px" }} onClick={() => setIsOpen(false)}>Sign In</Link>
              <Link href="/auth/register" className="w-full py-4 bg-gradient-to-r from-[#7c3aed] to-[#d97706] text-white font-bold rounded-xl shadow-lg text-center text-xs uppercase" style={{ fontFamily: "'Cinzel',serif", letterSpacing: "1px" }} onClick={() => setIsOpen(false)}>Join Free</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
