import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import { OAuth2Client } from 'google-auth-library';
import asyncHandler from '../middleware/asyncHandler.js';

// Initialize Google Auth Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Helper function to send tokens (both in cookies and response body)
const sendTokenResponse = (user, statusCode, res) => {
  // Create tokens
  const accessToken = user.getAccessToken();
  const refreshToken = user.getRefreshToken();

  const refreshTokenExpires = parseInt(process.env.JWT_REFRESH_EXPIRE_DAYS || '7', 10) * 24 * 60 * 60 * 1000;

  const cookieOptions = {
    expires: new Date(Date.now() + refreshTokenExpires),
    httpOnly: true,
    // Always use secure and SameSite=None for cross-domain compatibility, especially for environments like Cloud Workstation
    secure: true, 
    sameSite: 'None',
  };

  // Prepare user object for the response, excluding sensitive data
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  };

  res
    .status(statusCode)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json({
      success: true,
      accessToken,
      user: userResponse,
    });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ success: false, error: 'Email is already in use.' });
  }

  const user = await User.create({ name, email, password });

  const verificationToken = user.getVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  const message = `Welcome to MathGenius!\n\nPlease click the link below to verify your email address:\n\n${verificationUrl}\n\nThis link expires in 15 minutes.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Verify Your Email for MathGenius',
      message,
    });
    res.status(201).json({ success: true, data: 'Registration successful! Please check your email to verify your account.' });
  } catch (err) {
    console.error(err);
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(500).json({ success: false, error: 'Email could not be sent.' });
  }
});

// @desc    Verify email
// @route   GET /api/v1/auth/verify-email
// @access  Public
export const verifyEmail = asyncHandler(async (req, res, next) => {
    const verificationToken = crypto
        .createHash('sha256')
        .update(req.query.token)
        .digest('hex');

    const user = await User.findOne({
        verificationToken,
        verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
        return res.status(400).json({ success: false, error: 'Invalid or expired verification token.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // After verification, log the user in by sending tokens
    sendTokenResponse(user, 200, res);
});


// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Please provide an email and password' });
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
  
  if (!user.isVerified) {
    return res.status(401).json({ success: false, error: 'Please verify your email to log in.' });
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh-token
// @access  Public (requires the httpOnly refresh token)
export const refreshToken = asyncHandler(async (req, res, next) => {
  console.log('\n--- [AUTH DEBUG] Refresh Token Attempt ---');
  const { refreshToken } = req.cookies;
  
  if (!refreshToken) {
    console.error('[AUTH DEBUG] No refresh token found in cookies.');
    return res.status(401).json({ success: false, error: 'Not authorized, no refresh token' });
  }

  console.log('[AUTH DEBUG] Refresh token received from cookie.');

  try {
    console.log('[AUTH DEBUG] Verifying refresh token...');
    // Thêm log để kiểm tra xem secret có được tải đúng cách không
    if (!process.env.JWT_REFRESH_SECRET) {
        console.error('[AUTH DEBUG] FATAL: JWT_REFRESH_SECRET is not loaded from .env file!');
    }
    
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    console.log('[AUTH DEBUG] Refresh token decoded successfully for user ID:', decoded.id);
    
    const user = await User.findById(decoded.id);

    if (!user) {
      console.error('[AUTH DEBUG] User not found in database for decoded ID:', decoded.id);
      return res.status(401).json({ success: false, error: 'Not authorized, user not found' });
    }

    console.log('[AUTH DEBUG] User found:', user.email);
    const accessToken = user.getAccessToken();
    console.log('[AUTH DEBUG] New access token generated successfully.');
    
    const userResponse = { 
        _id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        isVerified: user.isVerified 
    };

    res.status(200).json({
        success: true,
        accessToken,
        user: userResponse,
    });

  } catch (err) {
    // Log chi tiết lỗi từ jwt.verify
    console.error('[AUTH DEBUG] JWT VERIFICATION FAILED:', err.name, '-', err.message);
    return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
  }
});


// @desc    Log user out
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res, next) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: true,
    sameSite: 'None',
  };

  res
    .status(200)
    .cookie('refreshToken', 'none', cookieOptions)
    .json({
      success: true,
      data: {},
    });
});


// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  // req.user is set by the auth middleware from the accessToken
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Handle Google Login
// @route   POST /api/v1/auth/google
// @access  Public
export const googleLogin = asyncHandler(async (req, res, next) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, error: 'Google auth code is missing.' });
  }

  const { tokens } = await client.getToken(code);
  const idToken = tokens.id_token;
  if (!idToken) {
      return res.status(400).json({ success: false, error: 'Could not retrieve ID token from Google.' });
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const { email, name, email_verified } = payload;

  if (!email_verified) {
    return res.status(400).json({ success: false, error: 'Google account email is not verified.' });
  }

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      isVerified: true, // Email is verified by Google
      password: crypto.randomBytes(20).toString('hex'), // Create a dummy password
    });
    sendTokenResponse(user, 201, res);
  } else {
    sendTokenResponse(user, 200, res);
  }
});


// --- Password Reset ---

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(200).json({ success: true, data: 'Email sent' }); // Prevent user enumeration
  }
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const message = `You are receiving this email because you (or someone else) has requested a password reset. Please click the link to proceed:\n\n${resetUrl}`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      message,
    });
    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.error(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(500).json({ success: false, error: 'Email could not be sent' });
  }
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
    
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ success: false, error: 'Invalid or expired token' });
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  
  // Log the user in directly after successful password reset
  sendTokenResponse(user, 200, res);
});
