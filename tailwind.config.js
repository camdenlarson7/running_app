/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.tsx",
    "./app/**/*.css"
  ],
  theme: {
    extend: {
      colors: {
        lightblue: '#add8e6',   // Light blue color
        darkblue: '#003366',    // Dark blue color
      },
    },
  },
  plugins: [],
};

