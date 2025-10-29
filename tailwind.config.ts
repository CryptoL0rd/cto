import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./lib/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        destructive: "var(--destructive)",
        "destructive-foreground": "var(--destructive-foreground)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular"],
      },
      backgroundImage: {
        "gradient-cosmic": "linear-gradient(135deg, #4a00e0 0%, #8e2de2 100%)",
        "gradient-nebula": "linear-gradient(135deg, #ff6fd8 0%, #3813c2 100%)",
        "gradient-starfield":
          "linear-gradient(135deg, #2b5876 0%, #4e4376 100%)",
      },
      boxShadow: {
        glow: "0 0 30px rgba(142, 102, 255, 0.45)",
        card: "0 20px 45px rgba(7, 3, 19, 0.55)",
      },
    },
  },
  plugins: [],
};

export default config;
