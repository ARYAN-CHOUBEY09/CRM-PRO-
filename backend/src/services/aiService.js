const { env } = require("../config/env");

const normalizeValue = (value) => String(value || "").trim();

const generateEmailDraft = async ({
  contact,
  sender,
  mode = "single",
  tone = "professional sales",
  goal = "",
}) => {
  const apiKey = normalizeValue(env.groqApiKey);
  const model = normalizeValue(env.groqModel);

  if (!apiKey || !model) {
    throw new Error("Groq AI configuration is incomplete. Please update backend/.env");
  }

  const prompt = [
    "You are an expert CRM sales assistant for a US-market SaaS team.",
    `Write a ${tone} email draft.`,
    `Mode: ${mode}.`,
    goal ? `Goal: ${goal}.` : "Goal: write a strong follow-up email that moves the conversation forward.",
    "Return JSON only with keys subject and body.",
    "Keep the subject concise.",
    "Keep the body practical, human, and ready to send.",
    "Do not use markdown.",
    `Contact first name: ${contact.firstName || ""}`,
    `Contact last name: ${contact.lastName || ""}`,
    `Contact full name: ${contact.fullName || ""}`,
    `Contact company: ${contact.company || ""}`,
    `Contact email: ${contact.email || ""}`,
    `Sender name: ${sender.name || ""}`,
    `Sender email: ${sender.email || ""}`,
  ].join("\n");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You generate polished CRM email drafts and must respond with strict JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message || "Groq AI request failed. Please recheck backend/.env",
    );
  }

  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Groq AI did not return any draft content");
  }

  let parsed;

  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new Error("Groq AI returned an invalid draft payload");
  }

  return {
    subject: normalizeValue(parsed.subject),
    body: normalizeValue(parsed.body),
  };
};

const summarizeContactLead = async ({ contact }) => {
  const apiKey = normalizeValue(env.groqApiKey);
  const model = normalizeValue(env.groqModel);

  if (!apiKey || !model) {
    throw new Error("Groq AI configuration is incomplete. Please update backend/.env");
  }

  const customFields = Array.isArray(contact.customFields)
    ? contact.customFields
        .map((item) => `${item.key}: ${item.value}`)
        .join(", ")
    : "";

  const prompt = [
    "You are an expert CRM sales assistant for a US-market SaaS team.",
    "Analyze this contact and return strict JSON only.",
    "Return keys: summary, nextAction, leadScore, risks.",
    "leadScore must be a number from 1 to 100.",
    "risks must be an array of short strings.",
    `Full name: ${contact.fullName || ""}`,
    `Company: ${contact.company || ""}`,
    `Email: ${contact.email || ""}`,
    `Phone: ${contact.phone || ""}`,
    `Job title: ${contact.jobTitle || ""}`,
    `Status: ${contact.status || ""}`,
    `Source: ${contact.source || ""}`,
    `Tags: ${(contact.tags || []).join(", ")}`,
    `Custom fields: ${customFields}`,
    `Notes: ${contact.notes || ""}`,
  ].join("\n");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You summarize CRM contacts and must return strict JSON with no markdown.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message || "Groq AI request failed. Please recheck backend/.env",
    );
  }

  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Groq AI did not return any contact summary");
  }

  let parsed;

  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new Error("Groq AI returned an invalid contact summary payload");
  }

  return {
    summary: normalizeValue(parsed.summary),
    nextAction: normalizeValue(parsed.nextAction),
    leadScore: Number(parsed.leadScore) || 0,
    risks: Array.isArray(parsed.risks)
      ? parsed.risks.map((item) => normalizeValue(item)).filter(Boolean)
      : [],
  };
};

const generateDashboardAiBrief = async ({ analytics }) => {
  const apiKey = normalizeValue(env.groqApiKey);
  const model = normalizeValue(env.groqModel);

  if (!apiKey || !model) {
    throw new Error("Groq AI configuration is incomplete. Please update backend/.env");
  }

  const prompt = [
    "You are an expert CRM operating advisor for a US-market SaaS sales team.",
    "Analyze the following CRM dashboard data.",
    "Return strict JSON only with keys executiveBrief, attentionAreas, recommendedActions, revenueOutlook.",
    "executiveBrief should be 2 to 4 sentences.",
    "attentionAreas should be an array of up to 3 short strings.",
    "recommendedActions should be an array of up to 3 short action strings.",
    "revenueOutlook should be one short sentence.",
    `Summary JSON: ${JSON.stringify(analytics.summary)}`,
    `Contact status JSON: ${JSON.stringify(analytics.charts.contactStatus)}`,
    `Task status JSON: ${JSON.stringify(analytics.charts.taskStatus)}`,
    `Stage value JSON: ${JSON.stringify(analytics.charts.stageValue)}`,
    `Monthly leads JSON: ${JSON.stringify(analytics.charts.monthlyLeads)}`,
    `Monthly revenue JSON: ${JSON.stringify(analytics.charts.monthlyRevenue)}`,
    `Recent activities JSON: ${JSON.stringify(analytics.recentActivities.slice(0, 6))}`,
  ].join("\n");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You convert CRM analytics into concise executive guidance and must return strict JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message || "Groq AI request failed. Please recheck backend/.env",
    );
  }

  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Groq AI did not return any dashboard brief");
  }

  let parsed;

  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new Error("Groq AI returned an invalid dashboard brief payload");
  }

  return {
    executiveBrief: normalizeValue(parsed.executiveBrief),
    attentionAreas: Array.isArray(parsed.attentionAreas)
      ? parsed.attentionAreas.map((item) => normalizeValue(item)).filter(Boolean).slice(0, 3)
      : [],
    recommendedActions: Array.isArray(parsed.recommendedActions)
      ? parsed.recommendedActions.map((item) => normalizeValue(item)).filter(Boolean).slice(0, 3)
      : [],
    revenueOutlook: normalizeValue(parsed.revenueOutlook),
  };
};

const generateCopilotResponse = async ({ prompt, snapshot, conversation = [] }) => {
  const apiKey = normalizeValue(env.groqApiKey);
  const model = normalizeValue(env.groqModel);

  if (!apiKey || !model) {
    throw new Error("Groq AI configuration is incomplete. Please update backend/.env");
  }

  const assistantMode =
    snapshot.user?.role === "admin"
      ? "You think like an executive operating advisor."
      : snapshot.user?.role === "manager"
        ? "You think like a team manager focused on coaching, prioritization, and execution."
        : "You think like a sales copilot focused on pipeline progress, follow-ups, and daily execution.";

  const fullPrompt = [
    "You are Orbit CRM Copilot, a read-only CRM-aware assistant.",
    "You help users understand CRM data, prioritize work, and suggest next actions.",
    assistantMode,
    "Do not invent data. Use only the provided snapshot.",
    "Do not claim to have changed records or sent emails.",
    "Respect the current page context and user role when choosing recommendations.",
    "Return strict JSON only with keys answer, insights, followUps, focusArea, suggestedActions.",
    "answer should be 2 to 5 concise sentences.",
    "insights should be an array of up to 3 short bullet-style strings.",
    "followUps should be an array of up to 3 short suggested prompts.",
    "focusArea should be one short sentence describing what deserves attention next.",
    "suggestedActions should be an array of up to 3 short action recommendations.",
    `User prompt: ${prompt}`,
    `Recent conversation JSON: ${JSON.stringify(conversation)}`,
    `CRM snapshot JSON: ${JSON.stringify(snapshot)}`,
  ].join("\n");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a CRM copilot that returns concise, reliable JSON responses grounded in provided CRM data.",
        },
        {
          role: "user",
          content: fullPrompt,
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message || "Groq AI request failed. Please recheck backend/.env",
    );
  }

  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Groq AI did not return any copilot response");
  }

  let parsed;

  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new Error("Groq AI returned an invalid copilot payload");
  }

  return {
    answer: normalizeValue(parsed.answer),
    insights: Array.isArray(parsed.insights)
      ? parsed.insights.map((item) => normalizeValue(item)).filter(Boolean).slice(0, 3)
      : [],
    followUps: Array.isArray(parsed.followUps)
      ? parsed.followUps.map((item) => normalizeValue(item)).filter(Boolean).slice(0, 3)
      : [],
    focusArea: normalizeValue(parsed.focusArea),
    suggestedActions: Array.isArray(parsed.suggestedActions)
      ? parsed.suggestedActions.map((item) => normalizeValue(item)).filter(Boolean).slice(0, 3)
      : [],
  };
};

module.exports = {
  generateDashboardAiBrief,
  generateCopilotResponse,
  generateEmailDraft,
  summarizeContactLead,
};
