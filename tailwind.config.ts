import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        black: "var(--black)",
        white: "var(--white)",
        spacecadet: "var(--spacecadet)",
        ultraviolet: "var(--ultraviolet)",
        columbiawhite: "var(--columbiawhite)",
      },
    },
  },
  plugins: [],
} satisfies Config;
