import ErrorResponse from '../utils/errorResponse.js';

// A robust and clean error handling middleware
const errorHandler = (err, req, res, next) => {
  // Log the original error stack for debugging purposes
  console.error(err.stack);

  // Start with default error values
  let statusCode = err.statusCode || 500; // Default to 500 Internal Server Error
  let message = err.message || 'Server Error';

  // Handle specific Mongoose errors by creating a more user-friendly message

  // Mongoose Bad ObjectId Error (e.g., invalid ID format)
  if (err.name === 'CastError') {
    message = `Resource not found`; // Simplified message for security
    statusCode = 404;
  }

  // Mongoose Duplicate Key Error (e.g., unique field is violated)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate field value entered for '${field}'. Please use another value.`;
    statusCode = 400;
  }

  // Mongoose Validation Error (this is our primary case)
  if (err.name === 'ValidationError') {
    // Combine all validation error messages into a single string
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(' \n'); // Join with a newline for better readability on the client
    statusCode = 400;
  }

  // Send the final, formatted error response back to the client
  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

export default errorHandler;
