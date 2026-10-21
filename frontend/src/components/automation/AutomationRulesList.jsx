const triggerLabels = {
  contact_age_days: "Auto email after X days",
  new_unassigned_lead: "Auto assign new lead",
  overdue_task: "Overdue task follow-up",
};

const AutomationRulesList = ({ rules, onToggle, onRun, onDelete }) => {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
        Active Rules
      </p>
      <h3 className="mt-2 text-2xl font-semibold text-white">
        Automation control center
      </h3>

      <div className="mt-6 space-y-4">
        {rules.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-white/10 bg-slate-950/30 p-6 text-sm text-slate-400">
            No automation rules have been created yet.
          </div>
        ) : (
          rules.map((rule) => (
            <article
              key={rule.id}
              className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-lg font-semibold text-white">{rule.name}</h4>
                    <span
                      className={`rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] ${
                        rule.isActive
                          ? "border-emerald-400/20 bg-emerald-500/15 text-emerald-200"
                          : "border-slate-400/20 bg-slate-500/15 text-slate-200"
                      }`}
                    >
                      {rule.isActive ? "active" : "paused"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{rule.description || "No description"}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                    {triggerLabels[rule.triggerType] || rule.triggerType} • {rule.actionType}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Last run: {rule.lastRunAt ? new Date(rule.lastRunAt).toLocaleString() : "Never"}
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-3 lg:w-[300px]">
                  <button
                    type="button"
                    onClick={() => onToggle(rule)}
                    className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
                  >
                    {rule.isActive ? "Pause" : "Activate"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onRun(rule.id)}
                    className="rounded-2xl border border-brand-400/20 bg-brand-500/10 px-4 py-2 text-sm text-brand-100 transition hover:bg-brand-500/20"
                  >
                    Run Now
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(rule.id)}
                    className="rounded-2xl border border-red-500/20 px-4 py-2 text-sm text-red-200 transition hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
};

export default AutomationRulesList;
