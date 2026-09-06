import "../auth.form.scss";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import OtpInput from "../components/OtpInput";
import { ResumeIQLogo } from "../components/Navbar";
import {
  forgotPasswordApi,
  verifyForgotPasswordApi,
  resetPasswordApi,
  resendForgotPasswordApi,
} from "../services/auth.api";

const IconEye = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

function ForgotPassword() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  // Multi-step flow: "EMAIL" | "OTP" | "RESET"
  const [step, setStep] = useState("EMAIL");

  // Form State
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Temporary password reset token held strictly in memory
  const [tempToken, setTempToken] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Resend OTP Countdown timer
  const [resendTimer, setResendTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    let interval = null;
    if (step === "OTP" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, resendTimer]);

  // STEP 1: Submit Email
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const data = await forgotPasswordApi({ email: email.trim() });
      setLoading(false);
      setStep("OTP");
      setOtp("");
      setResendTimer(60);
      setSuccessMsg(data.message || "If an account exists with this email, a verification code has been sent.");
    } catch (err) {
      setLoading(false);
      // Fallback message to prevent enumeration even on network issue
      setError(err?.response?.data?.message || "Unable to send verification code. Please try again.");
    }
  };

  // STEP 2: Submit OTP
  const handleOtpSubmit = async (e, directOtp) => {
    if (e) e.preventDefault();
    const codeToVerify = typeof directOtp === "string" ? directOtp : otp;

    if (!codeToVerify || codeToVerify.trim().length !== 6) {
      setError("Please enter a valid 6-digit verification code.");
      return;
    }

    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const data = await verifyForgotPasswordApi({
        email: email.trim(),
        otp: codeToVerify.trim(),
      });
      setLoading(false);
      // Keep temporary token strictly in React state / memory
      setTempToken(data.tempToken);
      setOtp("");
      setStep("RESET");
      setSuccessMsg("Code verified successfully. Please enter your new password.");
    } catch (err) {
      setLoading(false);
      setError(err?.response?.data?.message || "Invalid or expired verification code.");
    }
  };

  // STEP 2: Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0 || isResending) return;
    setIsResending(true);
    setError("");
    setSuccessMsg("");

    try {
      const data = await resendForgotPasswordApi({ email: email.trim() });
      setIsResending(false);
      setResendTimer(60);
      setSuccessMsg(data.message || "A new verification code has been sent.");
    } catch (err) {
      setIsResending(false);
      setError(err?.response?.data?.message || "Unable to resend verification code.");
    }
  };

  // STEP 3: Reset Password
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!tempToken) {
      setError("Your password reset session has expired. Please start over.");
      setStep("EMAIL");
      return;
    }

    setLoading(true);

    try {
      const data = await resetPasswordApi({
        tempToken,
        newPassword,
      });
      setLoading(false);
      // Clear sensitive reset token from memory immediately
      setTempToken("");
      // Directly log the user in with their freshly issued session
      if (data && data.user) {
        setUser(data.user);
        navigate("/", { replace: true });
      } else {
        navigate("/login?reset=success", { replace: true });
      }
    } catch (err) {
      setLoading(false);
      setError(err?.response?.data?.message || "Unable to reset password. Please try again.");
    }
  };

  return (
    <main className="auth-main">
      <div className="auth-card-wrapper">
        <div className="auth-brand-header">
          <Link to="/" className="auth-brand-link">
            <ResumeIQLogo size={44} />
            <span className="brand-name">Resume<span className="accent-text">IQ</span></span>
          </Link>
          <p className="auth-brand-subtitle">Intelligent Career & Interview Preparation</p>
        </div>

        <div className="form-container login">
          {step === "EMAIL" && (
            <>
              <h1>Forgot Password</h1>
              <p className="form-subheading">
                Enter your account email to receive a 6-digit verification code.
              </p>

              {error && <div className="form-error" role="alert">{error}</div>}
              {successMsg && <div className="form-success" role="status">{successMsg}</div>}

              <form onSubmit={handleEmailSubmit}>
                <div className="mb-4">
                  <label htmlFor="forgot-email" className="form-label">
                    Email address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="forgot-email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <button className="btn btn-light" type="submit" disabled={loading}>
                  {loading ? "Sending Code..." : "Send Verification Code"}
                </button>
              </form>

              <p className="auth-footer">
                Remember your password? <Link to="/login">Sign In</Link>
              </p>
            </>
          )}

          {step === "OTP" && (
            <>
              <h1>Verify Reset Code</h1>
              <p className="form-subheading">
                Enter the 6-digit verification code sent to <strong>{email}</strong>
              </p>

              {error && <div className="form-error" role="alert">{error}</div>}
              {successMsg && <div className="form-success" role="status">{successMsg}</div>}

              <form onSubmit={handleOtpSubmit}>
                <div className="mb-4">
                  <label htmlFor="forgot-otp-0" className="form-label" style={{ textAlign: "center", display: "block" }}>
                    Verification Code
                  </label>
                  <OtpInput
                    value={otp}
                    onChange={(val) => {
                      setOtp(val);
                      setError("");
                    }}
                    onComplete={(completedVal) => {
                      handleOtpSubmit(null, completedVal);
                    }}
                    disabled={loading}
                    hasError={Boolean(error)}
                    idPrefix="forgot-otp"
                  />
                </div>
                <button className="btn btn-light" type="submit" disabled={loading || otp.length !== 6}>
                  {loading ? "Verifying..." : "Verify Code"}
                </button>
              </form>

              <div className="otp-resend-row">
                <button
                  className="btn-link"
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || isResending}
                >
                  {isResending
                    ? "Sending new code..."
                    : resendTimer > 0
                    ? `Resend Code (${resendTimer}s)`
                    : "Resend Code"}
                </button>
              </div>

              <p className="auth-footer">
                <button
                  className="btn-text-link"
                  type="button"
                  onClick={() => {
                    setStep("EMAIL");
                    setOtp("");
                    setError("");
                    setSuccessMsg("");
                  }}
                >
                  ← Use a different email
                </button>
              </p>
            </>
          )}

          {step === "RESET" && (
            <>
              <h1>Reset Password</h1>
              <p className="form-subheading">
                Enter your new password below.
              </p>

              {error && <div className="form-error" role="alert">{error}</div>}
              {successMsg && <div className="form-success" role="status">{successMsg}</div>}

              <form onSubmit={handleResetSubmit}>
                <div className="mb-4">
                  <label htmlFor="newPassword" className="form-label">
                    New Password
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      id="newPassword"
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <IconEyeOff /> : <IconEye />}
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm New Password
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-control"
                      id="confirmPassword"
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      title={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <IconEyeOff /> : <IconEye />}
                    </button>
                  </div>
                </div>

                <button className="btn btn-light" type="submit" disabled={loading}>
                  {loading ? "Resetting Password..." : "Reset Password"}
                </button>
              </form>

              <p className="auth-footer">
                <Link to="/login" className="btn-text-link">
                  Cancel and Return to Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default ForgotPassword;
