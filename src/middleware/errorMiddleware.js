function notFound(req, res, _next) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(error, _req, res, _next) {
  console.error(error);
  if (error.name === "ValidationError") {
    return res.status(400).json({ message: Object.values(error.errors).map(item => item.message).join(". ") });
  }
  if (error.name === "CastError") return res.status(400).json({ message: "Invalid resource identifier." });
  return res.status(500).json({ message: "Something went wrong on the server." });
}

module.exports = { notFound, errorHandler };
