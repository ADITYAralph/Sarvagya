/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                nvidia: {
                    green: "#76B900",
                    black: "#000000",
                    "deep-slate": "#111111",
                    "charcoal-light": "#1A1A1A",
                    gray: "#999999",
                    white: "#FFFFFF",
                },
            },
        },
    },
    plugins: [],
};