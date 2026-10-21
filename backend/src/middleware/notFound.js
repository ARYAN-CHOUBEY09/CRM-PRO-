const notFound = (request, response, next) => {
  response.status(404);
  next(new Error(`Route not found: ${request.originalUrl}`));
};

module.exports = notFound;

