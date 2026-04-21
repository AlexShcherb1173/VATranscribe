import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/downloads", label: "Downloads" },
  { to: "/files", label: "Files" },
  { to: "/jobs", label: "Jobs" },
  { to: "/transcriptions", label: "Transcriptions" },
  { to: "/profile", label: "Profile" },
  { to: "/billing", label: "Billing" },
  { to: "/upgrade", label: "Upgrade" },
  { to: "/settings", label: "Settings" },
];

export function Sidebar() {
  return (
    <aside className="border-r border-slate-800 bg-slate-950/90 p-4 lg:p-6">
      <div className="mb-8">
        <div className="text-xs font-medium uppercase tracking-[0.22em] text-cyan-400">
          VATranscribe
        </div>
        <div className="mt-2 text-xl font-semibold text-white">
          Control Panel
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              [
                "block rounded-xl px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-cyan-500/15 text-cyan-300"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}