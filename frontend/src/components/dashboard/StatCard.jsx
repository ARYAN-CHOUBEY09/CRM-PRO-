const StatCard = ({ label, value, caption, accent }) => {
  return (
    <article className="group overflow-hidden rounded-[24px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition hover:border-white/15 hover:bg-white/[0.07]">
      <div className="flex items-start justify-between gap-4">
        <div
          className="mb-4 h-1.5 w-16 rounded-full"
          style={{ backgroundColor: accent }}
        />
        <div
          className="h-10 w-10 rounded-2xl opacity-80 transition group-hover:scale-105"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${accent}, rgba(255,255,255,0.06))`,
          }}
        />
      </div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 break-words text-2xl font-semibold text-white sm:text-3xl">{value}</p>
      <p className="mt-2 text-[11px] uppercase tracking-[0.24em] text-slate-500">
        {caption}
      </p>
    </article>
  );
};

export default StatCard;
