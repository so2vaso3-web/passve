import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern 2025 colors - Chợ Tốt + VeXeRe + TikTok Shop style
        primary: {
          DEFAULT: "#10B981", // Emerald green
          hover: "#34D399",
          light: "#D1FAE5",
          dark: "#059669",
          gradient: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
        },
        accent: {
          DEFAULT: "#F59E0B", // Amber orange
          hover: "#FBBF24",
        },
        danger: {
          DEFAULT: "#DC2626", // Red for prices
          light: "#FEE2E2",
        },
        bg: {
          DEFAULT: "#FAFAFA",
          secondary: "#F0F2F5",
        },
      },
      fontFamily: {
        heading: ["var(--font-gilroy)", "system-ui", "sans-serif"],
        body: ["var(--font-avo)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "16px",
        "2xl": "24px",
        "3xl": "32px",
      },
      boxShadow: {
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        cardHover: "0 20px 25px -5px rgba(16, 185, 129, 0.2), 0 10px 10px -5px rgba(16, 185, 129, 0.1)",
        button: "0 10px 15px -3px rgba(16, 185, 129, 0.3), 0 4px 6px -2px rgba(16, 185, 129, 0.2)",
        glow: "0 0 20px rgba(16, 185, 129, 0.4)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "counter": "counter 1s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        counter: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)" },
        },
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
        "gradient-bg": "linear-gradient(180deg, #FAFAFA 0%, #F0F2F5 100%)",
      },
    },
  },
  plugins: [],
};
export default config;

