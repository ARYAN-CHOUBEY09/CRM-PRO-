const sourceWeights = {
  "facebook ads": 20,
  "google ads": 18,
  referral: 15,
  partner: 14,
  webinar: 12,
  website: 12,
  inbound: 12,
  outbound: 8,
  manual: 5,
};

const tagWeights = {
  hot: 15,
  warm: 8,
  cold: -5,
};

const statusWeights = {
  qualified: 10,
  proposal: 15,
  customer: 10,
  lost: -15,
};

const clamp = (value, min = 0, max = 100) => Math.min(Math.max(value, min), max);

const bandFromScore = (score) => {
  if (score >= 80) return "A";
  if (score >= 60) return "B";
  if (score >= 40) return "C";
  return "D";
};

const computeLeadScore = (contact) => {
  let score = 20; // base

  const source = String(contact.source || "").toLowerCase();
  if (source && sourceWeights[source]) {
    score += sourceWeights[source];
  } else if (source) {
    score += 5;
  }

  const statusWeight = statusWeights[contact.status];
  if (typeof statusWeight === "number") {
    score += statusWeight;
  }

  if (contact.phone) score += 10;
  if (contact.company) score += 5;

  const tags = Array.isArray(contact.tags) ? contact.tags : [];
  tags.forEach((tagRaw) => {
    const tag = String(tagRaw).toLowerCase();
    if (tagWeights[tag]) {
      score += tagWeights[tag];
    }
  });

  const createdAt = contact.createdAt ? new Date(contact.createdAt) : new Date();
  const ageDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays <= 3) score += 15;
  else if (ageDays <= 7) score += 10;
  else if (ageDays <= 30) score += 5;

  score = clamp(score);
  const band = bandFromScore(score);
  return { score, band };
};

module.exports = {
  computeLeadScore,
  bandFromScore,
};
