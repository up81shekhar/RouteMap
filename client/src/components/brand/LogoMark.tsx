type LogoMarkProps = {
  size?: number;
  className?: string;
  /** "icon" = white mark on a gradient rounded-square background (app icon / favicon style).
   *  "mono" = just the gradient-stroked line mark, transparent background (for placing inside your own badge). */
  variant?: "icon" | "mono";
};

/**
 * The RouteMap brand mark: an "R" drawn as a route line connecting stations
 * (nodes) — the stem, bowl, and leg of the R are each a route segment, with
 * circles marking stops. Deliberately echoes the site's own transit-line
 * roadmap visualization (SkillTree, LineDiagram) so the logo and the product
 * feel like the same visual language.
 */
export default function LogoMark({ size = 32, className = "", variant = "icon" }: LogoMarkProps) {
  const gradientId = variant === "icon" ? "routemap-icon-grad" : "routemap-mono-grad";
  const strokeColor = variant === "icon" ? "white" : `url(#${gradientId})`;
  const nodeColor = variant === "icon" ? "white" : `url(#${gradientId})`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="RouteMap"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
      </defs>

      {variant === "icon" && (
        <rect width="100" height="100" rx="22" fill={`url(#${gradientId})`} />
      )}

      {/* Stem */}
      <path d="M32 22 L32 78" stroke={strokeColor} strokeWidth="9" strokeLinecap="round" fill="none" />
      {/* Bowl */}
      <path
        d="M32 22 L50 22 Q60 22 60 32 Q60 42 50 42 L32 42"
        stroke={strokeColor}
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Leg */}
      <path d="M32 42 L64 78" stroke={strokeColor} strokeWidth="9" strokeLinecap="round" fill="none" />

      {/* Route stops */}
      <circle cx="32" cy="22" r="6.5" fill={nodeColor} />
      <circle cx="60" cy="32" r="5.5" fill={nodeColor} />
      <circle cx="32" cy="42" r="6.5" fill={nodeColor} />
      <circle cx="32" cy="78" r="6.5" fill={nodeColor} />
      <circle cx="64" cy="78" r="6.5" fill={nodeColor} />
    </svg>
  );
}
