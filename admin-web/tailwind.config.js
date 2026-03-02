/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                admin: {
                    bg: '#0A1628',
                    surface: '#111E32',
                    primary: '#1B6EF3',
                    purple: '#8B5CF6',
                    blue: '#1B6EF3',
                    teal: '#00C9A7',
                    green: '#10B981',
                    red: '#EF4444',
                    yellow: '#F59E0B',
                    border: 'rgba(255, 255, 255, 0.08)',
                    border2: 'rgba(255, 255, 255, 0.15)',
                    text: '#FFFFFF',
                    text2: 'rgba(255, 255, 255, 0.8)',
                    text3: 'rgba(255, 255, 255, 0.5)',
                }
            }
        },
    },
    plugins: [],
}
