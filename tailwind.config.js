/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
              'brand-primary': '#4f46e5',
              'brand-secondary': '#10b981',
              'base-100': '#111827',
              'base-200': '#1f2937',
              'base-300': '#374151',
              'text-primary': '#f9fafb',
              'text-secondary': '#d1d5db',
            }
    },
  },
  plugins: [],
};
