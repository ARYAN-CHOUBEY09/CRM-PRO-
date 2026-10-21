const formatMongooseError = (error) => {
  if (error.name === "ValidationError") {
    return Object.values(error.errors)
      .map((item) => item.message)
      .join(", ");
  }

  if (error.code === 11000) {
    return "A user with this email already exists";
  }

  return error.message;
};

module.exports = formatMongooseError;

