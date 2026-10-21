import { useOrg } from "../../features/org/OrgContext";

// Slim switcher: only show dropdown when more than one org to avoid duplicate "workspace" cards.
const OrganizationSwitcher = () => {
  const { organizations, currentOrg, setOrg } = useOrg();

  if (!currentOrg || organizations.length <= 1) {
    return null;
  }

  return (
    <div className="space-y-2 rounded-2xl border border-white/8 bg-white/[0.03] px-3.5 py-3">
      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Switch company</p>
      <select
        value={currentOrg.id}
        onChange={(event) => setOrg(event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none transition focus:border-brand-400/60 focus:ring-1 focus:ring-brand-500/40"
      >
        {organizations.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default OrganizationSwitcher;
