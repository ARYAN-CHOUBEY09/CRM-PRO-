const ChartCard = ({ title, subtitle, children }) => {
  return (
    <section className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:p-5">
      <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
        {subtitle}
      </p>
      <h3 className="mt-2 text-xl font-semibold text-white sm:text-2xl">{title}</h3>
      <div className="mt-5 min-h-[280px] sm:min-h-[300px]">{children}</div>
    </section>
  );
};

export default ChartCard;
