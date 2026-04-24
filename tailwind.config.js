/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./frontend/src/**/*.{js,ts,jsx,tsx,mdx}",
    "./frontend/src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./frontend/src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f172a',
          surface: '#1e293b',
          border: '#334155',
          text: '#e2e8f0',
        },
      },
    },
  },
  plugins: [],
};
