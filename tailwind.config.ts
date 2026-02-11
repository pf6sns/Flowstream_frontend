import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#e6f0ff",
          75: "#96c0ff",
          100: "#6ba6ff",
          200: "#2b7fff",
          DEFAULT: "#0065ff",
          400: "#0047b3",
          500: "#003e9c",
        },
        text: "#242424",
      },
    },
  },
  plugins: [],
};

export default config;
