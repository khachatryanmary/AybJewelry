/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html"
    ],

    darkMode: "class",
    theme: {
        extend: {
            fontFamily: {
                Against: ['"Against"', 'cursive'], // now you can use className="font-Against"
            },
        },
    },
    plugins: [],
}
