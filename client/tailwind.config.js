/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // These read from CSS variables (defined in index.css for :root
        // and .dark) so every existing bg-ink / text-text-primary / etc.
        // usage across the app automatically follows the active theme —
        // no need to touch individual components.
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        surfaceRaised: "rgb(var(--color-surface-raised) / <alpha-value>)",
        border: {
          DEFAULT: "rgb(var(--color-border) / <alpha-value>)",
          strong: "rgb(var(--color-border-strong) / <alpha-value>)",
        },
        text: {
          primary: "rgb(var(--color-text-primary) / <alpha-value>)",
          muted: "rgb(var(--color-text-muted) / <alpha-value>)",
          faint: "rgb(var(--color-text-faint) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          hover: "rgb(var(--color-accent-hover) / <alpha-value>)",
        },
        // Positivus-style vivid highlight — used sparingly for bold CTAs,
        // badges, and decorative fills (always paired with dark text on
        // top, never used as body/link text color — lime-on-white fails
        // contrast, this is a background-fill color only). Fixed across
        // themes on purpose — it's a brand accent, not a surface color.
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
        success: "rgb(var(--color-success) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
        // Alias — a lot of components were written using `error` (e.g.
        // text-error, border-error) but only `danger` was ever defined,
        // so those utilities were silently no-ops. This makes them work.
        error: "rgb(var(--color-danger) / <alpha-value>)",
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
