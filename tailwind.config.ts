import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        notion: {
          bg: "#ffffff",
          darkBg: "#191919",
          card: "#ffffff",
          darkCard: "#202020",
          hover: "#f7f7f5",
          darkHover: "#2c2c2c",
          border: "#e9e9e7",
          darkBorder: "#2f2f2f",
          text: "#37352f",
          darkText: "#ececec",
          muted: "#787774",
          darkMuted: "#9b9a97",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
