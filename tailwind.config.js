// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-blue': '#17325b',
        'yellow': '#faa31e',
        'red': '#d72b29',
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'adventure': ['Adventure', 'sans-serif'],
      },
    },
  },
  plugins: [],
}