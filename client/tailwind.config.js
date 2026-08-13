/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#0B0D12",
        surface: "#12151C",
        surfaceRaised: "#171B24",
        border: {
          DEFAULT: "#232733",
          strong: "#333949",
        },
        text: {
          primary: "#E9EBF0",
          muted: "#8B93A7",
          faint: "#5B6272",
        },
        accent: {
          DEFAULT: "#4F7CFF",
          hover: "#3D63E0",
        },
        line: {
          coral: "#FF6B4A",
          teal: "#2FBF9E",
          violet: "#9B8CFB",
          amber: "#F0B429",
        },
        success: "#2FBF71",
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
