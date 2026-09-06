const { Router } = require("express");
const passport = require("passport");
const authController = require("../controller/auth.controller");
const authMiddleWare = require("../middlewares/auth.middleware");
const {
  authLimiter,
  otpVerifyLimiter,
  otpResendLimiter,
  refreshLimiter,
  forgotPasswordLimiter,
  verifyForgotPasswordLimiter,
  resendForgotPasswordLimiter,
} = require("../middlewares/rateLimiter.middleware");

const authRouter = Router();

// Registration with mandatory OTP
authRouter.post("/register", authLimiter, authController.register);
authRouter.post("/verify-registration", otpVerifyLimiter, authController.verifyRegistration);
authRouter.post("/resend-registration-otp", otpResendLimiter, authController.resendRegistrationOtp);

// Login with mandatory OTP
authRouter.post("/login", authLimiter, authController.login);
authRouter.post("/verify-login", otpVerifyLimiter, authController.verifyLogin);
authRouter.post("/resend-login-otp", otpResendLimiter, authController.resendLoginOtp);

// Forgot Password Flow
authRouter.post("/forgot-password", forgotPasswordLimiter, authController.forgotPassword);
authRouter.post("/verify-forgot-password", verifyForgotPasswordLimiter, authController.verifyForgotPassword);
authRouter.post("/reset-password", authController.resetPassword);
authRouter.post("/resend-forgot-password", resendForgotPasswordLimiter, authController.resendForgotPassword);

// Guest & Session
authRouter.post("/guest-login", authLimiter, authController.guestLogin);
authRouter.post("/refresh", refreshLimiter, authController.refresh);
authRouter.post("/logout", authController.logout);
authRouter.get("/getme", authMiddleWare.authUser, authController.getMe);

// Account Settings (Profile & Password updates)
authRouter.patch("/profile", authMiddleWare.authUser, authController.updateProfile);
authRouter.patch("/password", authMiddleWare.authUser, authController.initiatePasswordChange);
authRouter.post("/password/verify", authMiddleWare.authUser, otpVerifyLimiter, authController.verifyPasswordChange);
authRouter.post("/password/resend-otp", authMiddleWare.authUser, otpResendLimiter, authController.resendPasswordChangeOtp);

// Google OAuth 2.0 & OpenID Connect
authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["openid", "email", "profile"],
    session: false,
  })
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/auth/google/failure",
  }),
  authController.googleAuthSuccess
);

authRouter.get("/google/failure", authController.googleAuthFailure);

module.exports = authRouter;