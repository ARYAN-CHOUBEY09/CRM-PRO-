import { useState } from "react";

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "sales",
};

const UserCreateForm = ({ onSubmit, isSubmitting, errorMessage }) => {
  const [formData, setFormData] = useState(initialForm);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
    });
    setFormData(initialForm);
  };

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
        Admin Control
      </p>
      <h3 className="mt-2 text-2xl font-semibold text-white">
        Create login for team member
      </h3>
      <p className="mt-2 text-sm leading-7 text-slate-400">
        Create login credentials, assign a role, and provision secure access for each team member.
      </p>

      <div className="mt-5 rounded-[24px] border border-brand-400/15 bg-brand-500/10 p-4">
        <p className="text-xs uppercase tracking-[0.22em] text-brand-100/80">
          Provisioning Checklist
        </p>
        <div className="mt-3 space-y-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
            <p className="text-sm font-medium text-white">Step 1</p>
            <p className="mt-1 text-sm text-slate-400">Set work email as login ID</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
            <p className="text-sm font-medium text-white">Step 2</p>
            <p className="mt-1 text-sm text-slate-400">Choose role based on responsibility</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
            <p className="text-sm font-medium text-white">Step 3</p>
            <p className="mt-1 text-sm text-slate-400">Share password privately with employee</p>
          </div>
        </div>
      </div>

      <form className="mt-6 grid gap-4 xl:grid-cols-2" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Full name"
          className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Work email"
          className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Initial password"
          className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
        />
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
        >
          <option value="sales">Sales</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>

        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300 xl:col-span-2">
          <p className="font-medium text-white">Role Guide</p>
          <p className="mt-2 text-slate-400">
            Use `Sales` for day-to-day execution, `Manager` for team oversight and reporting,
            and `Admin` for full platform control.
          </p>
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 xl:col-span-2">
            {errorMessage}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 xl:col-span-2"
        >
          {isSubmitting ? "Creating User..." : "Create User Login"}
        </button>
      </form>
    </section>
  );
};

export default UserCreateForm;
