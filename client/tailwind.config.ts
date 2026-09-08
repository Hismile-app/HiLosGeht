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
        background: "#FFFFFF",
        surface: "#F8F9FA",
        "surface-card": "#FFFFFF",
        "surface-hover": "#F4F4F5",
        foreground: "#09090B",
        primary: {
          DEFAULT: "#D95400", // High contrast industrial construction orange
          hover: "#BF4900",
          light: "#FFF4ED",
          dark: "#A33E00",
          glow: "rgba(217, 84, 0, 0.25)"
        },
        border: {
          DEFAULT: "#E4E4E7",
          subtle: "#F4F4F5",
          dark: "#D4D4D8",
          orange: "rgba(217, 84, 0, 0.35)"
        },
        muted: "#71717A",
        ink: {
          DEFAULT: "#09090B",
          secondary: "#27272A",
          muted: "#71717A"
        },
        industrial: {
          yellow: "#EAB308",
          dark: "#18181B",
          gray: "#71717A",
          steel: "#52525B",
          light: "#FAFAFA"
        }
      },
      fontFamily: {
        orbitron: ["var(--font-orbitron)", "Orbitron", "sans-serif"],
        inter: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
        orange: "0 4px 20px -2px rgba(217, 84, 0, 0.2)",
      },
    },
  },
  plugins: [],
};
export default config;
