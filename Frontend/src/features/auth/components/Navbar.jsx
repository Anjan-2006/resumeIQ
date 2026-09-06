import { useState, useRef, useEffect } from 'react';
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
      width={Math.round(size * 0.5)}
      height={Math.round(size * 0.5)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="13" y2="17" />
    </svg>
  </div>
);

const IconSettings = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const IconLogout = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const IconChevronDown = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function Navbar() {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [dropdownOpen]);

  const onLogout = async () => {
    setDropdownOpen(false);
    await handleLogout();
    navigate('/login');
  };

  const displayName = user
    ? user.username?.includes('Guest')
      ? 'Guest User'
      : (user.username || user.email?.split('@')[0] || 'User')
    : 'User';

  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className="app-navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <ResumeIQLogo size={36} />
          <span className="brand-name">Resume<span className="accent-text">IQ</span></span>
        </Link>

        <div className="navbar-actions">
          {user && (
            <div className="profile-dropdown-wrapper" ref={dropdownRef}>
              <button
                type="button"
                className={`profile-trigger-btn ${dropdownOpen ? 'active' : ''}`}
                onClick={() => setDropdownOpen(prev => !prev)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                id="profile-dropdown-trigger"
              >
                <span className="profile-avatar-badge">{userInitial}</span>
                <span className="profile-name-text">{displayName}</span>
                <span className={`profile-chevron ${dropdownOpen ? 'open' : ''}`}>
                  <IconChevronDown />
                </span>
              </button>

              {dropdownOpen && (
                <div className="profile-dropdown-menu" role="menu">
                  <div className="dropdown-user-header">
                    <div className="user-avatar-large">{userInitial}</div>
                    <div className="user-meta">
                      <div className="user-name">{displayName}</div>
                      <div className="user-email" title={user.email}>{user.email}</div>
                    </div>
                  </div>

                  <div className="dropdown-divider" />

                  <div className="dropdown-menu-list">
                    <button
                      type="button"
                      className="dropdown-menu-item"
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/settings');
                      }}
                      role="menuitem"
                      id="menu-item-settings"
                    >
                      <span className="item-icon"><IconSettings /></span>
                      <span className="item-label">Account Settings</span>
                    </button>

                    <button
                      type="button"
                      className="dropdown-menu-item logout-item"
                      onClick={onLogout}
                      role="menuitem"
                      id="menu-item-logout"
                    >
                      <span className="item-icon"><IconLogout /></span>
                      <span className="item-label">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
