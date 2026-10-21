const getHealthStatus = (request, response) => {
  response.status(200).json({
    success: true,
    message: "CRM API is healthy",
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    },
  });
};

module.exports = {
  getHealthStatus,
};

