/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#40a2ff',
        secondary: '#ff2941',
        darkbg: '#181818',
        darkcard: '#2A2A2A'
      },
      container: {
        center: true,
        padding: '2rem'
      },
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
      },
    }
  },
  future: {
    hoverOnlyWhenSupported: true,
    respectDefaultRingColorOpacity: true,
    disableColorOpacityUtilitiesByDefault: true,
    relativeContentPathsByDefault: true,
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
