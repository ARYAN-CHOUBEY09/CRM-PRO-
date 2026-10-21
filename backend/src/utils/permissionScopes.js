const PRIVILEGED_ROLES = ["admin", "manager"];

const isPrivilegedRole = (user) => PRIVILEGED_ROLES.includes(user?.role);

const getOwnedScope = (user, ownerField = "owner") =>
  isPrivilegedRole(user) ? {} : { [ownerField]: user._id };

const getOwnedOrAssignedScope = (
  user,
  { ownerField = "owner", assigneeField = "assignedTo" } = {},
) =>
  isPrivilegedRole(user)
    ? {}
    : {
        $or: [{ [ownerField]: user._id }, { [assigneeField]: user._id }],
      };

const canAssignToUser = (requestUser, targetUserId) =>
  isPrivilegedRole(requestUser) ||
  String(requestUser?._id) === String(targetUserId);

module.exports = {
  PRIVILEGED_ROLES,
  canAssignToUser,
  getOwnedOrAssignedScope,
  getOwnedScope,
  isPrivilegedRole,
};
