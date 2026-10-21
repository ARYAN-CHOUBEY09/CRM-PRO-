const formatDateTime = (value) =>
  new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const ActivityTimeline = ({ activities, isLoading }) => {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:p-5 2xl:sticky 2xl:top-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
            Activity Timeline
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            Recent CRM actions
          </h3>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <div className="text-sm text-slate-300">Loading activities...</div>
        ) : activities.length === 0 ? (
          <div className="text-sm text-slate-400">No activity has been logged yet.</div>
        ) : (
          activities.map((activity) => (
            <article
              key={activity.id}
              className="rounded-[22px] border border-white/10 bg-slate-950/40 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="break-words text-sm font-medium leading-6 text-white">
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

export default ActivityTimeline;
