import type { Config } from "tailwindcss";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FDFBF7",
        card: "#F9F6F0",
        border: "#E2E8F0",
        input: "#FFFFFF",
        accent: "#C25350",
        accentForeground: "#FFFFFF",
        secondary: "#E4EFE7",
        tertiary: "#ECE5F5",
        quaternary: "#F9EAE1",
        destructive: "#EF4444",
        muted: "#5A4A42",
        mutedForeground: "#5A4A42",
        popover: "#FFFFFF",
        sidebar: "#F3F4F6",
        ring: "#C25350",
        heading: "#2C1E1B",
        body: "#5A4A42",
        pastel: {
          pink: "#FBE3E5",
          mint: "#E4EFE7",
          lavender: "#ECE5F5",
          peach: "#F9EAE1",
        },
      },
      fontFamily: {
        display: ["Comfortaa", "Cairo", "cursive"],
        body: ["Inter", "Cairo", "sans-serif"],
        arabic: ["Cairo", "sans-serif"],
        decorative: ["Playfair Display", "serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        full: "9999px",
      },
      boxShadow: {
        soft: "0 1px 3px rgba(0,0,0,0.08)",
        card: "0 1px 3px rgba(0,0,0,0.08)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.12)",
        primary: "0 4px 20px rgba(0,0,0,0.1)",
        hover: "0 8px 24px rgba(0,0,0,0.12)",
        active: "0 2px 8px rgba(0,0,0,0.1)",
        btn: "none",
        "btn-hover": "none",
        "btn-active": "none",
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