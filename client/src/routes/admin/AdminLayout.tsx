import { NavLink, Outlet } from "react-router-dom";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";

const sections = [
  { to: "/admin", label: "Roadmaps", end: true },
  { to: "/admin/notes", label: "Notes", end: false },
];

export default function AdminLayout() {
  useDocumentMeta({ title: "Admin", noindex: true, path: "/admin" });

  return (
    <div className="container-page grid gap-10 py-10 lg:grid-cols-[200px_1fr]">
      <aside>
        <p className="station-code mb-3">Admin</p>
        <nav className="space-y-1">
          {sections.map((s) => (
            <NavLink
              key={s.to}
              to={s.to}
              end={s.end}
              className={({ isActive }) =>
                `block rounded px-2.5 py-2 text-sm ${
                  isActive ? "bg-surface text-text-primary" : "text-text-muted hover:text-text-primary"
                }`
              }
            >
              {s.label}
            </NavLink>
          ))}
        </nav>
        <p className="mt-8 text-xs text-text-faint">
          Videos, resources, quizzes, users, and reports management are covered inside each roadmap for now — dedicated sections land as the catalog grows.
        </p>
      </aside>
      <div>
        <Outlet />
      </div>
    </div>
  );
}
