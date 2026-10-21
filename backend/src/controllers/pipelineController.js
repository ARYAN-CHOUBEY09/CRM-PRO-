const Contact = require("../models/Contact");
const Deal = require("../models/Deal");
const PipelineStage = require("../models/PipelineStage");
const formatMongooseError = require("../utils/catchValidationError");

const DEFAULT_STAGES = [
  { name: "New Lead", color: "#0ea5e9", order: 0, isDefault: true },
  { name: "Qualified", color: "#10b981", order: 1, isDefault: true },
  { name: "Proposal", color: "#f59e0b", order: 2, isDefault: true },
  { name: "Negotiation", color: "#8b5cf6", order: 3, isDefault: true },
  { name: "Closed Won", color: "#22c55e", order: 4, isDefault: true },
];

const sanitizeStage = (stage) => ({
  id: stage._id,
  name: stage.name,
  color: stage.color,
  order: stage.order,
  isDefault: stage.isDefault,
});

const sanitizeDeal = (deal) => ({
  id: deal._id,
  title: deal.title,
  value: deal.value,
  currency: deal.currency,
  status: deal.status,
  expectedCloseDate: deal.expectedCloseDate,
  notes: deal.notes,
  contact: deal.contact,
  stage: deal.stage?._id || deal.stage,
  owner: deal.owner,
  assignedTo: deal.assignedTo,
  createdAt: deal.createdAt,
  updatedAt: deal.updatedAt,
});

const ensureDefaultStages = async (ownerId, orgId) => {
  const existingStages = await PipelineStage.find({ owner: ownerId, orgId }).sort({
    order: 1,
  });

  if (existingStages.length > 0) {
    return existingStages;
  }

  await PipelineStage.insertMany(
    DEFAULT_STAGES.map((stage) => ({
      ...stage,
      owner: ownerId,
      orgId,
    })),
  );

  return PipelineStage.find({ owner: ownerId, orgId }).sort({ order: 1 });
};

const getPipelineBoard = async (request, response) => {
  const ownerId = request.user._id;
  const stages = await ensureDefaultStages(ownerId, request.orgId);
  const deals = await Deal.find({ owner: ownerId, orgId: request.orgId })
    .populate("contact", "firstName lastName email company")
    .populate("stage", "name color order")
    .populate("assignedTo", "name email role")
    .sort({ updatedAt: -1 });

  response.status(200).json({
    success: true,
    message: "Pipeline board fetched successfully",
    data: {
      stages: stages.map(sanitizeStage),
      deals: deals.map(sanitizeDeal),
    },
  });
};

const createStage = async (request, response) => {
  try {
    const ownerId = request.user._id;
    const currentStages = await ensureDefaultStages(ownerId, request.orgId);
    const stage = await PipelineStage.create({
      name: request.body.name,
      color: request.body.color || "#2563eb",
      order:
        typeof request.body.order === "number"
          ? request.body.order
          : currentStages.length,
      owner: ownerId,
      orgId: request.orgId,
      isDefault: false,
    });

    response.status(201).json({
      success: true,
      message: "Pipeline stage created successfully",
      data: {
        stage: sanitizeStage(stage),
      },
    });
  } catch (error) {
    response.status(response.statusCode === 200 ? 400 : response.statusCode);
    throw new Error(formatMongooseError(error));
  }
};

const updateStage = async (request, response) => {
  try {
    const stage = await PipelineStage.findOneAndUpdate(
      {
        _id: request.params.stageId,
        owner: request.user._id,
        orgId: request.orgId,
      },
      {
        name: request.body.name,
        color: request.body.color,
        order: request.body.order,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!stage) {
      response.status(404);
      throw new Error("Pipeline stage not found");
    }

    response.status(200).json({
      success: true,
      message: "Pipeline stage updated successfully",
      data: {
        stage: sanitizeStage(stage),
      },
    });
  } catch (error) {
    response.status(response.statusCode === 200 ? 400 : response.statusCode);
    throw new Error(formatMongooseError(error));
  }
};

const deleteStage = async (request, response) => {
  const stage = await PipelineStage.findOne({
    _id: request.params.stageId,
    owner: request.user._id,
    orgId: request.orgId,
  });

  if (!stage) {
    response.status(404);
    throw new Error("Pipeline stage not found");
  }

  const dealsInStage = await Deal.countDocuments({
    owner: request.user._id,
    orgId: request.orgId,
    stage: stage._id,
  });

  if (dealsInStage > 0) {
    response.status(400);
    throw new Error("Move deals out of this stage before deleting it");
  }

  await stage.deleteOne();

  response.status(200).json({
    success: true,
    message: "Pipeline stage deleted successfully",
  });
};

const createDeal = async (request, response) => {
  try {
    const ownerId = request.user._id;
    await ensureDefaultStages(ownerId, request.orgId);

    const contact = await Contact.findOne({
      _id: request.body.contact,
      owner: ownerId,
      orgId: request.orgId,
    });

    if (!contact) {
      response.status(400);
      throw new Error("Valid linked contact is required");
    }

    const stage = await PipelineStage.findOne({
      _id: request.body.stage,
      owner: ownerId,
      orgId: request.orgId,
    });

    if (!stage) {
      response.status(400);
      throw new Error("Valid pipeline stage is required");
    }

    const deal = await Deal.create({
      ...request.body,
      owner: ownerId,
      orgId: request.orgId,
      stage: stage._id,
      contact: contact._id,
      assignedTo: request.body.assignedTo || null,
    });

    const populatedDeal = await Deal.findById(deal._id)
      .populate("contact", "firstName lastName email company")
      .populate("stage", "name color order")
      .populate("assignedTo", "name email role");

    response.status(201).json({
      success: true,
      message: "Deal created successfully",
      data: {
        deal: sanitizeDeal(populatedDeal),
      },
    });
  } catch (error) {
    response.status(response.statusCode === 200 ? 400 : response.statusCode);
    throw new Error(formatMongooseError(error));
  }
};

const updateDeal = async (request, response) => {
  try {
    const ownerId = request.user._id;
    const payload = { ...request.body };

    if (payload.contact) {
      const contact = await Contact.findOne({
        _id: payload.contact,
        owner: ownerId,
        orgId: request.orgId,
      });

      if (!contact) {
        response.status(400);
        throw new Error("Valid linked contact is required");
      }
    }

    if (payload.stage) {
      const stage = await PipelineStage.findOne({
        _id: payload.stage,
        owner: ownerId,
        orgId: request.orgId,
      });

      if (!stage) {
        response.status(400);
        throw new Error("Valid pipeline stage is required");
      }
    }

    const deal = await Deal.findOneAndUpdate(
      {
        _id: request.params.dealId,
        owner: ownerId,
        orgId: request.orgId,
      },
      payload,
      {
        new: true,
        runValidators: true,
      },
    )
      .populate("contact", "firstName lastName email company")
      .populate("stage", "name color order")
      .populate("assignedTo", "name email role");

    if (!deal) {
      response.status(404);
      throw new Error("Deal not found");
    }

    response.status(200).json({
      success: true,
      message: "Deal updated successfully",
      data: {
        deal: sanitizeDeal(deal),
      },
    });
  } catch (error) {
    response.status(response.statusCode === 200 ? 400 : response.statusCode);
    throw new Error(formatMongooseError(error));
  }
};

const updateDealStage = async (request, response) => {
  const ownerId = request.user._id;
  const stage = await PipelineStage.findOne({
    _id: request.body.stageId,
    owner: ownerId,
    orgId: request.orgId,
  });

  if (!stage) {
    response.status(400);
    throw new Error("Valid pipeline stage is required");
  }

  const deal = await Deal.findOneAndUpdate(
    {
      _id: request.params.dealId,
      owner: ownerId,
      orgId: request.orgId,
    },
    {
      stage: stage._id,
      status: request.body.status || "open",
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .populate("contact", "firstName lastName email company")
    .populate("stage", "name color order")
    .populate("assignedTo", "name email role");

  if (!deal) {
    response.status(404);
    throw new Error("Deal not found");
  }

  response.status(200).json({
    success: true,
    message: "Deal stage updated successfully",
    data: {
      deal: sanitizeDeal(deal),
    },
  });
};

const deleteDeal = async (request, response) => {
  const deal = await Deal.findOneAndDelete({
    _id: request.params.dealId,
    owner: request.user._id,
    orgId: request.orgId,
  });

  if (!deal) {
    response.status(404);
    throw new Error("Deal not found");
  }

  response.status(200).json({
    success: true,
    message: "Deal deleted successfully",
  });
};

module.exports = {
  createDeal,
  createStage,
  deleteDeal,
  deleteStage,
  getPipelineBoard,
  updateDeal,
  updateDealStage,
  updateStage,
};
