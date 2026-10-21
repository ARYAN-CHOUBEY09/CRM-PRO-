import { useMemo, useState } from "react";

const filters = [
  { label: "All", value: "all" },
  { label: "Success", value: "success" },
  { label: "Failed", value: "failed" },
  { label: "Other", value: "other" },
];

const statusBadge = (status) => {
  if (status === "success") return "border-emerald-400/20 bg-emerald-500/15 text-emerald-200";
  if (status === "failed") return "border-red-400/20 bg-red-500/15 text-red-200";
  return "border-slate-400/20 bg-slate-500/15 text-slate-200";
};

const AutomationExecutionList = ({ executions }) => {
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const list = useMemo(() => {
    return executions
      .filter((item) => {
        if (status === "all") return true;
        if (status === "other") return !["success", "failed"].includes(item.status);
        return item.status === status;
      })
      .filter((item) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          item.message?.toLowerCase().includes(q) ||
          item.rule?.name?.toLowerCase().includes(q) ||
          item.entityType?.toLowerCase().includes(q)
        );
      });
  }, [executions, status, search]);

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Execution Logs</p>
          <h3 className="mt-1 text-2xl font-semibold text-white">Automation history</h3>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search message or rule"
          className="w-full max-w-xs rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatus(f.value)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] transition ${
              status === f.value
                ? "border-brand-400/30 bg-brand-500/20 text-white"
                : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {list.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-white/10 bg-slate-950/30 p-6 text-sm text-slate-400">
            No automation runs match the filters.
          </div>
        ) : (
          list.map((execution) => (
            <article
              key={execution.id}
              className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">{execution.message}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                    {execution.rule?.name || "Automation"} • {execution.entityType}
                  </p>
                  {execution.metadata ? (
                    <p className="mt-1 text-[11px] text-slate-500">
                      {JSON.stringify(execution.metadata)}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] ${statusBadge(
                      execution.status,
                    )}`}
                  >
                    {execution.status}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(execution.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
};

export default AutomationExecutionList;
