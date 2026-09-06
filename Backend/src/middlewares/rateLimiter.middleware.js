const { rateLimit } = require("express-rate-limit");

/**
 * Rate limiter for general authentication endpoints (register, login, guest-login).
 * Limit: 10 requests per 15 minutes.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    message: "Too many authentication attempts, please try again after 15 minutes.",
  },
});

/**
 * Rate limiter for OTP verification endpoints (verify-registration, verify-login).
 * Limit: 5 requests per 10 minutes.
 */
const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    message: "Too many OTP verification attempts, please try again after 10 minutes.",
  },
});

/**
 * Rate limiter for OTP resend endpoints (resend-registration-otp, resend-login-otp).
 * Limit: 3 requests per 15 minutes.
 */
const otpResendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    message: "Too many OTP resend attempts, please try again after 15 minutes.",
  },
});

/**
 * Rate limiter for AI/LLM interview report generation endpoint (POST /api/interview/).
 * Limit: 5 requests per 1 hour.
 */
const aiReportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    message: "Too many interview report generation requests, please try again after an hour.",
  },
});

/**
 * Rate limiter for Puppeteer-based resume PDF preview generation endpoint (POST /api/interview/resume/pdf/:interviewReportId).
 * Limit: 5 requests per 1 hour.
 */
const pdfGenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    message: "Too many resume PDF generation requests, please try again after an hour.",
  },
});

/**
 * Rate limiter for token refresh endpoint (POST /api/auth/refresh).
 * Limit: 30 requests per 15 minutes.
 */
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    message: "Too many token refresh attempts, please try again after 15 minutes.",
  },
});

/**
 * Rate limiter for forgot-password request endpoint (POST /api/auth/forgot-password).
 * Limit: 5 requests per 15 minutes.
 */
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    message: "Too many password reset requests, please try again after 15 minutes.",
  },
});

/**
 * Rate limiter for forgot-password verification endpoint (POST /api/auth/verify-forgot-password).
 * Limit: 5 requests per 10 minutes.
 */
const verifyForgotPasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    message: "Too many verification attempts, please try again after 10 minutes.",
  },
});

/**
 * Rate limiter for forgot-password resend endpoint (POST /api/auth/resend-forgot-password).
 * Limit: 3 requests per 15 minutes.
 */
const resendForgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    message: "Too many code resend attempts, please try again after 15 minutes.",
  },
});

module.exports = {
  authLimiter,
  otpVerifyLimiter,
  otpResendLimiter,
  refreshLimiter,
  aiReportLimiter,
  pdfGenerationLimiter,
  forgotPasswordLimiter,
  verifyForgotPasswordLimiter,
  resendForgotPasswordLimiter,
};

