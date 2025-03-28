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
      screens: {
        'short': {'raw': '(max-height: 800px)'},
        'medium': {'raw': '(min-height: 801px) and (max-height: 1000px)'},
        'tall': {'raw': '(min-height: 1001px)'},
      }
    },
  },
  plugins: [],
}
