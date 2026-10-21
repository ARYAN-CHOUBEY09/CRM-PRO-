const formatDateTime = (value) =>
  new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const RecentActivityCard = ({ activities }) => {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
        Activity
      </p>
      <h3 className="mt-2 text-2xl font-semibold text-white">
        Recent CRM movement
      </h3>

      <div className="mt-6 space-y-4">
        {activities.length === 0 ? (
          <p className="text-sm text-slate-400">No activity is available yet.</p>
        ) : (
          activities.map((activity) => (
            <article
              key={activity.id}
              className="rounded-[22px] border border-white/10 bg-slate-950/40 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="break-words text-sm font-medium text-white">
                    {activity.message}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                    {activity.entityType} • {activity.action}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">
                  {formatDateTime(activity.createdAt)}
                </span>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
};

export default RecentActivityCard;
