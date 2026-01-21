import type { Config } from "tailwindcss";
/** @type {Config} */

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {}
  },
  plugins: []
} satisfies Config;
