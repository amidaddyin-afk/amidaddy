/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#15110d",
        sand: "#f8f1e7",
        clay: "#b85f2d",
        cacao: "#3a2619"
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Space Grotesk'", "sans-serif"]
      },
      boxShadow: {
        soft: "0 16px 40px rgba(21, 17, 13, 0.12)"
      }
    }
  },
  plugins: []
};
