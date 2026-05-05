/* =========================
   💀 CENTRALIZED ERROR HANDLER
========================= */
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  
  // Log the error for internal tracking
  if (process.env.NODE_ENV !== "test") {
    console.error(`[ERROR] ${err.message}`);
    if (process.env.NODE_ENV === "development") {
      console.error(err.stack);
    }
  }

  // Format the error response securely
  const errorResponse = {
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }), // Only expose stack in development
  };

  res.status(statusCode).json(errorResponse);
}
