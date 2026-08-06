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
        gold: {
          DEFAULT: '#D4AF37',
          dark: '#B8860B',
          pale: '#F5E6C8',
        },
        charcoal: {
          DEFAULT: '#0A0A0A',
          soft: '#111111',
          mid: '#1A1A1A',
        },
        ivory: '#FAF7F2',
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        playfair: ['Playfair Display', 'serif'],
        inter: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #B8860B, #D4AF37, #F5E6C8)',
      },
    },
  },
  plugins: [],
};

export default config;
