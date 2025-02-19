import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // https://coolors.co/000505-3b3355-5d5d81-bfcde0-fefcfd
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
          700: "#3B3355" /* space cadet */,
          800: "#222032",
          900: "#191825",
        },
        lightpurple: {
          100: "#ADADC2",
          200: "#A1A1BA",
          300: "#9595B1",
          400: "#8A8AA8",
          700: "#5D5D81" /* ultra violet */,
        },
        blue: {
          100: "#F1F4F8",
          200: "#BFCDE0" /* columbia blue */,
          300: "#9FB3D1",
          400: "#7592BD",
          500: "#5072A5",
          600: "#3C557C",
          700: "#283853",
          800: "#141C29",
        },
        error: {
          300: "#FFD6D8",
          400: "#FF999C",
          500: "#FF5C64" /* bittersweet */,
          600: "#FF1F2A",
          700: "#E0000B",
          800: "#A30008",
          900: "#660005",
        },
        // https://coolors.co/000505-3b3355-5d5d81-bfcde0-66a182
        success: {
          100: "#F2F7F5",
          200: "#D9E8E0",
          300: "#B3D0C1",
          400: "#8DB9A2",
          500: "#66A182" /* zomp */,
          600: "#4E7E64",
          700: "#365946",
          800: "#1F3328",
          900: "#101914",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
