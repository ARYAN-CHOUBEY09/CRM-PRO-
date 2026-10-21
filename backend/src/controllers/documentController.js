const Document = require("../models/Document");
const { isPrivilegedRole } = require("../utils/permissionScopes");
const formatMongooseError = require("../utils/catchValidationError");

const canAccessDoc = (user, doc) => {
  if (isPrivilegedRole(user)) return true;
  if (String(doc.createdBy) === String(user._id)) return true;
  if (doc.assignedTo && String(doc.assignedTo) === String(user._id)) return true;
  return false;
};

const mapDoc = (doc) => doc.toSafeObject();

const listDocuments = async (request, response) => {
  const { entityType, entityId, assignedTo } = request.query;
  const query = { orgId: request.orgId };

  if (!isPrivilegedRole(request.user)) {
    query.$or = [
      { createdBy: request.user._id },
      { assignedTo: request.user._id },
    ];
  }

  if (entityType) query.entityType = entityType;
  if (entityId) query.entityId = entityId;
  if (assignedTo) query.assignedTo = assignedTo;

  const documents = await Document.find(query)
    .populate("createdBy", "name email role")
    .populate("assignedTo", "name email role")
    .sort({ updatedAt: -1 });

  response.status(200).json({
    success: true,
    message: "Documents fetched successfully",
    data: {
      documents: documents.map(mapDoc),
    },
  });
};

const createDocument = async (request, response) => {
  try {
    const { title, fileName, fileUrl, mimeType, size, entityType, entityId, assignedTo } =
      request.body;

    if (!title || !fileName || !fileUrl) {
      response.status(400);
      throw new Error("title, fileName, and fileUrl are required");
    }

    const document = await Document.create({
      orgId: request.orgId,
      title: title.trim(),
      fileName: fileName.trim(),
      fileUrl: fileUrl.trim(),
      mimeType: mimeType || "application/octet-stream",
      size: size || 0,
      entityType: entityType || "project",
      entityId: entityId || null,
      assignedTo: assignedTo || null,
      createdBy: request.user._id,
    });

    const hydrated = await Document.findById(document._id)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role");

    response.status(201).json({
      success: true,
      message: "Document saved successfully",
      data: {
        document: mapDoc(hydrated),
      },
    });
  } catch (error) {
    response.status(response.statusCode === 200 ? 400 : response.statusCode);
    throw new Error(formatMongooseError(error));
  }
};

const deleteDocument = async (request, response) => {
  const document = await Document.findOne({
    _id: request.params.documentId,
    orgId: request.orgId,
  });

  if (!document) {
    response.status(404);
    throw new Error("Document not found");
  }

  if (!canAccessDoc(request.user, document)) {
    response.status(403);
    throw new Error("You do not have permission to delete this document");
  }

  await document.deleteOne();

  response.status(200).json({
    success: true,
    message: "Document deleted successfully",
  });
};

module.exports = {
  listDocuments,
  createDocument,
  deleteDocument,
};
