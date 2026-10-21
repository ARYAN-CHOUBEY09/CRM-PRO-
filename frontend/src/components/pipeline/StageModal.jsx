import { useEffect, useState } from "react";

const StageModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  errorMessage,
  stageCount,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    color: "#2563eb",
    order: stageCount,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        color: "#2563eb",
        order: stageCount,
      });
    }
  }, [isOpen, stageCount]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: name === "order" ? Number(value) : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8 backdrop-blur">
      <div className="w-full max-w-xl rounded-[30px] border border-white/10 bg-slate-900 p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
              Pipeline Stage
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">
              Add custom stage
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5"
          >
            Close
          </button>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Stage name"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
          />
          <div className="grid gap-4 md:grid-cols-2">
            <input
              name="color"
              type="color"
              value={formData.color}
              onChange={handleChange}
              className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-2 py-2"
            />
            <input
              name="order"
              type="number"
              min="0"
              value={formData.order}
              onChange={handleChange}
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
            />
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </div>
          ) : null}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-white/10 px-5 py-3 text-sm text-slate-200 transition hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Add Stage"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StageModal;

