import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // https://coolors.co/000505-2b283e-68688d-bfcde0-fefcfd
      colors: {
        black: "#000505",
        white: "#FEFCFD",
        darkpurple: {
          100: "#5A5889",
          200: "#52507C",
          300: "#4A4870",
          400: "#424064",
          500: "#3A3857",
          600: "#32304B",
          700: "#3B3355", // space cadet
          800: "#222032",
          900: "#191825",
        },
        lightpurple: {
          100: "#ADADC2",
          200: "#A1A1BA",
          300: "#9595B1",
          400: "#8A8AA8",
          700: "#5D5D81", // ultra violet
        },
        blue: "#BFCDE0", // columbia blue
      },
    },
  },
  plugins: [],
} satisfies Config;
