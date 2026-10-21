const formatCurrency = (value, currency) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);

const PipelineBoard = ({
  stages,
  deals,
  draggedDealId,
  onDragStart,
  onDragEnd,
  onDropDeal,
  onDeleteDeal,
}) => {
  const dealsByStage = stages.map((stage) => ({
    ...stage,
    deals: deals.filter((deal) => String(deal.stage) === String(stage.id)),
  }));

  return (
    <div className="-mx-1 overflow-x-auto pb-2 [scrollbar-width:thin]">
      <div className="flex min-w-max snap-x snap-mandatory gap-4 px-1 sm:gap-5">
        {dealsByStage.map((stage) => {
          const totalValue = stage.deals.reduce(
            (sum, deal) => sum + deal.value,
            0,
          );

          return (
            <section
              key={stage.id}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => onDropDeal(stage.id)}
              className="min-h-[420px] w-[85vw] max-w-[320px] snap-start rounded-[28px] border border-white/10 bg-white/5 p-4 sm:w-[320px]"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <h3 className="truncate text-lg font-semibold text-white">
                      {stage.name}
                    </h3>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-400">
                    {stage.deals.length} deals
                  </p>
                </div>
                <div className="shrink-0 rounded-2xl border border-white/10 px-3 py-2 text-xs text-slate-300">
                  {formatCurrency(totalValue, "USD")}
                </div>
              </div>

              <div className="space-y-3">
                {stage.deals.map((deal) => (
                  <article
                    key={deal.id}
                    draggable
                    onDragStart={() => onDragStart(deal.id)}
                    onDragEnd={onDragEnd}
                    className={`cursor-grab rounded-[24px] border border-white/10 bg-slate-950/60 p-4 transition ${
                      draggedDealId === deal.id
                        ? "opacity-60"
                        : "hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="line-clamp-2 text-sm font-semibold text-white">
                          {deal.title}
                        </h4>
                        <p className="mt-1 truncate text-xs text-slate-400">
                          {deal.contact?.firstName} {deal.contact?.lastName}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteDeal(deal.id)}
                        className="shrink-0 rounded-full border border-red-500/20 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-red-200 transition hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>

                    <p className="mt-4 break-words text-lg font-semibold text-white sm:text-xl">
                      {formatCurrency(deal.value, deal.currency)}
                    </p>

                    <div className="mt-4 flex flex-col gap-1 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                      <span className="truncate">
                        {deal.contact?.company || "No company"}
                      </span>
                      <span>
                        {deal.expectedCloseDate
                          ? new Date(deal.expectedCloseDate).toLocaleDateString()
                          : "No close date"}
                      </span>
                    </div>
                  </article>
                ))}

                {stage.deals.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-white/10 p-5 text-center text-sm text-slate-500">
                    Drop the deal here
                  </div>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineBoard;
