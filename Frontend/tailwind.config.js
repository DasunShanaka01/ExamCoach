/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#4a90e2',
                secondary: '#f5f6fa',
                textDark: '#2c3e50',
                error: '#e74c3c',
                success: '#2ecc71',
            },
        },
    },
    plugins: [],
}
