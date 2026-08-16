import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useAdminStore } from "../../store/adminStore";

const links = [
  { to: "/roadmaps", label: "Roadmaps" },
  { to: "/topics", label: "Topics" },
  { to: "/practice", label: "Practice" },
  { to: "/placements", label: "Placements" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isOffline = useAdminStore((s) => s.isOffline);
  const retrying = useAdminStore((s) => s.retrying);
  const navigate = useNavigate();

  function handleLogout() {
    void logout();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-ink/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-accent font-display text-sm font-semibold text-white">
            L
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            LearnPath
          </span>
          {isOffline && (
            <span
              className="ml-1 rounded-full bg-border px-2 py-0.5 font-mono text-[10px] uppercase text-text-faint"
              title={retrying ? "Reconnecting to the API — it may be waking up from sleep" : "API not reachable — showing local demo data"}
            >
              {retrying ? "Waking up server…" : "Demo mode"}
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm transition-colors ${
                  isActive
                    ? "text-text-primary"
                    : "text-text-muted hover:text-text-primary"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/search"
            aria-label="Search"
            className="rounded border border-border px-3 py-1.5 text-sm text-text-muted hover:border-border-strong hover:text-text-primary"
          >
            Search
          </Link>
          {user ? (
            <>
              {user.role === "admin" && (
                <Link to="/admin" className="text-sm text-text-muted hover:text-text-primary">
                  Admin
                </Link>
              )}
              <Link to="/dashboard" className="text-sm text-text-muted hover:text-text-primary">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="rounded border border-border px-3.5 py-1.5 text-sm text-text-muted hover:border-border-strong hover:text-text-primary"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-text-muted hover:text-text-primary"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded bg-accent px-3.5 py-1.5 text-sm font-medium text-white hover:bg-accent-hover"
              >
                Sign up free
              </Link>
            </>
          )}
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center rounded border border-border md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          <span className="sr-only">Menu</span>
          <div className="space-y-1">
            <span className="block h-0.5 w-4 bg-text-primary" />
            <span className="block h-0.5 w-4 bg-text-primary" />
          </div>
        </button>
      </div>

      {open && (
        <div className="border-t border-border md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded px-2 py-2.5 text-sm text-text-muted hover:bg-surface hover:text-text-primary"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 border-t border-border pt-3">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex-1 rounded border border-border py-2 text-center text-sm text-text-muted"
                    onClick={() => setOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setOpen(false);
                    }}
                    className="flex-1 rounded bg-accent py-2 text-center text-sm font-medium text-white"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex-1 rounded border border-border py-2 text-center text-sm text-text-muted"
                    onClick={() => setOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="flex-1 rounded bg-accent py-2 text-center text-sm font-medium text-white"
                    onClick={() => setOpen(false)}
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
