type Station = {
  label: string;
  state: "done" | "current" | "upcoming";
  x: number;
  y: number;
};

// Plotted on a smooth alternating vertical wave
const stations: Station[] = [
  { label: "Basics", state: "done", x: 50, y: 70 },
  { label: "Arrays", state: "current", x: 190, y: 110 }, // Dips down
  { label: "Trees", state: "upcoming", x: 330, y: 30 },  // Rises up
  { label: "Graphs", state: "upcoming", x: 470, y: 110 }, // Dips down
  { label: "Job-ready", state: "upcoming", x: 610, y: 70 }, // Returns to center
];

// SVG Cubic Bezier (C) curves to create a perfectly smooth flowing wave
const fullPath =
  "M 50 70 C 120 70, 120 110, 190 110 C 260 110, 260 30, 330 30 C 400 30, 400 110, 470 110 C 540 110, 540 70, 610 70";

const activePath = "M 50 70 C 120 70, 120 110, 190 110";

export default function LineDiagram() {
  return (
    <svg
      viewBox="0 0 660 140"
      className="w-full max-w-2xl"
      role="img"
      aria-label="DSA learning route"
    >
      <defs>
        {/* Soft glowing shadow for the active path */}
        <filter id="orange-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 1. Future Track (Dashed & Flowing) */}
      <path
        d={fullPath}
        fill="none"
        stroke="#2A2F3D"
        strokeWidth={2}
        strokeDasharray="6 6"
      >
        {/* Makes the dashes look like they are flowing toward the goal */}
        <animate
          attributeName="stroke-dashoffset"
          from="24"
          to="0"
          dur="1s"
          repeatCount="indefinite"
          calcMode="linear"
        />
      </path>

      {/* 2. Active Track (Solid & Glowing) */}
      <path
        d={activePath}
        fill="none"
        stroke="#f97316" /* L1 Orange */
        strokeWidth={3}
        filter="url(#orange-glow)"
      />

      {/* 3. Nodes and Labels */}
      {stations.map((s) => {
        const isDone = s.state === "done";
        const isCurrent = s.state === "current";
        const isUpcoming = s.state === "upcoming";

        // Push text away from the curve. If the node is high (y=30), text goes lower. 
        const labelY = s.y > 70 ? s.y - 25 : s.y + 35;

        return (
          <g key={s.label}>
            {/* -- UPCOMING STATE -- */}
            {isUpcoming && (
              <>
                <circle cx={s.x} cy={s.y} r={6} fill="#12151C" stroke="#2A2F3D" strokeWidth={2} />
              </>
            )}

            {/* -- DONE STATE -- */}
            {isDone && (
              <>
                <circle cx={s.x} cy={s.y} r={6} fill="#f97316" />
              </>
            )}

            {/* -- CURRENT STATE -- */}
            {isCurrent && (
              <>
                {/* Expanding pulse animation */}
                <circle cx={s.x} cy={s.y} r={8} fill="#f97316" opacity="0.4">
                  <animate
                    attributeName="r"
                    values="8; 24"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.6; 0"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
                
                {/* Static outer glow ring */}
                <circle cx={s.x} cy={s.y} r={12} fill="#f97316" opacity="0.15" />
                
                {/* Core dot */}
                <circle cx={s.x} cy={s.y} r={6} fill="#12151C" stroke="#f97316" strokeWidth={3} />
                <circle cx={s.x} cy={s.y} r={2} fill="#f97316" />
              </>
            )}

            {/* Text Label */}
            <text
              x={s.x}
              y={labelY}
              textAnchor="middle"
              fontSize={13}
              fontWeight={isCurrent ? 600 : 500}
              fontFamily="Inter, sans-serif"
              fill={isDone || isCurrent ? "#E9EBF0" : "#6B7280"}
            >
              {s.label}
            </text>

            {/* "Current" badge indicator */}
            {isCurrent && (
              <rect
                x={s.x - 32}
                y={s.y + 20}
                width={64}
                height={18}
                rx={9}
                fill="#f97316"
                fillOpacity="0.15"
                stroke="#f97316"
                strokeOpacity="0.3"
              />
            )}
            {isCurrent && (
              <text
                x={s.x}
                y={s.y + 32}
                textAnchor="middle"
                fontSize={9}
                fontWeight="bold"
                fontFamily="Inter, sans-serif"
                letterSpacing="0.05em"
                fill="#f97316"
              >
                CURRENT
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}