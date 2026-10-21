import { useState } from "react";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Never";

const UserAccessTable = ({
  users,
  currentUserId,
  onUpdate,
  isUpdating,
}) => {
  const [passwordDrafts, setPasswordDrafts] = useState({});

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
        Team Access
      </p>
      <h3 className="mt-2 text-2xl font-semibold text-white">
        Manage roles and account status
      </h3>
      <p className="mt-2 text-sm leading-7 text-slate-400">
        Manage role updates, account access, and password resets from one workspace.
      </p>

      <div className="mt-6 space-y-4">
        {users.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-white/10 bg-slate-950/25 p-8 text-sm text-slate-400">
            No team users have been created yet. Use the form on the left to create the first employee account.
          </div>
        ) : null}

        {users.map((user) => (
          <article
            key={user.id}
            className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4"
          >
            <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-start 2xl:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h4 className="text-lg font-semibold text-white">{user.name}</h4>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-300">
                    {user.role}
                  </span>
                  <span
                    className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${
                      user.isActive
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                        : "border-red-500/30 bg-red-500/10 text-red-200"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                  {user.id === currentUserId ? (
                    <span className="rounded-full border border-brand-400/20 bg-brand-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-brand-100">
                      Current Admin
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-slate-400">{user.email}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                  Created {formatDate(user.createdAt)} - Last login {formatDate(user.lastLoginAt)}
                </p>
              </div>

              <div className="grid gap-3 lg:grid-cols-2 2xl:w-[520px]">
                <select
                  defaultValue={user.role}
                  onChange={(event) =>
                    onUpdate(user.id, {
                      role: event.target.value,
                    })
                  }
                  disabled={isUpdating}
                  className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="sales">Sales</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>

                <button
                  type="button"
                  disabled={isUpdating || user.id === currentUserId}
                  onClick={() =>
                    onUpdate(user.id, {
                      isActive: !user.isActive,
                    })
                  }
                  className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {user.isActive ? "Deactivate" : "Activate"}
                </button>

                <input
                  type="password"
                  value={passwordDrafts[user.id] || ""}
                  onChange={(event) =>
                    setPasswordDrafts((current) => ({
                      ...current,
                      [user.id]: event.target.value,
                    }))
                  }
                  placeholder="New password"
                  className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 lg:col-span-2"
                />

                <button
                  type="button"
                  disabled={isUpdating || !passwordDrafts[user.id]}
                  onClick={async () => {
                    await onUpdate(user.id, {
                      password: passwordDrafts[user.id],
                    });
                    setPasswordDrafts((current) => ({
                      ...current,
                      [user.id]: "",
                    }));
                  }}
                  className="rounded-2xl border border-brand-400/20 bg-brand-500/10 px-4 py-3 text-sm text-brand-100 transition hover:bg-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50 lg:col-span-2"
                >
                  Reset Password
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default UserAccessTable;
