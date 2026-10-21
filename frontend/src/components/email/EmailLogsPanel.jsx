const formatDateTime = (value) =>
  new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const EmailLogsPanel = ({ logs, isLoading }) => {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
            Email Logs
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-white">
            Delivery history
          </h3>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <div className="text-sm text-slate-300">Loading email logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-sm text-slate-400">No email logs are available yet.</div>
        ) : (
          logs.map((log) => (
            <article
              key={log.id}
              className="rounded-[22px] border border-white/10 bg-slate-950/40 p-4"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">{log.subject}</p>
                  <p className="mt-1 truncate text-xs text-slate-400">
                    {log.recipients.map((recipient) => recipient.email).join(", ")}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                    {log.template?.name || "Manual email"} • {log.provider}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] ${
                      log.status === "sent"
                        ? "border-emerald-400/20 bg-emerald-500/15 text-emerald-200"
                        : log.status === "failed"
                          ? "border-red-400/20 bg-red-500/15 text-red-200"
                          : "border-slate-400/20 bg-slate-500/15 text-slate-200"
                    }`}
                  >
                    {log.status}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatDateTime(log.createdAt)}
                  </span>
                </div>
              </div>
              {log.errorMessage ? (
                <p className="mt-3 text-xs text-red-300">{log.errorMessage}</p>
              ) : null}
            </article>
          ))
        )}
      </div>
    </section>
  );
};

export default EmailLogsPanel;
