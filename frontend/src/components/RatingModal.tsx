"use client";
import { useState } from "react";
import { Star, X } from "lucide-react";

interface Props {
  astroName: string;
  onSubmit: (rating: number, comment: string) => void;
  onSkip: () => void;
}

export default function RatingModal({ astroName, onSubmit, onSkip }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);
    await onSubmit(rating, comment);
  };

  const labels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div className="relative card p-8 max-w-md w-full animate-slide-up text-center">
        <button onClick={onSkip} className="absolute top-4 right-4 text-purple-500 hover:text-purple-300">
          <X className="w-5 h-5" />
        </button>

        <div className="text-5xl mb-4">✨</div>
        <h2 className="font-display text-2xl text-white mb-1">Session Complete</h2>
        <p className="font-body text-purple-400 italic mb-6">
          How was your session with <span className="text-cosmic-300">{astroName}</span>?
        </p>

        {/* Stars */}
        <div className="flex justify-center gap-2 mb-3">
          {[1, 2, 3, 4, 5].map(i => (
            <button
              key={i}
              className="star-btn"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(i)}
            >
              <Star
                className="w-10 h-10 transition-all duration-150"
                fill={(hover || rating) >= i ? "#f59e0b" : "transparent"}
                color={(hover || rating) >= i ? "#f59e0b" : "#4a3a6e"}
              />
            </button>
          ))}
        </div>

        {(hover > 0 || rating > 0) && (
          <p className="font-display text-gold-400 text-sm tracking-wider mb-4">
            {labels[hover || rating]}
          </p>
        )}

        {/* Comment */}
        <textarea
          className="input-field text-sm resize-none h-24 mb-4"
          placeholder="Share your experience (optional)…"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />

        <div className="flex gap-3">
          <button onClick={onSkip} className="flex-1 py-2.5 rounded-lg border border-mystic-border text-purple-500 font-display text-sm hover:border-cosmic-700 transition-colors">
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || loading}
            className="flex-1 btn-gold py-2.5"
          >
            {loading ? "Submitting…" : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
