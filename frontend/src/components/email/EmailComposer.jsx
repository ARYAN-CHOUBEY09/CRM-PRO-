import { useEffect, useState } from "react";

const supportedPlaceholders = [
  "{{firstName}}",
  "{{lastName}}",
  "{{fullName}}",
  "{{company}}",
  "{{email}}",
  "{{senderName}}",
];

const createSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const EmailComposer = ({
  templates,
  contacts,
  onSendSingle,
  onSendBulk,
  onCreateTemplate,
  isSending,
  isGeneratingAi,
  errorMessage,
  successMessage,
  canManageTemplates,
  onGenerateAiDraft,
}) => {
  const [mode, setMode] = useState("single");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedContactId, setSelectedContactId] = useState("");
  const [selectedContactIds, setSelectedContactIds] = useState([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [aiGoal, setAiGoal] = useState("");
  const [aiTone, setAiTone] = useState("professional sales");
  const [templateForm, setTemplateForm] = useState({
    name: "",
    slug: "",
    subject: "",
    body: "",
  });

  useEffect(() => {
    const defaultTemplate = templates[0];
    if (defaultTemplate) {
      setSelectedTemplateId(defaultTemplate.id);
      setSubject(defaultTemplate.subject);
      setBody(defaultTemplate.body);
    }

    if (contacts[0]) {
      setSelectedContactId(contacts[0].id);
    }
  }, [templates, contacts]);

  const handleTemplateChange = (templateId) => {
    setSelectedTemplateId(templateId);
    const template = templates.find((item) => item.id === templateId);

    if (template) {
      setSubject(template.subject);
      setBody(template.body);
    }
  };

  const toggleContactSelection = (contactId) => {
    setSelectedContactIds((current) =>
      current.includes(contactId)
        ? current.filter((id) => id !== contactId)
        : [...current, contactId],
    );
  };

  const handleCreateTemplate = async (event) => {
    event.preventDefault();
    await onCreateTemplate({
      ...templateForm,
      slug: templateForm.slug || createSlug(templateForm.name),
    });
    setTemplateForm({
      name: "",
      slug: "",
      subject: "",
      body: "",
    });
  };

  const handleSend = async (event) => {
    event.preventDefault();

    if (mode === "single") {
      await onSendSingle({
        contactId: selectedContactId,
        templateId: selectedTemplateId || null,
        subject,
        body,
      });
      return;
    }

    await onSendBulk({
      contactIds: selectedContactIds,
      templateId: selectedTemplateId || null,
      subject,
      body,
    });
  };

  const handleGenerateAi = async () => {
    const targetContactId =
      mode === "single" ? selectedContactId : selectedContactIds[0];

    if (!targetContactId) {
      return;
    }

    const draft = await onGenerateAiDraft({
      contactId: targetContactId,
      tone: aiTone,
      goal: aiGoal,
      mode,
    });

    setSubject(draft.subject || "");
    setBody(draft.body || "");
  };

  return (
    <div className={`grid gap-6 ${canManageTemplates ? "xl:grid-cols-[1.2fr_0.8fr]" : ""}`}>
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
              Email Composer
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">
              Send single or bulk email
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-1">
            <button
              type="button"
              onClick={() => setMode("single")}
              className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                mode === "single"
                  ? "bg-brand-500 text-white"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              Single
            </button>
            <button
              type="button"
              onClick={() => setMode("bulk")}
              className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                mode === "bulk"
                  ? "bg-brand-500 text-white"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              Bulk
            </button>
          </div>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSend}>
          <div className="rounded-[24px] border border-brand-400/15 bg-brand-500/10 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.2em] text-brand-100/80">
                  Groq AI Draft
                </p>
                <input
                  value={aiGoal}
                  onChange={(event) => setAiGoal(event.target.value)}
                  placeholder="Example: Write a follow-up after product demo"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500"
                />
              </div>
              <select
                value={aiTone}
                onChange={(event) => setAiTone(event.target.value)}
                className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white"
              >
                <option value="professional sales">Professional sales</option>
                <option value="formal">Formal</option>
                <option value="friendly">Friendly</option>
                <option value="short and direct">Short and direct</option>
              </select>
              <button
                type="button"
                onClick={handleGenerateAi}
                disabled={
                  isGeneratingAi ||
                  contacts.length === 0 ||
                  (mode === "single" ? !selectedContactId : selectedContactIds.length === 0)
                }
                className="rounded-2xl border border-brand-400/20 bg-slate-950/50 px-4 py-3 text-sm font-semibold text-brand-100 transition hover:bg-brand-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isGeneratingAi ? "Generating..." : "Generate with AI"}
              </button>
            </div>
          </div>

          <select
            value={selectedTemplateId}
            onChange={(event) => handleTemplateChange(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white"
          >
            {templates.length === 0 ? (
              <option value="">No templates available</option>
            ) : null}
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>

          {mode === "single" ? (
            <select
              value={selectedContactId}
              onChange={(event) => setSelectedContactId(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white"
            >
              {contacts.length === 0 ? (
                <option value="">No contacts available</option>
              ) : null}
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.fullName} - {contact.email}
                </option>
              ))}
            </select>
          ) : (
            <div className="rounded-[24px] border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm font-medium text-white">Select recipients</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {contacts.map((contact) => (
                  <label
                    key={contact.id}
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
                  >
                    <input
                      type="checkbox"
                      checked={selectedContactIds.includes(contact.id)}
                      onChange={() => toggleContactSelection(contact.id)}
                      className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-950/70"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-white">
                        {contact.fullName}
                      </span>
                      <span className="block truncate text-xs text-slate-400">
                        {contact.email}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Subject"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500"
          />

          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows="9"
            placeholder="Email body"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500"
          />

          <div className="rounded-2xl border border-brand-400/15 bg-brand-500/10 px-4 py-3 text-xs text-brand-100">
            <p className="mb-2 font-medium uppercase tracking-[0.18em] text-brand-50">
              Supported placeholders
            </p>
            <div className="flex flex-wrap gap-2">
              {supportedPlaceholders.map((placeholder) => (
                <span
                  key={placeholder}
                  className="rounded-full border border-brand-300/20 bg-slate-950/40 px-3 py-1 font-mono text-[11px] text-brand-100"
                >
                  {placeholder}
                </span>
              ))}
            </div>
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {successMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={
              isSending ||
              contacts.length === 0 ||
              (mode === "single" ? !selectedContactId : selectedContactIds.length === 0)
            }
            className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSending ? "Sending..." : mode === "single" ? "Send Email" : "Send Bulk Email"}
          </button>
        </form>
      </section>

      {canManageTemplates ? (
        <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
            Template Studio
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-white">
            Create reusable template
          </h3>

          <form className="mt-6 space-y-4" onSubmit={handleCreateTemplate}>
            <input
              value={templateForm.name}
              onChange={(event) =>
                setTemplateForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Template name"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500"
            />
            <input
              value={templateForm.slug}
              onChange={(event) =>
                setTemplateForm((current) => ({
                  ...current,
                  slug: event.target.value,
                }))
              }
              placeholder="Template slug"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500"
            />
            <input
              value={templateForm.subject}
              onChange={(event) =>
                setTemplateForm((current) => ({
                  ...current,
                  subject: event.target.value,
                }))
              }
              placeholder="Template subject"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500"
            />
            <textarea
              value={templateForm.body}
              onChange={(event) =>
                setTemplateForm((current) => ({
                  ...current,
                  body: event.target.value,
                }))
              }
              rows="7"
              placeholder="Template body"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="w-full rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/5"
            >
              Save Template
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
};

export default EmailComposer;
