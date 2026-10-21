import { useEffect, useState } from "react";

const getReferenceId = (value) => value?.id || value?._id || "";

const buildInitialState = (task, users, contacts, deals) => ({
  title: task?.title || "",
  description: task?.description || "",
  status: task?.status || "todo",
  priority: task?.priority || "medium",
  assignedTo: getReferenceId(task?.assignedTo) || users[0]?.id || "",
  dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : "",
  reminderAt: task?.reminderAt ? task.reminderAt.slice(0, 16) : "",
  contact: getReferenceId(task?.contact) || contacts[0]?.id || "",
  deal: getReferenceId(task?.deal) || deals[0]?.id || "",
});

const TaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  errorMessage,
  users,
  contacts,
  deals,
  task,
}) => {
  const [formData, setFormData] = useState(
    buildInitialState(task, users, contacts, deals),
  );

  useEffect(() => {
    if (isOpen) {
      setFormData(buildInitialState(task, users, contacts, deals));
    }
  }, [isOpen, task, users, contacts, deals]);

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

    if (!formData.assignedTo) {
      return;
    }

    onSubmit({
      ...formData,
      dueDate: formData.dueDate || null,
      reminderAt: formData.reminderAt || null,
      contact: formData.contact || null,
      deal: formData.deal || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8 backdrop-blur">
      <div className="w-full max-w-3xl rounded-[30px] border border-white/10 bg-slate-900 p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
              Task Management
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">
              {task ? "Update task" : "Create task"}
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
            placeholder="Task title"
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 md:col-span-2"
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Task description"
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 md:col-span-2"
          />
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <select
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="" disabled>
              Select assignee
            </option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
          <input
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleChange}
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
          />
          <input
            name="reminderAt"
            type="datetime-local"
            value={formData.reminderAt}
            onChange={handleChange}
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
          />
          <select
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="">No linked contact</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.fullName}
              </option>
            ))}
          </select>
          <select
            name="deal"
            value={formData.deal}
            onChange={handleChange}
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none md:col-span-2"
          >
            <option value="">No linked deal</option>
            {deals.map((deal) => (
              <option key={deal.id} value={deal.id}>
                {deal.title}
              </option>
            ))}
          </select>

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
              disabled={isSubmitting || users.length === 0}
              className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : task ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
