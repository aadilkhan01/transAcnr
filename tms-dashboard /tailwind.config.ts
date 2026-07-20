import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { 900: "#0A0F1E", 800: "#0D1424", 700: "#111827", 600: "#1A2235" },
        cyan: { 400: "#00D4FF", 300: "#33DDFF" },
      },
      fontFamily: {
        grotesk: ["Space Grotesk", "sans-serif"],
      },
      animation: {
        pulse_slow: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        spin_slow: "spin 8s linear infinite",
      }
    },
  },
  plugins: [],
};
export default config;
