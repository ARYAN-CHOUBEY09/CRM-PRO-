import { useEffect, useState } from "react";

const createEmptyField = () => ({ key: "", value: "" });

const buildInitialForm = (contact) => ({
  firstName: contact?.firstName || "",
  lastName: contact?.lastName || "",
  email: contact?.email || "",
  phone: contact?.phone || "",
  company: contact?.company || "",
  jobTitle: contact?.jobTitle || "",
  status: contact?.status || "lead",
  source: contact?.source || "manual",
  notes: contact?.notes || "",
  tags: contact?.tags?.join(", ") || "",
  customFields:
    contact?.customFields?.length > 0
      ? contact.customFields
      : [createEmptyField()],
});

const ContactForm = ({
  contact,
  isOpen,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState(buildInitialForm(contact));

  useEffect(() => {
    if (isOpen) {
      setFormData(buildInitialForm(contact));
    }
  }, [contact, isOpen]);

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

  const handleCustomFieldChange = (index, key, value) => {
    setFormData((current) => ({
      ...current,
      customFields: current.customFields.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const addCustomField = () => {
    setFormData((current) => ({
      ...current,
      customFields: [...current.customFields, createEmptyField()],
    }));
  };

  const removeCustomField = (index) => {
    setFormData((current) => ({
      ...current,
      customFields:
        current.customFields.length === 1
          ? [createEmptyField()]
          : current.customFields.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/80 px-4 py-10 backdrop-blur">
      <div className="w-full max-w-4xl rounded-[30px] border border-white/10 bg-slate-900 p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
              Contact Form
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">
              {contact ? "Edit contact" : "Create new contact"}
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

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First name" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
            <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last name" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
            <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
            <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
            <input name="company" value={formData.company} onChange={handleChange} placeholder="Company" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
            <input name="jobTitle" value={formData.jobTitle} onChange={handleChange} placeholder="Job title" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
            <select name="status" value={formData.status} onChange={handleChange} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none">
              <option value="lead">Lead</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
              <option value="customer">Customer</option>
              <option value="lost">Lost</option>
            </select>
            <input name="source" value={formData.source} onChange={handleChange} placeholder="Source" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
          </div>

          <input name="tags" value={formData.tags} onChange={handleChange} placeholder="Separate tags with commas, for example: enterprise, priority lead" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />

          <textarea name="notes" value={formData.notes} onChange={handleChange} rows="4" placeholder="Notes" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />

          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-white">Custom Fields</h4>
                <p className="mt-1 text-xs text-slate-400">
                  Store structured metadata for this contact record.
                </p>
              </div>
              <button type="button" onClick={addCustomField} className="rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white">
                Add Field
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {formData.customFields.map((item, index) => (
                <div key={`${index}-${item.key}-${item.value}`} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <input value={item.key} onChange={(event) => handleCustomFieldChange(index, "key", event.target.value)} placeholder="Field name" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
                  <input value={item.value} onChange={(event) => handleCustomFieldChange(index, "value", event.target.value)} placeholder="Field value" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
                  <button type="button" onClick={() => removeCustomField(index)} className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-300 transition hover:bg-white/5">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/5">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? "Saving..." : contact ? "Update Contact" : "Create Contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
