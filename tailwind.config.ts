import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          dark: '#0b0f1a',
          darker: '#0d1117',
          purple: '#6366f1',
          blue: '#3b82f6',
          pink: '#ec4899',
        },
      },
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(to bottom right, #0b0f1a, #1a0b2e, #0b0f1a)',
      },
      boxShadow: {
        cosmic: '0 0 20px rgba(99, 102, 241, 0.2)',
        'cosmic-lg': '0 0 40px rgba(99, 102, 241, 0.3)',
      },
      backdropBlur: {
        cosmic: '12px',
      },
    },
  },
  plugins: [],
};
export default config;
