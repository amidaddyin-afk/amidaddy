/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        sand: "#f8f8f6",
        clay: "#3b3b3b",
        cacao: "#1b1b1b"
      },
      fontFamily: {
        display: ["'Manrope'", "sans-serif"],
        body: ["'Manrope'", "sans-serif"]
      },
      boxShadow: {
        soft: "0 14px 38px rgba(17, 17, 17, 0.08)"
      }
    }
  },
  plugins: []
};
