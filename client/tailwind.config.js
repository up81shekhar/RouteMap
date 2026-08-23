/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#FFFFFF",
        surface: "#F3F3F1",
        surfaceRaised: "#EAEAE6",
        border: {
          DEFAULT: "#E1E1DC",
          strong: "#CACAC2",
        },
        text: {
          primary: "#191A23",
          muted: "#55565F",
          faint: "#85868D",
        },
        accent: {
          DEFAULT: "#3D8B24",
          hover: "#2C6B1B",
        },
        // Positivus-style vivid highlight — used sparingly for bold CTAs,
        // badges, and decorative fills (always paired with dark text on
        // top, never used as body/link text color — lime-on-white fails
        // contrast, this is a background-fill color only).
        lime: {
          DEFAULT: "#B9FF66",
          dark: "#191A23",
        },
        line: {
          coral: "#FF6B4A",
          teal: "#38BDF8",
          violet: "#6366F1",
          amber: "#E0A82E",
        },
        success: "#1F9D55",
        danger: "#D93025",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      borderRadius: {
        card: "14px",
      },
    },
  },
  plugins: [],
};
