import { useEffect, useState } from "react";

const DealModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  errorMessage,
  contacts,
  stages,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    value: "",
    currency: "USD",
    contact: "",
    stage: "",
    expectedCloseDate: "",
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        value: "",
        currency: "USD",
        contact: contacts[0]?.id || "",
        stage: stages[0]?.id || "",
        expectedCloseDate: "",
        notes: "",
      });
    }
  }, [isOpen, contacts, stages]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      ...formData,
      value: Number(formData.value),
      expectedCloseDate: formData.expectedCloseDate || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8 backdrop-blur">
      <div className="w-full max-w-2xl rounded-[30px] border border-white/10 bg-slate-900 p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
              Sales Pipeline
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">
              Create new deal
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

        <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Deal title"
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 md:col-span-2"
          />
          <input
            name="value"
            type="number"
            min="0"
            value={formData.value}
            onChange={handleChange}
            placeholder="Deal value"
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
          />
          <input
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            placeholder="Currency"
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm uppercase text-white outline-none placeholder:text-slate-500"
          />
          <select
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
          >
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.fullName} {contact.company ? `- ${contact.company}` : ""}
              </option>
            ))}
          </select>
          <select
            name="stage"
            value={formData.stage}
            onChange={handleChange}
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
          >
            {stages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </select>
          <input
            name="expectedCloseDate"
            type="date"
            value={formData.expectedCloseDate}
            onChange={handleChange}
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none md:col-span-2"
          />
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            placeholder="Notes"
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 md:col-span-2"
          />

          {errorMessage ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 md:col-span-2">
              {errorMessage}
            </div>
          ) : null}

          <div className="flex justify-end gap-3 md:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-white/10 px-5 py-3 text-sm text-slate-200 transition hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || contacts.length === 0 || stages.length === 0}
              className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creating..." : "Create Deal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DealModal;

