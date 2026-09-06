import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import '../styles/settings.scss';

const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconKey = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-1.5 1.5L14 9l-3 3-2-2-5 5 3 3 5-5-2-2 3.5-3.5" />
    <circle cx="7.5" cy="16.5" r="1.5" />
  </svg>
);

const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const IconGoogle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </svg>
);

export default function Settings() {
  const {
    user,
    handleUpdateProfile,
    handleInitiatePasswordChange,
    handleVerifyPasswordChange,
    handleResendPasswordChangeOtp,
  } = useAuth();
  const navigate = useNavigate();

  // Profile Form State
  const [username, setUsername] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ text: '', type: '' });

  // Password Form State
  const [passwordStep, setPasswordStep] = useState('form'); // 'form' | 'otp'
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ text: '', type: '' });

  // OTP Verification State for Password Change
  const [tempToken, setTempToken] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (user && user.username) {
      setUsername(user.username);
    }
  }, [user]);

  // Resend Timer Countdown
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle Profile Update
  const onSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMessage({ text: '', type: '' });

    if (!username.trim()) {
      setProfileMessage({ text: 'Name cannot be empty.', type: 'error' });
      return;
    }

    if (username.trim().length < 2) {
      setProfileMessage({ text: 'Name must be at least 2 characters long.', type: 'error' });
      return;
    }

    if (username.trim() === user?.username) {
      setProfileMessage({ text: 'No changes made to display name.', type: 'info' });
      return;
    }

    setProfileSaving(true);
    const res = await handleUpdateProfile({ username: username.trim() });
    setProfileSaving(false);

    if (res.success) {
      setProfileMessage({ text: 'Profile name updated successfully!', type: 'success' });
    } else {
      setProfileMessage({ text: res.message, type: 'error' });
    }
  };

  // Step 1: Initiate Password Change & Request OTP
  const onInitiatePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage({ text: '', type: '' });

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ text: 'Please fill in all password fields.', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ text: 'New password must be at least 6 characters long.', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: 'New password and confirm password do not match.', type: 'error' });
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordMessage({ text: 'New password must be different from current password.', type: 'error' });
      return;
    }

    setPasswordSaving(true);
    const res = await handleInitiatePasswordChange({ currentPassword, newPassword, confirmPassword });
    setPasswordSaving(false);

    if (res.success && res.otpRequired) {
      setTempToken(res.tempToken);
      setMaskedEmail(res.email);
      setPasswordStep('otp');
      setResendCooldown(60);
      setPasswordMessage({
        text: `Verification code sent to ${res.email || 'your email'}. Enter the 6-digit code below to confirm.`,
        type: 'info',
      });
    } else {
      setPasswordMessage({ text: res.message, type: 'error' });
    }
  };

  // Step 2: Verify OTP & Finalize Password Change
  const onVerifyPasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage({ text: '', type: '' });

    if (!otp.trim() || otp.trim().length !== 6) {
      setPasswordMessage({ text: 'Please enter the 6-digit verification code.', type: 'error' });
      return;
    }

    setPasswordSaving(true);
    const res = await handleVerifyPasswordChange({ tempToken, otp: otp.trim() });
    setPasswordSaving(false);

    if (res.success) {
      setPasswordMessage({ text: 'Password updated successfully!', type: 'success' });
      setPasswordStep('form');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setOtp('');
      setTempToken('');
    } else {
      setPasswordMessage({ text: res.message, type: 'error' });
    }
  };

  // Resend OTP handler
  const onResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setPasswordMessage({ text: '', type: '' });

    const res = await handleResendPasswordChangeOtp({ tempToken });
    setIsResending(false);

    if (res.success) {
      setResendCooldown(60);
      if (res.tempToken) {
        setTempToken(res.tempToken);
      }
      setPasswordMessage({ text: 'A new verification code has been sent to your email.', type: 'success' });
    } else {
      setPasswordMessage({ text: res.message, type: 'error' });
    }
  };

  // Cancel OTP step & go back
  const onCancelOtpStep = () => {
    setPasswordStep('form');
    setOtp('');
    setPasswordMessage({ text: '', type: '' });
  };

  const hasPasswordAuth = user?.hasPassword !== false && !user?.isGuest;
  const isGoogleOnly = user?.hasPassword === false && !user?.isGuest;
  const isGuest = Boolean(user?.isGuest);

  return (
    <div className="settings-page-wrapper">
      <Navbar />

      <main className="settings-container">
        {/* Navigation Breadcrumb Bar */}
        <div className="settings-nav-bar">
          <button
            type="button"
            className="settings-back-btn"
            onClick={() => navigate('/')}
            id="settings-back-to-home"
          >
            <IconArrowLeft />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Page Title Header */}
        <header className="settings-page-header">
          <div className="settings-title-badge">
            <IconShield />
            <span>Account Center</span>
          </div>
          <h1 className="settings-page-title">Account Settings</h1>
          <p className="settings-page-subtitle">
            Manage your personal profile information and authentication credentials.
          </p>
        </header>

        <div className="settings-grid">
          {/* ════════════════ PROFILE SECTION ════════════════ */}
          <section className="settings-card" id="profile-section">
            <div className="settings-card-header">
              <div className="card-icon-bubble primary">
                <IconUser />
              </div>
              <div className="card-header-text">
                <h2>Profile Details</h2>
                <p>Your display name and registered email address on ResumeIQ.</p>
              </div>
            </div>

            <form onSubmit={onSaveProfile} className="settings-form">
              {profileMessage.text && (
                <div className={`settings-alert ${profileMessage.type}`} role="alert">
                  {profileMessage.type === 'success' && <IconCheck />}
                  <span>{profileMessage.text}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="settings-username" className="form-label">
                  Display Name
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="settings-username"
                    className="settings-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your name"
                    disabled={profileSaving}
                    maxLength={50}
                  />
                </div>
                <span className="form-hint">This name will be displayed across your reports and tailored resumes.</span>
              </div>

              <div className="form-group">
                <label htmlFor="settings-email" className="form-label">
                  Email Address
                  <span className="badge-readonly">Read-Only</span>
                </label>
                <div className="input-wrapper readonly">
                  <input
                    type="email"
                    id="settings-email"
                    className="settings-input readonly"
                    value={user?.email || ''}
                    readOnly
                    disabled
                  />
                  <span className="input-badge-verified">
                    <IconCheck />
                    <span>Verified</span>
                  </span>
                </div>
                <span className="form-hint">Email address is permanently linked to your account security.</span>
              </div>

              <div className="card-actions">
                <button
                  type="submit"
                  className="settings-btn primary"
                  disabled={profileSaving || username.trim() === user?.username}
                  id="btn-save-profile"
                >
                  {profileSaving ? (
                    <>
                      <span className="btn-spinner" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* ════════════════ SECURITY SECTION ════════════════ */}
          <section className="settings-card" id="security-section">
            <div className="settings-card-header">
              <div className="card-icon-bubble accent">
                <IconLock />
              </div>
              <div className="card-header-text">
                <h2>Security & Authentication</h2>
                <p>Manage your account password and verification credentials.</p>
              </div>
            </div>

            {/* Password Management */}
            <div className="settings-subcard">
              <h3 className="subcard-title">Change Password</h3>

              {hasPasswordAuth && passwordStep === 'form' && (
                <form onSubmit={onInitiatePasswordChange} className="settings-form">
                  {passwordMessage.text && (
                    <div className={`settings-alert ${passwordMessage.type}`} role="alert">
                      {passwordMessage.type === 'success' && <IconCheck />}
                      <span>{passwordMessage.text}</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="settings-current-pass" className="form-label">
                      Current Password
                    </label>
                    <div className="input-wrapper password-wrapper">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        id="settings-current-pass"
                        className="settings-input"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        disabled={passwordSaving}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowCurrentPassword((p) => !p)}
                        tabIndex={-1}
                        aria-label="Toggle password visibility"
                      >
                        {showCurrentPassword ? <IconEyeOff /> : <IconEye />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="settings-new-pass" className="form-label">
                      New Password
                    </label>
                    <div className="input-wrapper password-wrapper">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        id="settings-new-pass"
                        className="settings-input"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password (min. 6 characters)"
                        disabled={passwordSaving}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowNewPassword((p) => !p)}
                        tabIndex={-1}
                        aria-label="Toggle password visibility"
                      >
                        {showNewPassword ? <IconEyeOff /> : <IconEye />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="settings-confirm-pass" className="form-label">
                      Confirm New Password
                    </label>
                    <div className="input-wrapper password-wrapper">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="settings-confirm-pass"
                        className="settings-input"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        disabled={passwordSaving}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowConfirmPassword((p) => !p)}
                        tabIndex={-1}
                        aria-label="Toggle password visibility"
                      >
                        {showConfirmPassword ? <IconEyeOff /> : <IconEye />}
                      </button>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      type="submit"
                      className="settings-btn secondary"
                      disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword}
                      id="btn-save-password"
                    >
                      {passwordSaving ? (
                        <>
                          <span className="btn-spinner" />
                          <span>Sending code...</span>
                        </>
                      ) : (
                        <span>Change Password</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Step 2: Enter Email Verification Code */}
              {hasPasswordAuth && passwordStep === 'otp' && (
                <form onSubmit={onVerifyPasswordChange} className="settings-form otp-step-form">
                  {passwordMessage.text && (
                    <div className={`settings-alert ${passwordMessage.type}`} role="alert">
                      {passwordMessage.type === 'success' && <IconCheck />}
                      <span>{passwordMessage.text}</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="settings-otp-input" className="form-label">
                      Enter 6-Digit Email Code
                    </label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        id="settings-otp-input"
                        className="settings-input otp-code-input"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                        placeholder="123456"
                        maxLength={6}
                        disabled={passwordSaving}
                        autoFocus
                      />
                    </div>
                    <span className="form-hint">
                      Code sent to {maskedEmail || user?.email}. Expires in 5 minutes.
                    </span>
                  </div>

                  <div className="otp-actions-bar">
                    <button
                      type="button"
                      className="resend-otp-btn"
                      onClick={onResendOtp}
                      disabled={resendCooldown > 0 || isResending || passwordSaving}
                    >
                      {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                    </button>
                  </div>

                  <div className="card-actions-split">
                    <button
                      type="button"
                      className="settings-btn ghost"
                      onClick={onCancelOtpStep}
                      disabled={passwordSaving}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="settings-btn secondary"
                      disabled={passwordSaving || otp.length !== 6}
                      id="btn-confirm-password-otp"
                    >
                      {passwordSaving ? (
                        <>
                          <span className="btn-spinner" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <span>Confirm & Change Password</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {isGoogleOnly && (
                <div className="oauth-provider-card">
                  <div className="oauth-icon-wrapper">
                    <IconGoogle />
                  </div>
                  <div className="oauth-info">
                    <h4>Connected via Google Account</h4>
                    <p>
                      Your account uses secure Google OAuth for single sign-on. Password updates and two-step verification settings are managed directly through your Google Account.
                    </p>
                  </div>
                </div>
              )}

              {isGuest && (
                <div className="oauth-provider-card guest-mode">
                  <div className="oauth-icon-wrapper guest">
                    <IconUser />
                  </div>
                  <div className="oauth-info">
                    <h4>Guest Exploration Session</h4>
                    <p>
                      You are currently exploring ResumeIQ in Guest Mode. Register a full account to set up dedicated credentials, email verification security, and save resumes to your private library.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
