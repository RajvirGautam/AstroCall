"use client";
import { Astrologer } from "@/types";
import { Star, Phone, Globe, Zap } from "lucide-react";

interface Props {
  astrologer: Astrologer;
  onCall: (a: Astrologer) => void;
  isLoading?: boolean;
}

export default function AstrologerCard({ astrologer, onCall, isLoading }: Props) {
  return (
    <div className="card p-6 flex flex-col gap-4 hover:glow-border transition-all duration-300 group animate-slide-up">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={astrologer.photoURL}
            alt={astrologer.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-cosmic-700"
          />
          <span
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-mystic-card status-dot ${astrologer.isOnline ? "status-online" : "status-offline"
              }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-white text-lg leading-tight">{astrologer.name}</h3>
          <div className="flex items-center gap-1 mt-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="w-3.5 h-3.5"
                fill={i < Math.round(astrologer.rating) ? "#f59e0b" : "transparent"}
                color={i < Math.round(astrologer.rating) ? "#f59e0b" : "#4a3a6e"}
              />
            ))}
            <span className="font-body text-xs text-purple-400 ml-1">
              {astrologer.rating > 0 ? `${astrologer.rating.toFixed(1)} (${astrologer.totalReviews})` : "New"}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs font-display tracking-wide px-2 py-0.5 rounded-full border ${astrologer.isOnline
              ? "text-green-300 border-green-700 bg-green-900/20"
              : "text-purple-500 border-purple-800 bg-purple-900/10"
            }`}>
            {astrologer.isOnline ? "● Online" : "○ Away"}
          </span>
        </div>
      </div>

      {/* Bio */}
      <p className="font-body text-purple-300 text-sm leading-relaxed line-clamp-2 italic">
        {astrologer.bio}
      </p>

      {/* Specialties */}
      <div className="flex flex-wrap gap-1.5">
        {astrologer.specialties.slice(0, 3).map(s => (
          <span key={s} className="text-xs font-body text-cosmic-300 bg-cosmic-900/50 border border-cosmic-800 rounded-full px-2.5 py-0.5">
            {s}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-mystic-border">
        <div className="flex items-center gap-3 text-xs text-purple-400 font-body">
          <span className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" />
            {astrologer.languages.slice(0, 2).join(", ")}
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-gold-500" />
            ₹{astrologer.ratePerMinute}/min
          </span>
        </div>

        <button
          onClick={() => onCall(astrologer)}
          disabled={!astrologer.isOnline || isLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-display text-sm tracking-wide transition-all duration-200 ${astrologer.isOnline
              ? "bg-gradient-to-r from-cosmic-600 to-cosmic-700 text-white hover:from-cosmic-500 hover:to-cosmic-600 shadow-cosmic animate-ring-pulse"
              : "bg-mystic-card border border-mystic-border text-purple-600 cursor-not-allowed"
            }`}
        >
          <Phone className="w-3.5 h-3.5" />
          {astrologer.isOnline ? (isLoading ? "Connecting…" : "Call Now") : "Offline"}
        </button>
      </div>
    </div>
  );
}
