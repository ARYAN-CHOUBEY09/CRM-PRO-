import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { chatWithCopilot } from "../../services/aiService";

const promptMap = {
  "/": [
    "What needs attention on the dashboard today?",
    "Summarize the current business situation.",
    "What should the sales team focus on next?",
  ],
  "/contacts": [
    "Which contacts look most promising right now?",
    "What follow-up gaps do you see in my contacts?",
    "What should I do with recent leads?",
  ],
  "/pipeline": [
    "Which deals look risky right now?",
    "What is the next best action for the pipeline?",
    "Where is the pipeline getting stuck?",
  ],
  "/tasks": [
    "Which tasks need urgent attention?",
    "How should I prioritize my current workload?",
    "What overdue tasks are most risky?",
  ],
  "/emails": [
    "What outreach should I send today?",
    "Which leads deserve a follow-up email?",
    "How should I structure my next email push?",
  ],
  "/automation": [
    "Which workflow should I optimize next?",
    "What automation gaps do you notice?",
    "Where can automation save the most time?",
  ],
  "/users": [
    "How should I structure team access?",
    "What admin risks should I review?",
    "How can I improve account governance?",
  ],
  "/reports": [
    "What is the biggest performance story in these reports?",
    "Which metric needs attention first?",
    "What should leadership do next?",
  ],
  "/notifications": [
    "Which alerts should I handle first?",
    "What is the most urgent issue in my notifications?",
    "Summarize the current alert queue.",
  ],
  "/search": [
    "What patterns are visible across the workspace history?",
    "What should I investigate next?",
    "What does this search activity suggest?",
  ],
};

const labelMap = {
  "/": "Dashboard",
  "/contacts": "Contacts",
  "/pipeline": "Pipeline",
  "/tasks": "Tasks",
  "/emails": "Emails",
  "/automation": "Automation",
  "/users": "Admin Users",
  "/reports": "Reports",
  "/notifications": "Notifications",
  "/search": "Search",
};

const CrmCopilot = () => {
  const location = useLocation();
  const { token, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      answer:
        "I am your CRM Copilot. I can analyze the current workspace, highlight priorities, surface risks, and recommend next actions.",
      insights: [],
      followUps: [],
      focusArea: "",
      suggestedActions: [],
    },
  ]);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const pageContext = labelMap[location.pathname] || "Workspace";
  const suggestions = useMemo(
    () => promptMap[location.pathname] || promptMap["/"],
    [location.pathname],
  );

  const handleAsk = async (nextPrompt) => {
    const normalizedPrompt = String(nextPrompt || prompt).trim();

    if (!normalizedPrompt || isLoading) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: "user",
        text: normalizedPrompt,
      },
    ]);
    setPrompt("");
    setIsLoading(true);

    try {
      const response = await chatWithCopilot(token, {
        prompt: normalizedPrompt,
        pageContext,
        conversation: messages
          .slice(-6)
          .map((message) => ({
            role: message.role,
            text: message.role === "user" ? message.text : message.answer,
          })),
      });

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          answer: response.data.reply.answer,
          insights: response.data.reply.insights,
          followUps: response.data.reply.followUps,
          focusArea: response.data.reply.focusArea,
          suggestedActions: response.data.reply.suggestedActions,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          answer: error.message,
          insights: [],
          followUps: [],
          focusArea: "",
          suggestedActions: [],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-3 rounded-full border border-brand-300/40 bg-gradient-to-r from-brand-500 via-brand-400 to-cyan-400 px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:scale-[1.02] hover:opacity-95"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/20 ring-1 ring-white/20">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-4.5 w-4.5 fill-none stroke-current stroke-[1.8]"
          >
            <path
              d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18.5 14.5l.8 2 .2.2 2 .8-2 .8-.2.2-.8 2-.8-2-.2-.2-2-.8 2-.8.2-.2.8-2zM5.5 13l1 2.5.2.3 2.5 1-2.5 1-.2.3-1 2.5-1-2.5-.2-.3-2.5-1 2.5-1 .2-.3 1-2.5z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="flex flex-col items-start leading-none">
          <span className="text-[10px] uppercase tracking-[0.22em] text-white/75">
            Orbit AI
          </span>
          <span className="mt-1 text-sm font-semibold text-white">
            CRM Copilot
          </span>
        </span>
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.aside
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.2 }}
            className="fixed right-4 top-4 z-50 flex h-[calc(100vh-2rem)] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[30px] border border-white/10 bg-slate-950/95 shadow-soft backdrop-blur-xl"
          >
            <div className="border-b border-white/10 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-brand-100/75">
                    CRM Copilot
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">
                    {pageContext} Assistant
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Logged in as {user?.name} ({user?.role})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {suggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleAsk(item)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 transition hover:bg-brand-500/10"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {messages.map((message) =>
                message.role === "user" ? (
                  <div
                    key={message.id}
                    className="ml-auto max-w-[85%] rounded-[22px] border border-brand-400/20 bg-brand-500/10 px-4 py-3 text-sm text-brand-50"
                  >
                    {message.text}
                  </div>
                ) : (
                  <div
                    key={message.id}
                    className="max-w-[95%] rounded-[22px] border border-white/10 bg-white/5 p-4 text-sm text-slate-200"
                  >
                    <p className="leading-7">{message.answer}</p>

                    {message.focusArea ? (
                      <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-100/80">
                          Focus Area
                        </p>
                        <p className="mt-2 text-sm leading-6 text-cyan-50">
                          {message.focusArea}
                        </p>
                      </div>
                    ) : null}

                    {message.insights?.length ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {message.insights.map((item) => (
                          <span
                            key={item}
                            className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-100"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {message.suggestedActions?.length ? (
                      <div className="mt-4 space-y-2">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                          Suggested Actions
                        </p>
                        {message.suggestedActions.map((item) => (
                          <div
                            key={item}
                            className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {message.followUps?.length ? (
                      <div className="mt-4 space-y-2">
                        {message.followUps.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => handleAsk(item)}
                            className="block w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-left text-xs text-slate-300 transition hover:bg-white/5"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ),
              )}

              {isLoading ? (
                <div className="max-w-[95%] rounded-[22px] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  Copilot is analyzing your CRM data...
                </div>
              ) : null}
            </div>

            <form
              className="border-t border-white/10 p-4"
              onSubmit={(event) => {
                event.preventDefault();
                handleAsk(prompt);
              }}
            >
              <div className="flex gap-3">
                <input
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder={`Ask about ${pageContext.toLowerCase()}...`}
                  className="flex-1 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  disabled={isLoading || !prompt.trim()}
                  className="rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Ask
                </button>
              </div>
              <p className="mt-3 text-[11px] text-slate-500">
                Copilot is advisory only. It does not modify records without explicit workflow support.
              </p>
            </form>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default CrmCopilot;
