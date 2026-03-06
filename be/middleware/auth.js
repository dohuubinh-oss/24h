import jwt from 'jsonwebtoken';
import asyncHandler from './asyncHandler.js';
import User from '../models/User.js';

// Protect routes
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for the Authorization header and ensure it starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Correctly extract token from the header: "Bearer <token>" -> "<token>"
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists after attempting to extract it
  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized, no token' });
  }

  try {
    // Verify the token using the correct secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to the request object for subsequent middleware/controllers
    req.user = await User.findById(decoded.id).select('-password');

    // If user not found in DB after decoding token
    if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authorized, user not found' });
    }

    next(); // All good, proceed to the actual route handler
  } catch (err) {
    // This will catch any error from jwt.verify (expired, invalid, etc.)
    return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
  }
});
