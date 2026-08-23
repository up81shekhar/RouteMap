/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#0A0F0D",
        surface: "#121815",
        surfaceRaised: "#161D19",
        border: {
          DEFAULT: "#212B24",
          strong: "#324134",
        },
        text: {
          primary: "#E8EDE7",
          muted: "#8FA097",
          faint: "#59685D",
        },
        accent: {
          DEFAULT: "#22A970",
          hover: "#1C8D5C",
        },
        line: {
          coral: "#FF6B4A",
          teal: "#38BDF8",
          violet: "#6366F1",
          amber: "#F0B429",
        },
        success: "#3ECF8E",
        danger: "#E0524A",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};
