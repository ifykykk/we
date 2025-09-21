/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "480px",   // custom small
        "3xl": "1600px", // custom large
      },
      colors: {
        primary: "#2563eb",        // Blue-600 - Main brand color
        "primary-accent": "#3b82f6", // Blue-500 - Lighter accent
        "primary-dark": "#1d4ed8",   // Blue-700 - Darker shade
        "primary-light": "#dbeafe",  // Blue-100 - Light backgrounds
        bgprimary: "#f8fafc",       // Slate-50 - Light background
        bgsecondary: "#ffffff",     // White
        bgvariant: "#e2e8f0",       // Slate-200 - Variant background
        muted: "#7d7d82",           // Gray-500 - Muted text
        based: "#111111",           // Gray-900 - Base text
        success: "#0ea5e9",         // Sky-500 - Success states
        danger: "#ef4444",          // Red-500 - Error states
        warning: "#f59e0b",         // Amber-500 - Warning states
        "dark-overlay": "rgba(1,1,1,0.5)",
      },
    },
  },
  plugins: [],
}
