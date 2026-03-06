import express from 'express';
const router = express.Router();

import { 
    register, 
    login, 
    getMe, 
    logout, 
    forgotPassword, 
    resetPassword, 
    verifyEmail, 
    googleLogin,
    refreshToken // Import the new controller
} from '../controllers/authController.js';

import { protect } from '../middleware/auth.js';

// Public routes
router.post('/register', register);
router.get('/verify-email', verifyEmail); // Consistent naming with frontend
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/refresh-token', refreshToken); // Add the refresh token route
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword); // More conventional param name

// Logout is now a public route - it clears the cookie regardless of auth state.
router.post('/logout', logout);

// Private routes that require a valid accessToken
router.get('/me', protect, getMe);

export default router;
