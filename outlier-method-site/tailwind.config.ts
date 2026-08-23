import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#0B1729",
          700: "#16304F",
          500: "#2C5282",
        },
        bone: "#F7F5F1",
        red: {
          DEFAULT: "#A8232F",
          tint: "#F4E6E7",
        },
        ink: "#131A24",
        slate: "#5B6675",
        rule: "#DDD8D0",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "4px",
      },
    },
  },
  plugins: [],
};

export default config;
