const statusOptions = [
  { label: "All Statuses", value: "" },
  { label: "Lead", value: "lead" },
  { label: "Qualified", value: "qualified" },
  { label: "Proposal", value: "proposal" },
  { label: "Customer", value: "customer" },
  { label: "Lost", value: "lost" },
];

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Name A-Z", value: "name_asc" },
  { label: "Name Z-A", value: "name_desc" },
   { label: "Score High-Low", value: "score_desc" },
   { label: "Score Low-High", value: "score_asc" },
];

const ContactFilters = ({ filters, onChange, onReset }) => {
  return (
    <div className="grid gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 lg:grid-cols-[2fr_1fr_1fr_auto]">
      <input
        name="q"
        value={filters.q}
        onChange={onChange}
        placeholder="Search by name, email, company, phone"
        className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
      />
      <select
        name="status"
        value={filters.status}
        onChange={onChange}
        className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
      >
        {statusOptions.map((option) => (
          <option key={option.value || "all"} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select
        name="sort"
        value={filters.sort}
        onChange={onChange}
        className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={onReset}
        className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/5"
      >
        Reset
      </button>
    </div>
  );
};

export default ContactFilters;
