/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './dist/**/*.html',
    './build/templates.mjs',
    './build/render.mjs',
    './src/js/**/*.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
