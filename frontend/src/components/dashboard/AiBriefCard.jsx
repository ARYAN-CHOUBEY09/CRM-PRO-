const AiBriefCard = ({
  brief,
  isLoading,
  onGenerate,
}) => {
  return (
    <section className="overflow-hidden rounded-[28px] border border-brand-400/15 bg-gradient-to-br from-brand-500/10 via-slate-950/40 to-slate-900/60 p-5 backdrop-blur-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-brand-100/75">
            AI Executive Brief
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-white">
            Dashboard se direct leadership insight
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
            AI analyzes current CRM performance and returns top risks, recommended actions, and a revenue outlook.
          </p>
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={isLoading}
          className="rounded-2xl border border-brand-400/20 bg-slate-950/40 px-4 py-3 text-sm font-semibold text-brand-100 transition hover:bg-brand-500/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Generating..." : "Generate AI Brief"}
        </button>
      </div>

      {brief ? (
        <div className="mt-6 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Executive Brief
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-200">
              {brief.executiveBrief}
            </p>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Revenue Outlook
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                {brief.revenueOutlook}
              </p>
            </div>
          </article>

          <div className="grid gap-4">
            <article className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Attention Areas
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {brief.attentionAreas?.length ? (
                  brief.attentionAreas.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-100"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-400">No critical issues highlighted.</span>
                )}
              </div>
            </article>

            <article className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Recommended Actions
              </p>
              <div className="mt-3 space-y-3">
                {brief.recommendedActions?.length ? (
                  brief.recommendedActions.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
                    >
                      {item}
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-slate-400">No action recommendations available.</span>
                )}
              </div>
            </article>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-[24px] border border-dashed border-white/10 bg-slate-950/25 p-6 text-sm text-slate-400">
          Generate an AI brief to view the executive summary, key risks, and recommended actions here.
        </div>
      )}
    </section>
  );
};

export default AiBriefCard;
