import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { useOrg } from "../../features/org/OrgContext";
import { hasAnyRole } from "../../lib/permissions";
import NotificationBell from "./NotificationBell";
import OrganizationSwitcher from "./OrganizationSwitcher";

const navigation = [
  {
    group: "Workspace",
    items: [
      { label: "Dashboard", to: "/", icon: "dashboard" },
      { label: "Search", to: "/search", icon: "search" },
      { label: "Notifications", to: "/notifications", icon: "notifications" },
      { label: "Contacts", to: "/contacts", icon: "contacts" },
      { label: "Emails", to: "/emails", icon: "emails" },
      { label: "Pipeline", to: "/pipeline", icon: "pipeline" },
      { label: "Tasks", to: "/tasks", icon: "tasks" },
    ],
  },
  {
    group: "Management",
    items: [
      { label: "Reports", to: "/reports", roles: ["admin", "manager"], icon: "reports" },
      { label: "Automation", to: "/automation", roles: ["admin", "manager"], icon: "automation" },
      { label: "Admin Users", to: "/users", roles: ["admin"], icon: "users" },
    ],
  },
];

const renderIcon = (icon) => {
  const commonProps = {
    viewBox: "0 0 24 24",
    "aria-hidden": "true",
    className: "h-4.5 w-4.5 fill-none stroke-current stroke-[1.8]",
  };

  switch (icon) {
    case "dashboard":
      return (
        <svg {...commonProps}>
          <path d="M4 5h7v6H4zM13 5h7v4h-7zM13 11h7v8h-7zM4 13h7v6H4z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "search":
      return (
        <svg {...commonProps}>
          <path d="M21 21l-4.3-4.3m1.8-5.2a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "notifications":
      return (
        <svg {...commonProps}>
          <path d="M6.5 9.5a5.5 5.5 0 1111 0v3.1c0 .7.2 1.4.6 2l1 1.5c.5.8-.1 1.9-1.1 1.9H6c-1 0-1.6-1.1-1.1-1.9l1-1.5c.4-.6.6-1.3.6-2V9.5zM10 19a2 2 0 004 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "contacts":
      return (
        <svg {...commonProps}>
          <path d="M16 19a4 4 0 00-8 0M12 13a4 4 0 100-8 4 4 0 000 8zm8 6a4 4 0 00-6-3.5M18 11a3 3 0 100-6 3 3 0 000 6zM4 17.5A4 4 0 0110 14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "emails":
      return (
        <svg {...commonProps}>
          <path d="M4 7h16v10H4zM4 8l8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "pipeline":
      return (
        <svg {...commonProps}>
          <path d="M4 7h4v10H4zM10 11h4v6h-4zM16 5h4v12h-4z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "tasks":
      return (
        <svg {...commonProps}>
          <path d="M9 7h11M9 12h11M9 17h11M4 7h.01M4 12h.01M4 17h.01" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "reports":
      return (
        <svg {...commonProps}>
          <path d="M5 19V9M12 19V5M19 19v-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "automation":
      return (
        <svg {...commonProps}>
          <path d="M12 3l1.8 4.6L18 9.4l-4.2 1.8L12 16l-1.8-4.8L6 9.4l4.2-1.8L12 3zm6 12l.8 2 .2.2 2 .8-2 .8-.2.2-.8 2-.8-2-.2-.2-2-.8 2-.8.2-.2.8-2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "users":
      return (
        <svg {...commonProps}>
          <path d="M16 19a4 4 0 00-8 0M12 13a4 4 0 100-8 4 4 0 000 8z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { currentOrg } = useOrg();
  const navigate = useNavigate();
  const visibleNavigation = navigation
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => hasAnyRole(user?.role, item.roles)),
    }))
    .filter((section) => section.items.length > 0);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = String(user?.name || "O")
    .split(" ")
    .map((part) => part[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="hidden-scrollbar w-full rounded-[28px] border border-white/10 bg-slate-900/75 p-4 shadow-soft backdrop-blur-sm sm:p-5 xl:sticky xl:top-6 xl:max-h-[calc(100vh-3rem)] xl:w-72 xl:self-start xl:overflow-y-auto">
      <div className="mb-5 space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
          Customer Relationship Platform
        </p>
        <div className="rounded-[26px] border border-brand-500/20 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_36%),linear-gradient(160deg,rgba(2,6,23,0.96),rgba(15,23,42,0.92))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] uppercase tracking-[0.28em] text-brand-100/70">
              Workspace
            </p>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-brand-400/20 bg-brand-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-100">
                SaaS
              </span>
              <NotificationBell buttonClassName="h-9  rounded-xl border-white/10 bg-white/5 shadow-sm hover:border-white/25 hover:bg-white/10" />
            </div>
          </div>
          {/* <h1 className="mt-2 text-[1.6rem] font-semibold leading-none text-white sm:text-[1.75rem] xl:text-[1.9rem]">
            {currentOrg?.name || "Orbit CRM"}
          </h1> */}
          <p className="mt-4 border-t border-white/10 pt-3 text-xs leading-5 text-slate-300 sm:text-sm">
            Secure, company-specific workspaces with admin-controlled users and roles.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-gradient-to-br from-white/7 to-white/[0.03] p-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-brand-500/15 text-sm font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{user?.name}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-400">
              {user?.role} · {currentOrg?.name || "Workspace"}
            </p>
          </div>
        </div>

        <div className="pb-1">
          <OrganizationSwitcher />
        </div>
      </div>

      <nav className="space-y-4 pb-5">
        {visibleNavigation.map((section) => (
          <div key={section.group}>
            <p className="mb-2 px-2 text-[11px] uppercase tracking-[0.24em] text-slate-500">
              {section.group}
            </p>
            <div className="space-y-2">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                      isActive
                        ? "border border-brand-400/20 bg-gradient-to-r from-brand-500/95 to-brand-400/90 text-white shadow-lg shadow-brand-950/30"
                        : "border border-transparent text-slate-300 hover:border-white/5 hover:bg-white/5 hover:text-white",
                    ].join(" ")
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={[
                          "flex h-10 w-10 items-center justify-center rounded-2xl transition",
                          isActive
                            ? "bg-slate-950/15 text-white ring-1 ring-white/10"
                            : "bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white",
                        ].join(" ")}
                      >
                        {renderIcon(item.icon)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate">{item.label}</span>
                      </div>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-8">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/5 hover:text-white"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-4 w-4 shrink-0 fill-none stroke-current stroke-[1.8]"
          >
            <path
              d="M15 17l5-5-5-5M20 12H9M12 19H6a2 2 0 01-2-2V7a2 2 0 012-2h6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
