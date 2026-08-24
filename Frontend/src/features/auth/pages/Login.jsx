import "../auth.form.scss";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/Loader";
import { ResumeIQLogo } from "../components/Navbar";

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
  const { loading, handleLogin, handleGuestLogin, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && !loading) {
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <Loader />;
  }

  if (user) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const success = await handleLogin({ email, password });
    if (success) {
      navigate("/");
    } else {
      setError("Unable to sign in. Please check your email and password.");
    }
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
          <p className="auth-brand-subtitle">AI-Powered Career & Interview Preparation</p>
        </div>

        <div className="form-container login">
          <h1>Welcome Back</h1>
          <p className="form-subheading">Sign in to access your interview reports and preparation roadmaps</p>

          <form onSubmit={handleSubmit}>
            {error && <div className="form-error" role="alert">{error}</div>}
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
              <label htmlFor="password" className="form-label">
                Password
              </label>
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
          <button className="btn guest-btn" type="button" onClick={handleGuest} disabled={loading}>
            {loading ? "Starting demo..." : "Try as Guest"}
          </button>
          <p className="auth-footer">
            Don't have an account? <Link to="/register">Create Account</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Login;
