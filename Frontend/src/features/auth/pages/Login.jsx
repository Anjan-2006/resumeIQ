import "../auth.form.scss";
import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/Loader";
import OtpInput from "../components/OtpInput";
import { ResumeIQLogo } from "../components/Navbar";
import { API_BASE_URL } from "../../../config/api";

const IconGoogle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

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

function Login() {
  const {
    loading,
    handleLogin,
    handleVerifyLogin,
    handleResendLoginOtp,
    handleGuestLogin,
    user
  } = useAuth();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // OTP Verification State
  const [isOtpScreen, setIsOtpScreen] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isOtpScreen && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOtpScreen, resendTimer]);

  useEffect(() => {
    const oauthError = searchParams.get("error");
    const isSessionExpired = searchParams.get("session_expired") === "true";
    const resetSuccess = searchParams.get("reset") === "success";

    if (resetSuccess) {
      setSuccessMsg("Password reset successfully. Please sign in with your new password.");
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    } else if (isSessionExpired) {
      setError("Your session has expired. Please sign in again.");
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    } else if (oauthError === "oauth_denied") {
      setError("Google authentication was cancelled or access was denied.");
    } else if (oauthError === "email_send_failed") {
      setError("Failed to authenticate with Google. Please try again.");
    } else if (oauthError) {
      setError("Google authentication failed. Please try again or use another login method.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (user && !loading && !isOtpScreen) {
      navigate("/", { replace: true });
    }
  }, [user, loading, isOtpScreen, navigate]);

  if (loading && !isOtpScreen) {
    return <Loader />;
  }

  if (user && !isOtpScreen) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const result = await handleLogin({ email, password });
    if (result.otpRequired) {
      setIsOtpScreen(true);
      setTempToken(result.tempToken);
      setMaskedEmail(result.email);
      setOtp("");
      setResendTimer(60);
      setSuccessMsg(`Verification code sent to ${result.email}`);
    } else {
      setError(result.message || "Invalid email or password.");
    }
  };

  const handleOtpSubmit = async (e, directOtp) => {
    if (e) e.preventDefault();
    const codeToVerify = typeof directOtp === "string" ? directOtp : otp;

    if (!codeToVerify || codeToVerify.trim().length !== 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }
    setError("");
    setSuccessMsg("");

    const result = await handleVerifyLogin({ tempToken, otp: codeToVerify.trim() });
    if (result.success) {
      navigate("/");
    } else {
      setError(result.message || "Invalid or expired verification code.");
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isResending) return;
    setIsResending(true);
    setError("");
    setSuccessMsg("");

    const result = await handleResendLoginOtp({ tempToken });
    setIsResending(false);
    if (result.success) {
      setResendTimer(60);
      setSuccessMsg(result.message || "New code sent to your email.");
    } else {
      setError(result.message || "Unable to resend verification code.");
    }
  };

  const handleBackToLogin = () => {
    setIsOtpScreen(false);
    setOtp("");
    setError("");
    setSuccessMsg("");
    setTempToken("");
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  const handleGuest = async () => {
    setError("");
    const success = await handleGuestLogin();
    if (success) {
      navigate("/");
    } else {
      setError("Guest demo is temporarily unavailable. Please try again.");
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
          {isOtpScreen ? (
            <>
              <h1>Login Verification</h1>
              <p className="form-subheading">
                Enter the 6-digit verification code sent to <strong>{maskedEmail}</strong>
              </p>

              {error && <div className="form-error" role="alert">{error}</div>}
              {successMsg && <div className="form-success" role="status">{successMsg}</div>}

              <form onSubmit={handleOtpSubmit}>
                <div className="mb-4">
                  <label htmlFor="login-otp-0" className="form-label" style={{ textAlign: "center", display: "block" }}>
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
                    idPrefix="login-otp"
                  />
                </div>
                <button className="btn btn-light" type="submit" disabled={loading || otp.length !== 6}>
                  {loading ? "Verifying..." : "Verify & Sign In"}
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
                <button className="btn-text-link" type="button" onClick={handleBackToLogin}>
                  ← Back to Sign In
                </button>
              </p>
            </>
          ) : (
            <>
              <h1>Welcome Back</h1>
              <p className="form-subheading">Sign in to access your interview reports and preparation roadmaps</p>

              <form onSubmit={handleSubmit}>
                {error && <div className="form-error" role="alert">{error}</div>}
                {successMsg && <div className="form-success" role="status">{successMsg}</div>}
                <div className="mb-4">
                  <label htmlFor="email" className="form-label">
                    Email address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <label htmlFor="password" className="form-label" style={{ marginBottom: 0 }}>
                      Password
                    </label>
                    <Link to="/forgot-password" className="btn-text-link" style={{ fontSize: "0.85rem", textDecoration: "none" }}>
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      id="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
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
                <button className="btn btn-light" type="submit">Sign In</button>
              </form>
              <div className="auth-divider"><span>or</span></div>
              <button className="btn google-btn" type="button" onClick={handleGoogleLogin}>
                <IconGoogle />
                <span>Continue with Google</span>
              </button>
              <button className="btn guest-btn" type="button" onClick={handleGuest} disabled={loading}>
                {loading ? "Starting demo..." : "Try as Guest"}
              </button>
              <p className="auth-footer">
                Don't have an account? <Link to="/register">Create Account</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default Login;
