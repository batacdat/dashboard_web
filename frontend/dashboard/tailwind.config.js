import daisyui from "daisyui"; // 1. Dùng import

/** @type {import('tailwindcss').Config} */
export default { // 2. Dùng export default
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    daisyui, // 3. Gọi biến daisyui
  ],
  daisyui: {
    themes: ["light", "dark", "cupcake"],
  },
}