import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { searchWorkspace } from "../../services/searchService";

const sectionOrder = ["contacts", "deals", "tasks", "users", "activities"];

const labelMap = {
  contacts: "Contacts",
  deals: "Deals",
  tasks: "Tasks",
  users: "Users",
  activities: "Activity",
};

const GlobalSearchBar = () => {
  const { token } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sections = useMemo(() => {
    if (!results) {
      return [];
    }

    return sectionOrder
      .map((key) => ({
        key,
        label: labelMap[key],
        items: results[key] || [],
      }))
      .filter((section) => section.items.length > 0);
  }, [results]);

  const handleSearch = async (nextQuery) => {
    const normalizedQuery = String(nextQuery || "").trim();
    setQuery(nextQuery);

    if (normalizedQuery.length < 2) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await searchWorkspace(token, normalizedQuery);
      setResults(response.data.results);
      setIsOpen(true);
    } catch (error) {
      setResults(null);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-3 rounded-[28px] border border-white/10 bg-gradient-to-r from-slate-950/85 via-slate-900/85 to-slate-950/80 p-3 shadow-soft backdrop-blur-sm">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-5 w-5 fill-none stroke-slate-300 stroke-[1.8]"
          >
            <path
              d="M21 21l-4.3-4.3m1.8-5.2a7 7 0 11-14 0 7 7 0 0114 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <input
          value={query}
          onChange={(event) => handleSearch(event.target.value)}
          onFocus={() => {
            if (sections.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder="Search contacts, deals, tasks, users, or activity"
          className="min-w-0 flex-1 rounded-2xl border border-white/5 bg-slate-950/55 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-brand-400/30"
        />
        <div className="hidden shrink-0 sm:flex">
          {isLoading ? (
            <span className="rounded-2xl border border-brand-400/20 bg-brand-500/10 px-4 py-3 text-[11px] font-medium uppercase tracking-[0.24em] text-brand-100">
              Searching
            </span>
          ) : (
            <span className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[11px] uppercase tracking-[0.24em] text-slate-400">
               Search
            </span>
          )}
        </div>
      </div>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-30 max-h-[70vh] overflow-y-auto rounded-[30px] border border-white/10 bg-slate-950/96 p-4 shadow-soft backdrop-blur-xl">
          {sections.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
              No matching workspace records were found.
            </div>
          ) : (
            <div className="space-y-5">
              {sections.map((section) => (
                <div key={section.key}>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    {section.label}
                  </p>
                  <div className="mt-3 space-y-2">
                    {section.items.map((item) => (
                      <Link
                        key={`${section.key}-${item.id}`}
                        to={item.route}
                        onClick={() => {
                          setIsOpen(false);
                          setQuery("");
                          setResults(null);
                        }}
                        className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
                      >
                        <p className="text-sm font-medium text-white">{item.label}</p>
                        <p className="mt-1 text-xs text-slate-400">{item.meta}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default GlobalSearchBar;
