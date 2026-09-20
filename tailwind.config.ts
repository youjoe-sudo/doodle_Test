import type { Config } from "tailwindcss";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#f8f2ec",
        paper: "#fffaf5",
        terracotta: {
          DEFAULT: "#bd745d",
          dark: "#914b3a",
          light: "#d4956f",
          50: "#fdf3ef",
          100: "#fbe4db",
          200: "#f5c5b0",
          300: "#eda186",
          400: "#d4956f",
          500: "#bd745d",
          600: "#a35c47",
          700: "#914b3a",
          800: "#6e3a2d",
          900: "#4d2820",
        },
        sage: {
          DEFAULT: "#b7b69a",
          dark: "#77765d",
        },
        blush: "#edc7c0",
        ink: "#3d3430",
        muted: "#84766f",
        line: "#eaded5",
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        body: ["'DM Sans'", "sans-serif"],
        decorative: ["'Parisienne'", "cursive"],
        arabicHeadline: ["'Alexandria'", "serif"],
        arabicBody: ["'IBM Plex Sans Arabic'", "sans-serif"],
        arabicDecorative: ["'Aref Ruqaa Ink'", "cursive"],
      },
      borderRadius: {
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        full: "9999px",
      },
      boxShadow: {
        "soft": "0 4px 20px rgba(189, 116, 93, 0.08)",
        "card": "0 2px 12px rgba(61, 52, 48, 0.06)",
        "card-hover": "0 8px 30px rgba(61, 52, 48, 0.12)",
        "primary": "0 20px 55px rgba(111, 76, 62, 0.10)",
        "hover": "0 24px 65px rgba(30, 41, 59, 0.12)",
        "active": "0 12px 35px rgba(30, 41, 59, 0.10)",
        "btn": "4px 4px 0px 0px #3d3430",
        "btn-hover": "6px 6px 0px 0px #3d3430",
        "btn-active": "2px 2px 0px 0px #3d3430",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-left": {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        "marquee": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.6s ease-out forwards",
        "slide-up": "slide-up 0.7s ease-out forwards",
        "slide-down": "slide-down 0.5s ease-out forwards",
        "slide-left": "slide-left 0.7s ease-out forwards",
        "scale-in": "scale-in 0.5s ease-out forwards",
        "float": "float 3s ease-in-out infinite",
        "wiggle": "wiggle 2s ease-in-out infinite",
        "marquee": "marquee 20s linear infinite",
        "delay-100": "slide-up 0.7s ease-out 0.1s forwards",
        "delay-200": "slide-up 0.7s ease-out 0.2s forwards",
        "delay-300": "slide-up 0.7s ease-out 0.3s forwards",
        "delay-400": "slide-up 0.7s ease-out 0.4s forwards",
      },
    },
  },
  plugins: [],
} as Config;
