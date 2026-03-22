/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        purpleLight: '#7e5bef',
        purpleDark: '#5a3ea1',
        purpleAccent: '#d16cd8',
      },
    },
  },
  plugins: [],
};
