import { Link, useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';

export const ResumeIQLogo = ({ size = 36 }) => (
  <div
    className="brand-logo"
    style={{
      width: `${size}px`,
      height: `${size}px`,
      minWidth: `${size}px`,
      minHeight: `${size}px`
    }}
  >
    <svg
      width={Math.round(size * 0.55)}
      height={Math.round(size * 0.55)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M9 13h6" />
      <path d="M9 17h3" />
      <circle cx="17" cy="17" r="1.5" fill="currentColor" />
    </svg>
  </div>
);

const IconLogout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default function Navbar() {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await handleLogout();
    navigate('/login');
  };

  return (
    <header className="app-navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <ResumeIQLogo size={36} />
          <span className="brand-name">Resume<span className="accent-text">IQ</span></span>
          <span className="badge-ai">AI</span>
        </Link>

        <div className="navbar-actions">
          {user && (
            <>
              <span className="user-name-plain">
                {user.username?.includes('Guest') ? 'Guest Mode' : (user.username || user.email)}
              </span>
              <button onClick={onLogout} className="logout-btn" title="Logout">
                <IconLogout />
                <span className="logout-text">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
