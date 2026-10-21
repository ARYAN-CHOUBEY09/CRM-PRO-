const AutomationExecution = require("../models/AutomationExecution");
const AutomationRule = require("../models/AutomationRule");
const { executeAutomationRule, mapExecution, mapRule } = require("../services/automationService");
const formatMongooseError = require("../utils/catchValidationError");

const listAutomationRules = async (request, response) => {
  const rules = await AutomationRule.find({
    owner: request.user._id,
    orgId: request.orgId,
  }).sort({
    createdAt: -1,
  });

  response.status(200).json({
    success: true,
    message: "Automation rules fetched successfully",
    data: {
      rules: rules.map(mapRule),
    },
  });
};

const listAutomationExecutions = async (request, response) => {
  const executions = await AutomationExecution.find({
    owner: request.user._id,
    orgId: request.orgId,
  })
    .populate("rule", "name triggerType actionType")
    .sort({ createdAt: -1 })
    .limit(50);

  response.status(200).json({
    success: true,
    message: "Automation executions fetched successfully",
    data: {
      executions: executions.map(mapExecution),
    },
  });
};

const createAutomationRule = async (request, response) => {
  try {
    const rule = await AutomationRule.create({
      ...request.body,
      owner: request.user._id,
      orgId: request.orgId,
    });

    response.status(201).json({
      success: true,
      message: "Automation rule created successfully",
      data: {
        rule: mapRule(rule),
      },
    });
  } catch (error) {
    response.status(response.statusCode === 200 ? 400 : response.statusCode);
    throw new Error(formatMongooseError(error));
  }
};

const updateAutomationRule = async (request, response) => {
  try {
    const rule = await AutomationRule.findOneAndUpdate(
      {
        _id: request.params.ruleId,
        owner: request.user._id,
        orgId: request.orgId,
      },
      request.body,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!rule) {
      response.status(404);
      throw new Error("Automation rule not found");
    }

    response.status(200).json({
      success: true,
      message: "Automation rule updated successfully",
      data: {
        rule: mapRule(rule),
      },
    });
  } catch (error) {
    response.status(response.statusCode === 200 ? 400 : response.statusCode);
    throw new Error(formatMongooseError(error));
  }
};

const deleteAutomationRule = async (request, response) => {
  const rule = await AutomationRule.findOneAndDelete({
    _id: request.params.ruleId,
    owner: request.user._id,
    orgId: request.orgId,
  });

  if (!rule) {
    response.status(404);
    throw new Error("Automation rule not found");
  }

  response.status(200).json({
    success: true,
    message: "Automation rule deleted successfully",
  });
};

const runAutomationRuleNow = async (request, response) => {
  const rule = await AutomationRule.findOne({
    _id: request.params.ruleId,
    owner: request.user._id,
    orgId: request.orgId,
  });

  if (!rule) {
    response.status(404);
    throw new Error("Automation rule not found");
  }

  await executeAutomationRule(rule, { orgId: request.orgId });
  rule.lastRunAt = new Date();
  await rule.save();

  response.status(200).json({
    success: true,
    message: "Automation rule executed successfully",
  });
};

module.exports = {
  createAutomationRule,
  deleteAutomationRule,
  listAutomationExecutions,
  listAutomationRules,
  runAutomationRuleNow,
  updateAutomationRule,
};
