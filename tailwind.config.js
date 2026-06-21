/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/components/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/providers/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/client-layout.js",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          100: "var(--base-100)",
          200: "var(--base-200)",
          300: "var(--base-300)",
          400: "var(--base-400)",
          500: "var(--base-500)",
          600: "var(--base-600)",
          700: "var(--base-700)",
        },
      },
      fontFamily: {
        display: "var(--font-koulen), sans-serif",
        body: "var(--font-host-grotesk), sans-serif",
        mono: "var(--font-dm-mono), monospace",
      },
      boxShadow: {
        panel: "0 10px 30px rgba(15, 15, 15, 0.08)",
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [],
};
