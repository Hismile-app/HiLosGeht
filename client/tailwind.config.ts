import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0A",
        surface: "#121212",
        "surface-card": "#181818",
        "surface-hover": "#222222",
        primary: {
          DEFAULT: "#F37021",
          hover: "#FF833B",
          dark: "#D45B10",
          glow: "rgba(243, 112, 33, 0.4)"
        },
        border: {
          DEFAULT: "#262626",
          light: "#383838",
          neon: "rgba(243, 112, 33, 0.3)"
        },
        muted: "#8A8A8A",
        industrial: {
          yellow: "#FFB800",
          dark: "#0F0F0F",
          gray: "#2A2A2A",
          steel: "#4A4A4A"
        }
      },
      fontFamily: {
        orbitron: ["var(--font-orbitron)", "Orbitron", "sans-serif"],
        inter: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 15px rgba(243, 112, 33, 0.35)",
        "neon-lg": "0 0 30px rgba(243, 112, 33, 0.6)",
        card: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      backdropBlur: {
        xs: "2px",
      }
    },
  },
  plugins: [],
};
export default config;
