// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html",
    ],
    theme: {
        extend: {
            screens: {
                xs: '480px', // Custom breakpoint below sm (640px)
            },
            fontFamily: {
                Against: ['"Against"', 'italic'],
            },
            colors: {
                gold: '#FFD700',
                diamond: '#F4F4F9',
                slate: '#2D3748',
            },
            fontSize: {
                'xs': ['0.75rem', { lineHeight: '1rem' }],
                'sm': ['0.875rem', { lineHeight: '1.25rem' }],
                'base': ['1rem', { lineHeight: '1.5rem' }],
                'lg': ['1.125rem', { lineHeight: '1.75rem' }],
                'xl': ['1.25rem', { lineHeight: '1.75rem' }],
                '2xl': ['1.5rem', { lineHeight: '2rem' }],
            },
        },
    },
    plugins: [],
};
