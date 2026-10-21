const badgeClasses = {
  lead: "bg-sky-500/15 text-sky-200 border-sky-400/20",
  qualified: "bg-emerald-500/15 text-emerald-200 border-emerald-400/20",
  proposal: "bg-amber-500/15 text-amber-200 border-amber-400/20",
  customer: "bg-violet-500/15 text-violet-200 border-violet-400/20",
  lost: "bg-rose-500/15 text-rose-200 border-rose-400/20",
};

const scoreBadgeClasses = {
  A: "bg-emerald-500/15 text-emerald-100 border-emerald-400/30",
  B: "bg-sky-500/15 text-sky-100 border-sky-400/30",
  C: "bg-amber-500/15 text-amber-100 border-amber-400/30",
  D: "bg-rose-500/15 text-rose-100 border-rose-400/30",
};

const ContactsTable = ({
  contacts,
  isLoading,
  onEdit,
  onDelete,
  onGenerateAiSummary,
  onRescore,
  aiLoadingContactId,
  rescoreLoadingId,
  pagination,
  onPageChange,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-300">
        Loading contacts...
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-white/10 bg-white/5 p-10 text-center">
        <h3 className="text-xl font-semibold text-white">No contacts found</h3>
        <p className="mt-2 text-sm text-slate-400">
          Filters reset karke ya new contact create karke list fill kar sakte ho.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/40">
      <table className="min-w-full divide-y divide-white/10 text-left">
        <thead className="bg-white/5 text-xs uppercase tracking-[0.25em] text-slate-400">
          <tr>
            <th className="px-6 py-4">Contact</th>
            <th className="px-6 py-4">Company</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Score</th>
            <th className="px-6 py-4">Tags</th>
            <th className="px-6 py-4">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10 text-sm text-slate-200">
          {contacts.map((contact) => (
            <tr key={contact.id}>
              <td className="px-6 py-4">
                <div>
                  <p className="font-medium text-white">{contact.fullName}</p>
                  <p className="mt-1 text-xs text-slate-400">{contact.email}</p>
                  {contact.phone ? (
                    <p className="mt-1 text-xs text-slate-500">{contact.phone}</p>
                  ) : null}
                </div>
              </td>
              <td className="px-6 py-4">
                <p>{contact.company || "No company"}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {contact.jobTitle || "No title"}
                </p>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize ${badgeClasses[contact.status]}`}>
                  {contact.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${scoreBadgeClasses[contact.scoreBand || "D"]}`}>
                    {contact.score ?? 0}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                    Band {contact.scoreBand || "D"}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-2">
                  {contact.tags.length > 0 ? (
                    contact.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">No tags</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => onGenerateAiSummary(contact)} disabled={aiLoadingContactId === contact.id} className="rounded-2xl border border-brand-400/20 bg-brand-500/10 px-4 py-2 text-xs font-medium text-brand-100 transition hover:bg-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50">
                    {aiLoadingContactId === contact.id ? "Generating..." : "AI Summary"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onRescore(contact.id)}
                    disabled={rescoreLoadingId === contact.id}
                    className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {rescoreLoadingId === contact.id ? "Scoring..." : "Rescore"}
                  </button>
                  <button type="button" onClick={() => onEdit(contact)} className="rounded-2xl border border-white/10 px-4 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/5">
                    Edit
                  </button>
                  <button type="button" onClick={() => onDelete(contact.id)} className="rounded-2xl border border-red-500/20 px-4 py-2 text-xs font-medium text-red-200 transition hover:bg-red-500/10">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex flex-col gap-4 border-t border-white/10 bg-white/5 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-slate-400">
          Page {pagination.page} of {pagination.pages} | Total {pagination.total} contacts
        </p>
        <div className="flex gap-3">
          <button type="button" disabled={pagination.page <= 1} onClick={() => onPageChange(pagination.page - 1)} className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50">
            Previous
          </button>
          <button type="button" disabled={pagination.page >= pagination.pages} onClick={() => onPageChange(pagination.page + 1)} className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactsTable;
