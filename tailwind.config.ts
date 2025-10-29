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
        cosmic: {
          50: "#f0f0ff",
          100: "#e5e5ff",
          200: "#d0d0ff",
          300: "#b3b3ff",
          400: "#8080ff",
          500: "#6666ff",
          600: "#4d4dff",
          700: "#3333ff",
          800: "#1a1aff",
          900: "#0000ff",
          950: "#0000cc",
        },
        galaxy: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#581c87",
          950: "#3b0764",
        },
        nebula: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
          950: "#4c0519",
        },
      },
      backgroundImage: {
        "cosmic-gradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "galaxy-gradient":
          "linear-gradient(135deg, #a855f7 0%, #6366f1 50%, #3b82f6 100%)",
        "nebula-gradient":
          "linear-gradient(135deg, #f43f5e 0%, #e11d48 50%, #be123c 100%)",
        "starfield-gradient":
          "radial-gradient(ellipse at top, #1e293b 0%, #0f172a 100%)",
      },
      dropShadow: {
        "glow-cosmic": "0 0 20px rgba(102, 126, 234, 0.5)",
        "glow-cosmic-lg": [
          "0 0 30px rgba(102, 126, 234, 0.6)",
          "0 0 60px rgba(102, 126, 234, 0.3)",
        ],
        "glow-galaxy": "0 0 20px rgba(168, 85, 247, 0.5)",
        "glow-galaxy-lg": [
          "0 0 30px rgba(168, 85, 247, 0.6)",
          "0 0 60px rgba(168, 85, 247, 0.3)",
        ],
        "glow-nebula": "0 0 20px rgba(244, 63, 94, 0.5)",
        "glow-nebula-lg": [
          "0 0 30px rgba(244, 63, 94, 0.6)",
          "0 0 60px rgba(244, 63, 94, 0.3)",
        ],
      },
      boxShadow: {
        "glow-cosmic": "0 0 20px rgba(102, 126, 234, 0.5)",
        "glow-cosmic-lg":
          "0 0 30px rgba(102, 126, 234, 0.8), 0 0 60px rgba(102, 126, 234, 0.4)",
        "glow-galaxy": "0 0 20px rgba(168, 85, 247, 0.5)",
        "glow-galaxy-lg":
          "0 0 30px rgba(168, 85, 247, 0.8), 0 0 60px rgba(168, 85, 247, 0.4)",
        "glow-nebula": "0 0 20px rgba(244, 63, 94, 0.5)",
        "glow-nebula-lg":
          "0 0 30px rgba(244, 63, 94, 0.8), 0 0 60px rgba(244, 63, 94, 0.4)",
      },
      animation: {
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        twinkle: "twinkle 5s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(102, 126, 234, 0.5)" },
          "50%": {
            boxShadow:
              "0 0 30px rgba(102, 126, 234, 0.8), 0 0 40px rgba(102, 126, 234, 0.4)",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
export default config;
