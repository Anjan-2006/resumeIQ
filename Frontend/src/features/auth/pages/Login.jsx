import "../auth.form.scss";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/Loader";
import { ResumeIQLogo } from "../components/Navbar";

function Login() {
  const { loading, handleLogin, handleGuestLogin, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
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
