import { Link } from "react-router-dom";

const columns = [
  {
    title: "Learn",
    links: [
      { to: "/roadmaps", label: "Roadmaps" },
      { to: "/roadmaps?category=exam", label: "Practice" },
      { to: "/roadmaps/placement-prep", label: "Placements" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/privacy", label: "Privacy" },
      { to: "/terms", label: "Terms" },
      { to: "/copyright", label: "Copyright policy" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container-page grid grid-cols-2 gap-8 py-14 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-accent font-display text-xs font-semibold text-white">
              L
            </span>
            <span className="font-display text-base font-semibold">LearnPath</span>
          </div>
          <p className="mt-3 text-sm text-text-muted">
            A route map for the internet's free courses.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="station-code mb-3">{col.title}</p>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-text-muted hover:text-text-primary"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border py-5">
        <div className="container-page flex flex-col gap-2 text-xs text-text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} LearnPath. All course content belongs to its original creators.</p>
          <p>Videos are embedded via the official YouTube player — nothing is re-hosted.</p>
        </div>
      </div>
    </footer>
  );
}
