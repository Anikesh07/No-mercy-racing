import { NavLink, Outlet } from "react-router-dom";
import { Flag } from "lucide-react";

const navItems = [
  ["/", "Home"],
  ["/register", "Register"],
  ["/leaderboards", "Leaderboards"],
  ["/fixtures", "Fixtures"],
  ["/pov-submit", "Submit POV"],
  ["/rules", "Rules"]
];

export default function App() {
  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg border border-neonPink/40 bg-neonPink/10 shadow-glow">
              <Flag className="h-6 w-6 text-neonPink" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-neonBlue">HydraLyx</p>
              <h1 className="text-xl font-black sm:text-2xl">No Mercy Racing League</h1>
            </div>
          </NavLink>

          <nav className="flex flex-wrap gap-2 text-sm text-slate-300">
            {navItems.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 transition hover:bg-white/10 ${isActive ? "bg-white/10 text-neonBlue" : ""}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <Outlet />
    </main>
  );
}
