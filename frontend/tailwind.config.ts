import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#0f766e",
          secondary: "#0ea5e9"
        }
      }
    }
  },
  plugins: []
} satisfies Config;
