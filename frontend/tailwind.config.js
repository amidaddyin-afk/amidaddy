/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0c1220",
        sand: "#f5f7ff",
        clay: "#0ea5a4",
        cacao: "#0f172a"
      },
      fontFamily: {
        display: ["'Orbitron'", "sans-serif"],
        body: ["'Space Grotesk'", "sans-serif"]
      },
      boxShadow: {
        soft: "0 18px 50px rgba(15, 23, 42, 0.12)"
      }
    }
  },
  plugins: []
};
