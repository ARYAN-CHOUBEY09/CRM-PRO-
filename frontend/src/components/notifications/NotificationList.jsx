const formatDateTime = (value) =>
  new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const toneMap = {
  task_assigned: "border-brand-400/20 bg-brand-500/10 text-brand-100",
  task_updated: "border-cyan-400/20 bg-cyan-500/10 text-cyan-100",
  task_reminder: "border-amber-400/20 bg-amber-500/10 text-amber-100",
  task_overdue: "border-red-400/20 bg-red-500/10 text-red-100",
  lead_assigned: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
  automation: "border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-100",
  system: "border-white/10 bg-white/10 text-slate-200",
};

const labelMap = {
  task_assigned: "Task Assigned",
  task_updated: "Task Updated",
  task_reminder: "Reminder",
  task_overdue: "Overdue",
  lead_assigned: "Lead Assigned",
  automation: "Automation",
  system: "System",
};

const NotificationList = ({
  notifications,
  isLoading,
  onMarkRead,
}) => {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:p-5">
      
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
            Notifications
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            Alerts and reminders
          </h3>
        </div>
      </div>

      {/* 🔥 Scrollable container */}
      <div className="mt-6 space-y-4 max-h-[400px] overflow-y-auto pr-2">

        {isLoading ? (
          <div className="text-sm text-slate-300">
            Loading notifications...
          </div>

        ) : notifications.length === 0 ? (
          <div className="text-sm text-slate-400 text-center py-6">
            🚀 No new notifications
          </div>

        ) : (
          notifications.map((notification) => (
            <article
              key={notification.id}
              className={[
                "rounded-[22px] border p-4 transition",
                notification.isRead
                  ? "border-white/10 bg-slate-950/35"
                  : "border-brand-400/20 bg-brand-500/10",
              ].join(" ")}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                {/* 🔥 Content Fix */}
                <div className="min-w-0 w-full">

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={[
                        "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                        toneMap[notification.type] || toneMap.system,
                      ].join(" ")}
                    >
                      {labelMap[notification.type] || "Update"}
                    </span>

                    {!notification.isRead && (
                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                        New
                      </span>
                    )}
                  </div>

                  {/* 🔥 Title wrap fix */}
                  <h4 className="mt-3 text-base font-semibold text-white break-words">
                    {notification.title}
                  </h4>

                  {/* 🔥 Message wrap fix */}
                  <p className="mt-2 text-sm leading-7 text-slate-300 break-words whitespace-normal">
                    {notification.message}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>{formatDateTime(notification.createdAt)}</span>
                    {notification.actor?.name && (
                      <span>Triggered by {notification.actor.name}</span>
                    )}
                  </div>
                </div>

                {!notification.isRead && (
                  <button
                    type="button"
                    onClick={() => onMarkRead(notification.id)}
                    className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/5 hover:text-white whitespace-nowrap"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
};

export default NotificationList;