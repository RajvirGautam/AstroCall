/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Cinzel'", "serif"],
        body: ["'Cormorant Garamond'", "serif"],
        mono: ["'DM Mono'", "monospace"],
      },
      colors: {
        cosmic: {
          50:  "#f5f0ff",
          100: "#ede5ff",
          200: "#d9ccff",
          300: "#bb99ff",
          400: "#9966ff",
          500: "#7733ff",
          600: "#5500dd",
          700: "#3d00aa",
          800: "#280077",
          900: "#150044",
          950: "#0a0022",
        },
        gold: {
          300: "#fde68a",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        mystic: {
          dark:  "#07040f",
          card:  "#110b22",
          border:"#2a1a4e",
          glow:  "#7733ff33",
        }
      },
      backgroundImage: {
        "star-field": "radial-gradient(ellipse at top, #1a0533 0%, #07040f 60%)",
        "card-glow": "linear-gradient(135deg, #1a0d33 0%, #0d0820 100%)",
        "gold-shimmer": "linear-gradient(135deg, #f59e0b, #fde68a, #f59e0b)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "star-twinkle": "star-twinkle 3s ease-in-out infinite",
        "slide-up": "slide-up 0.4s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "ring-pulse": "ring-pulse 1.5s ease-in-out infinite",
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-10px)" } },
        "pulse-glow": { "0%,100%": { boxShadow: "0 0 20px #7733ff44" }, "50%": { boxShadow: "0 0 40px #7733ffaa, 0 0 80px #7733ff44" } },
        "star-twinkle": { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.3" } },
        "slide-up": { from: { transform: "translateY(20px)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "ring-pulse": { "0%": { boxShadow: "0 0 0 0 #7733ff66" }, "70%": { boxShadow: "0 0 0 20px #7733ff00" }, "100%": { boxShadow: "0 0 0 0 #7733ff00" } },
      },
      boxShadow: {
        "cosmic": "0 4px 40px rgba(119,51,255,0.25), 0 1px 3px rgba(0,0,0,0.5)",
        "gold": "0 4px 20px rgba(245,158,11,0.3)",
        "card": "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
      }
    },
  },
  plugins: [],
};
