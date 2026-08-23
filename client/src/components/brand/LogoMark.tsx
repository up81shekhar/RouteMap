type LogoMarkProps = {
  size?: number;
  className?: string;
  /** "icon" = mark on a gradient rounded-square background with a soft glow (app icon / favicon style).
   *  "mono" = just the gradient-stroked line mark, transparent background, no glow (crisp at small inline sizes). */
  variant?: "icon" | "mono";
};

/**
 * The RouteMap brand mark: an "R" drawn as a route line connecting stations
 * (nodes) — the stem, bowl, and leg of the R are each a route segment, with
 * circles marking stops. Deliberately echoes the site's own transit-line
 * roadmap visualization (SkillTree, LineDiagram) so the logo and the product
 * feel like the same visual language. Gradient: sky blue -> indigo -> violet.
 */
export default function LogoMark({ size = 32, className = "", variant = "icon" }: LogoMarkProps) {
  const gradientId = variant === "icon" ? "routemap-icon-grad" : "routemap-mono-grad";
  const glowId = "routemap-glow";
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
        <linearGradient id={gradientId} x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="45%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        {variant === "icon" && (
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {variant === "icon" && (
        <rect width="100" height="100" rx="22" fill={`url(#${gradientId})`} />
      )}

      <g filter={variant === "icon" ? `url(#${glowId})` : undefined}>
        {/* Stem */}
        <path d="M32 16 L32 84" stroke={strokeColor} strokeWidth="8.5" strokeLinecap="round" fill="none" />
        {/* Bowl */}
        <path
          d="M32 16 L50 16 C61 16 65 23 65 33 C65 43 61 48 50 48 L32 48"
          stroke={strokeColor}
          strokeWidth="8.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Leg */}
        <path d="M32 48 L68 84" stroke={strokeColor} strokeWidth="8.5" strokeLinecap="round" fill="none" />

        {/* Route stops */}
        <circle cx="32" cy="16" r="6" fill={nodeColor} />
        <circle cx="65" cy="33" r="5" fill={nodeColor} />
        <circle cx="32" cy="48" r="6" fill={nodeColor} />
        <circle cx="50" cy="66" r="4.5" fill={nodeColor} />
        <circle cx="32" cy="84" r="6" fill={nodeColor} />
        <circle cx="68" cy="84" r="6" fill={nodeColor} />
      </g>
    </svg>
  );
}
