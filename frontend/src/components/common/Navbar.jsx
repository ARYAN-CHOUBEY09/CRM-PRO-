import { NavLink } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { useOrg } from "../../features/org/OrgContext";
import NotificationBell from "./NotificationBell";

const navItems = [
  { label: "Dashboard", to: "/" },
  { label: "Search", to: "/search" },
  { label: "Notifications", to: "/notifications" },
  { label: "Contacts", to: "/contacts" },
  { label: "Emails", to: "/emails" },
  { label: "Documents", to: "/documents" },
  { label: "Pipeline", to: "/pipeline" },
  { label: "Tasks", to: "/tasks" },
];

const Navbar = () => {
  const { user } = useAuth();
  const { currentOrg } = useOrg();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-brand-500/20 px-3 py-1 text-sm font-semibold uppercase tracking-wider text-brand-100">
            {currentOrg?.name || "Orbit CRM"}
          </div>
          <div className="hidden lg:flex items-center gap-2 text-sm text-slate-400">
            <span className="text-slate-300">{user?.name || "Guest"}</span>
            <span>•</span>
            <span className="uppercase tracking-wide text-slate-400">{user?.role || "User"}</span>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "rounded-xl px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-brand-600 text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <NotificationBell buttonClassName="h-10 w-10 rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10" />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
