/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        themeBlue: '#5468ff',
        themeBlue125: '#3c4fe0',
        themeBlue75: '#7786fd',
        themeBlue50: '#9ea8fb',
        themeBlue25: '#c9cffd',
        themeGrey: '#768ab1',
        themeGrey75: '#8d9dbc',
        themeGrey25: '#f8f8fc',
        themeBorderGrey: '#eeeef5',
        themeBorderGrey125: '#cbcce0',
        themeFontGrey: '#6a6ea4',
        themeFontBlack: '#23263b',

      },
      boxShadow: {
        'themeShadowGrey125-2': '0 2px 3px 0 rgb(203 204 224 / 0.3), 0 1px 2px -1px rgb(203 204 224 / 0.2)',
        'themeShadowGrey125-1': '0 2px 3px 0 rgb(203 204 224 / 0.3), 0 1px 2px -1px rgb(203 204 224 / 0.2)',
      }
    },
  },
  plugins: [],

}

