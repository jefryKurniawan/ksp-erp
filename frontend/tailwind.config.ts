import { type Config } from "tailwindcss";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx}",
  ],
  darkMode: "class", // ✅ Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Custom colors untuk KSP branding
        ksp: {
          blue: "#1e40af",
          green: "#166534",
          gold: "#b45309",
        }
      }
    },
  },
  plugins: [],
} satisfies Config;