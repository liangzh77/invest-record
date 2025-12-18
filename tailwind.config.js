/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'google-blue': '#1a73e8',
        'google-blue-hover': '#1557b0',
        'google-red': '#ea4335',
        'google-green': '#34a853',
        'google-gray': '#5f6368',
        'google-light-gray': '#f1f3f4',
      },
    },
  },
  plugins: [],
}
