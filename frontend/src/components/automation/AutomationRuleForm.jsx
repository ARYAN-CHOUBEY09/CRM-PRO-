import { useMemo, useState } from "react";

const presets = {
  contact_age_days: {
    actionType: "send_email",
    label: "Auto email after X days",
  },
  new_unassigned_lead: {
    actionType: "assign_contact",
    label: "Auto assign new lead",
  },
  overdue_task: {
    actionType: "log_activity",
    label: "Overdue task follow-up",
  },
  lead_created: {
    actionType: "assign_and_whatsapp",
    label: "Lead created → FB Ads → Assign + WhatsApp",
  },
  contact_updated: {
    actionType: "assign_and_whatsapp",
    label: "Lead updated → FB Ads → Assign + WhatsApp",
  },
};

const AutomationRuleForm = ({ users, onSubmit, isSubmitting, errorMessage }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    triggerType: "contact_age_days",
    actionType: "send_email",
    isActive: true,
    config: {
      delayDays: 2,
      subject: "Quick follow up for {{company}}",
      body:
        "Hi {{firstName}},\n\nJust checking in after a few days. Let us know if you would like to continue the discussion.\n\nRegards,\n{{senderName}}",
      assigneeId: "",
      matchSource: "Facebook Ads",
      whatsappMessage:
        "Hi {{name}}, thanks for reaching out from Facebook. Our rep will contact you shortly.",
    },
  });

  const isEmailRule = formData.triggerType === "contact_age_days";
  const isAssignmentRule = formData.triggerType === "new_unassigned_lead";
  const isLeadCreatedRule = formData.triggerType === "lead_created";
  const isContactUpdatedRule = formData.triggerType === "contact_updated";

  const currentPreset = useMemo(
    () => presets[formData.triggerType],
    [formData.triggerType],
  );

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (name === "triggerType") {
      setFormData((current) => ({
        ...current,
        triggerType: value,
        actionType: presets[value].actionType,
      }));
      return;
    }

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleConfigChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      config: {
        ...current.config,
        [name]: name === "delayDays" ? Number(value) : value,
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(formData);
    setFormData({
      name: "",
      description: "",
      triggerType: "contact_age_days",
      actionType: "send_email",
      isActive: true,
      config: {
        delayDays: 2,
        subject: "Quick follow up for {{company}}",
        body:
          "Hi {{firstName}},\n\nJust checking in after a few days. Let us know if you would like to continue the discussion.\n\nRegards,\n{{senderName}}",
        assigneeId: "",
        matchSource: "Facebook Ads",
        whatsappMessage:
          "Hi {{name}}, thanks for reaching out from Facebook. Our rep will contact you shortly.",
      },
    });
  };

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
        Workflow Builder
      </p>
      <h3 className="mt-2 text-2xl font-semibold text-white">
        Create automation rule
      </h3>
      <p className="mt-2 text-sm text-slate-400">
        Use preset workflows to move repetitive work into smart, automated actions.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Automation name"
          className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500"
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          placeholder="Short description"
          className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500"
        />
        <div className="grid gap-4 md:grid-cols-2">
          <select
            name="triggerType"
            value={formData.triggerType}
            onChange={handleChange}
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white"
          >
            {Object.entries(presets).map(([value, preset]) => (
              <option key={value} value={value}>
                {preset.label}
              </option>
            ))}
          </select>
          <input
            value={currentPreset?.actionType || formData.actionType}
            readOnly
            className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm uppercase text-slate-300"
          />
        </div>

        {isEmailRule ? (
          <div className="space-y-4 rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
            <input
              name="delayDays"
              type="number"
              min="1"
              value={formData.config.delayDays}
              onChange={handleConfigChange}
              placeholder="Delay in days"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white"
            />
            <input
              name="subject"
              value={formData.config.subject}
              onChange={handleConfigChange}
              placeholder="Email subject"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white"
            />
            <textarea
              name="body"
              value={formData.config.body}
              onChange={handleConfigChange}
              rows="6"
              placeholder="Email body"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white"
            />
          </div>
        ) : null}

        {isAssignmentRule ? (
          <div className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
            <select
              name="assigneeId"
              value={formData.config.assigneeId}
              onChange={handleConfigChange}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white"
            >
              <option value="">Select sales assignee</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {isLeadCreatedRule || isContactUpdatedRule ? (
          <div className="space-y-4 rounded-[24px] border border-white/10 bg-slate-950/35 p-4">
            <label className="block space-y-2 text-sm text-slate-200">
              <span>Match Source (e.g., Facebook Ads)</span>
              <input
                name="matchSource"
                value={formData.config.matchSource}
                onChange={handleConfigChange}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white"
              />
            </label>
            <label className="block space-y-2 text-sm text-slate-200">
              <span>Assign to</span>
              <select
                name="assigneeId"
                value={formData.config.assigneeId}
                onChange={handleConfigChange}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white"
              >
                <option value="">Select assignee</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-2 text-sm text-slate-200">
              <span>WhatsApp message</span>
              <textarea
                name="whatsappMessage"
                rows="4"
                value={formData.config.whatsappMessage}
                onChange={handleConfigChange}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white"
              />
            </label>
          </div>
        ) : null}

        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 rounded border-white/20 bg-slate-950/70"
          />
          <span className="text-sm text-slate-200">Enable rule immediately</span>
        </label>

        {errorMessage ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Create Automation"}
        </button>
      </form>
    </section>
  );
};

export default AutomationRuleForm;
