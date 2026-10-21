const TaskFilters = ({ filters, onChange, onReset }) => {
  return (
    <div className="grid gap-3 rounded-[28px] border border-white/10 bg-white/5 p-3 backdrop-blur-sm sm:gap-4 sm:p-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(170px,0.8fr)_minmax(170px,0.8fr)_auto]">
      <input
        name="q"
        value={filters.q}
        onChange={onChange}
        placeholder="Search tasks by title or description"
        className="min-w-0 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500"
      />
      <select
        name="status"
        value={filters.status}
        onChange={onChange}
        className="min-w-0 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 pr-10 text-sm text-white"
      >
        <option value="">All Statuses</option>
        <option value="todo">To Do</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="overdue">Overdue</option>
      </select>
      <select
        name="priority"
        value={filters.priority}
        onChange={onChange}
        className="min-w-0 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 pr-10 text-sm text-white"
      >
        <option value="">All Priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>
      <button
        type="button"
        onClick={onReset}
        className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/5 xl:min-w-[96px]"
      >
        Reset
      </button>
    </div>
  );
};

export default TaskFilters;
