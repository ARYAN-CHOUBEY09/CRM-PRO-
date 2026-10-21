const Activity = require("../models/Activity");
const Contact = require("../models/Contact");
const Deal = require("../models/Deal");
const Task = require("../models/Task");
const User = require("../models/User");
const { getOwnedOrAssignedScope, isPrivilegedRole } = require("../utils/permissionScopes");

const buildSafeRegex = (value) =>
  new RegExp(String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

const listGlobalSearchResults = async (request, response) => {
  const q = String(request.query.q || "").trim();

  if (!q) {
    response.status(400);
    throw new Error("Search query is required");
  }

  const searchRegex = buildSafeRegex(q);
  const accessScope = { orgId: request.orgId, ...getOwnedOrAssignedScope(request.user) };
  const privileged = isPrivilegedRole(request.user);
  const dealScope = privileged
    ? { orgId: request.orgId }
    : { orgId: request.orgId, $or: [{ owner: request.user._id }, { assignedTo: request.user._id }] };
  const userScope = privileged ? { orgId: request.orgId } : { orgId: request.orgId, _id: request.user._id };

  const [contacts, deals, tasks, users, activities] = await Promise.all([
    Contact.find({
      $and: [
        accessScope,
        {
          $or: [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { email: searchRegex },
            { company: searchRegex },
          ],
        },
      ],
    })
      .limit(6)
      .sort({ updatedAt: -1 })
      .select("firstName lastName email company status"),
    Deal.find({
      $and: [
        dealScope,
        {
          $or: [{ title: searchRegex }, { notes: searchRegex }],
        },
      ],
    })
      .limit(6)
      .sort({ updatedAt: -1 })
      .select("title value currency status"),
    Task.find({
      $and: [
        accessScope,
        {
          $or: [{ title: searchRegex }, { description: searchRegex }],
        },
      ],
    })
      .limit(6)
      .sort({ updatedAt: -1 })
      .select("title status priority dueDate"),
    User.find({
      $and: [
        userScope,
        {
          $or: [{ name: searchRegex }, { email: searchRegex }],
        },
      ],
    })
      .limit(6)
      .sort({ name: 1 })
      .select("name email role isActive"),
    Activity.find({
      owner: request.user._id,
      orgId: request.orgId,
      $or: [{ message: searchRegex }, { action: searchRegex }],
    })
      .limit(8)
      .sort({ createdAt: -1 })
      .select("message action entityType createdAt"),
  ]);

  response.status(200).json({
    success: true,
    message: "Search results fetched successfully",
    data: {
      results: {
        contacts: contacts.map((contact) => ({
          id: contact._id,
          label: `${contact.firstName} ${contact.lastName}`.trim(),
          meta: [contact.company, contact.email].filter(Boolean).join(" • "),
          status: contact.status,
          route: "/contacts",
        })),
        deals: deals.map((deal) => ({
          id: deal._id,
          label: deal.title,
          meta: `${deal.currency} ${Number(deal.value || 0).toLocaleString("en-US")} • ${deal.status}`,
          route: "/pipeline",
        })),
        tasks: tasks.map((task) => ({
          id: task._id,
          label: task.title,
          meta: [task.priority, task.status].filter(Boolean).join(" • "),
          route: "/tasks",
        })),
        users: users.map((user) => ({
          id: user._id,
          label: user.name,
          meta: [user.email, user.role].filter(Boolean).join(" • "),
          route: "/users",
        })),
        activities: activities.map((activity) => ({
          id: activity._id,
          label: activity.message,
          meta: [activity.entityType, activity.action].filter(Boolean).join(" • "),
          route: "/notifications",
        })),
      },
    },
  });
};

module.exports = {
  listGlobalSearchResults,
};
