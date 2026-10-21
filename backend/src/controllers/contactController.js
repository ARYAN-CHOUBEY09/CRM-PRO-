const Contact = require("../models/Contact");
const { summarizeContactLead } = require("../services/aiService");
const {
  getOwnedOrAssignedScope,
  getOwnedScope,
} = require("../utils/permissionScopes");
const { computeLeadScore } = require("../services/scoringService");
const { handleLeadCreatedEvent, handleContactUpdatedEvent } = require("../services/automationService");
const formatMongooseError = require("../utils/catchValidationError");

const normalizeArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeCustomFields = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => ({
      key: String(item.key || "").trim(),
      value: String(item.value || "").trim(),
    }))
    .filter((item) => item.key && item.value);
};

const mapContact = (contact) => contact.toSafeObject();

const listContacts = async (request, response) => {
  const { q, status, tag, assignedTo, page = 1, limit = 10, sort = "newest" } =
    request.query;

  const conditions = [];
  const scope = getOwnedOrAssignedScope(request.user);
  conditions.push({ orgId: request.orgId });

  if (Object.keys(scope).length > 0) {
    conditions.push(scope);
  }

  if (q) {
    conditions.push({
      $or: [
      { firstName: { $regex: q, $options: "i" } },
      { lastName: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { company: { $regex: q, $options: "i" } },
      { phone: { $regex: q, $options: "i" } },
      ],
    });
  }

  if (status) {
    conditions.push({ status });
  }

  if (tag) {
    conditions.push({ tags: { $in: normalizeArray(tag) } });
  }

  if (assignedTo) {
    conditions.push({
      assignedTo: assignedTo === "unassigned" ? null : assignedTo,
    });
  }

  const query =
    conditions.length === 0
      ? {}
      : conditions.length === 1
        ? conditions[0]
        : { $and: conditions };

  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    name_asc: { firstName: 1, lastName: 1 },
    name_desc: { firstName: -1, lastName: -1 },
    score_desc: { score: -1, createdAt: -1 },
    score_asc: { score: 1, createdAt: -1 },
  };

  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 100);

  const [contacts, total] = await Promise.all([
    Contact.find(query)
      .populate("assignedTo", "name email role")
      .populate("owner", "name email role")
      .sort(sortMap[sort] || sortMap.newest)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber),
    Contact.countDocuments(query),
  ]);

  response.status(200).json({
    success: true,
    message: "Contacts fetched successfully",
    data: {
      contacts: contacts.map(mapContact),
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber) || 1,
      },
    },
  });
};

const getContactById = async (request, response) => {
  const contact = await Contact.findOne({
    _id: request.params.contactId,
    orgId: request.orgId,
    ...getOwnedOrAssignedScope(request.user),
  })
    .populate("assignedTo", "name email role")
    .populate("owner", "name email role");

  if (!contact) {
    response.status(404);
    throw new Error("Contact not found");
  }

  response.status(200).json({
    success: true,
    message: "Contact fetched successfully",
    data: {
      contact: mapContact(contact),
    },
  });
};

const createContact = async (request, response) => {
  try {
    const scoring = computeLeadScore({
      ...request.body,
      createdAt: new Date(),
    });

    const contact = await Contact.create({
      ...request.body,
      orgId: request.orgId,
      email: request.body.email?.toLowerCase(),
      owner: request.user._id,
      tags: normalizeArray(request.body.tags),
      customFields: normalizeCustomFields(request.body.customFields),
      assignedTo: request.body.assignedTo || null,
      score: scoring.score,
      scoreBand: scoring.band,
    });

    // Trigger automation rules that react to new leads
    handleLeadCreatedEvent(contact).catch((automationError) =>
      // eslint-disable-next-line no-console
      console.error("Lead-created automation failed:", automationError.message),
    );

    const populatedContact = await Contact.findById(contact._id)
      .populate("assignedTo", "name email role")
      .populate("owner", "name email role");

    response.status(201).json({
      success: true,
      message: "Contact created successfully",
      data: {
        contact: mapContact(populatedContact),
      },
    });
  } catch (error) {
    response.status(response.statusCode === 200 ? 400 : response.statusCode);
    throw new Error(formatMongooseError(error));
  }
};

const updateContact = async (request, response) => {
  try {
    const payload = {
      ...request.body,
      tags: normalizeArray(request.body.tags),
      customFields: normalizeCustomFields(request.body.customFields),
    };

    if (payload.email) {
      payload.email = payload.email.toLowerCase();
    }

    const contact = await Contact.findOne({
      _id: request.params.contactId,
      orgId: request.orgId,
      ...getOwnedOrAssignedScope(request.user),
    });

    if (!contact) {
      response.status(404);
      throw new Error("Contact not found");
    }

    Object.assign(contact, payload);

    const scoring = computeLeadScore({
      ...contact.toObject(),
      ...payload,
    });
    contact.score = scoring.score;
    contact.scoreBand = scoring.band;

    await contact.save();

    const hydrated = await Contact.findById(contact._id)
      .populate("assignedTo", "name email role")
      .populate("owner", "name email role");

    // Fire automation for contact update (non-blocking)
    handleContactUpdatedEvent(hydrated).catch((automationError) =>
      // eslint-disable-next-line no-console
      console.error("Contact-updated automation failed:", automationError.message),
    );

    response.status(200).json({
      success: true,
      message: "Contact updated successfully",
      data: {
        contact: mapContact(hydrated),
      },
    });
  } catch (error) {
    response.status(response.statusCode === 200 ? 400 : response.statusCode);
    throw new Error(formatMongooseError(error));
  }
};

const deleteContact = async (request, response) => {
  const contact = await Contact.findOneAndDelete({
    _id: request.params.contactId,
    orgId: request.orgId,
    ...getOwnedScope(request.user),
  });

  if (!contact) {
    response.status(404);
    throw new Error("Contact not found");
  }

  response.status(200).json({
    success: true,
    message: "Contact deleted successfully",
  });
};

const generateContactAiSummary = async (request, response) => {
  try {
    const contact = await Contact.findOne({
      _id: request.params.contactId,
      orgId: request.orgId,
      ...getOwnedOrAssignedScope(request.user),
    });

    if (!contact) {
      response.status(404);
      throw new Error("Contact not found");
    }

    const summary = await summarizeContactLead({
      contact: {
        ...contact.toSafeObject(),
      },
    });

    response.status(200).json({
      success: true,
      message: "AI contact summary generated successfully",
      data: {
        summary,
      },
    });
  } catch (error) {
    response.status(response.statusCode === 200 ? 400 : response.statusCode);
    throw new Error(formatMongooseError(error));
  }
};

const rescoreContact = async (request, response) => {
  const contact = await Contact.findOne({
    _id: request.params.contactId,
    orgId: request.orgId,
    ...getOwnedOrAssignedScope(request.user),
  });

  if (!contact) {
    response.status(404);
    throw new Error("Contact not found");
  }

  const scoring = computeLeadScore(contact.toObject());
  contact.score = scoring.score;
  contact.scoreBand = scoring.band;
  await contact.save();

  const hydrated = await Contact.findById(contact._id)
    .populate("assignedTo", "name email role")
    .populate("owner", "name email role");

  response.status(200).json({
    success: true,
    message: "Lead rescored successfully",
    data: {
      contact: mapContact(hydrated),
    },
  });
};

module.exports = {
  createContact,
  deleteContact,
  generateContactAiSummary,
  getContactById,
  listContacts,
  updateContact,
  rescoreContact,
};
