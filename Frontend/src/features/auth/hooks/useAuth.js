import { useContext } from "react";
import { AuthContext } from "../auth.context";
import {
  login,
  verifyLoginApi,
  resendLoginOtpApi,
  register,
  verifyRegistrationApi,
  resendRegistrationOtpApi,
  guestLogin,
  logout,
  updateProfileApi,
  initiatePasswordChangeApi,
  verifyPasswordChangeApi,
  resendPasswordChangeOtpApi
} from "../services/auth.api";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  const { user, setUser, loading, setLoading } = context;

  // -------------------------
  // Registration Flow
  // -------------------------
  const handleRegister = async ({ username, email, password }) => {
    setLoading(true);
    try {
      const data = await register({ username, email, password });
      if (data && data.otpRequired) {
        return {
          success: true,
          otpRequired: true,
          tempToken: data.tempToken,
          email: data.email,
          message: data.message
        };
      }
      return { success: false, message: "Invalid server response" };
    } catch (err) {
      console.log(err);
      return {
        success: false,
        message: err?.response?.data?.message || "Unable to create account. Please check your details."
      };
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRegistration = async ({ tempToken, otp }) => {
    setLoading(true);
    try {
      const data = await verifyRegistrationApi({ tempToken, otp });
      if (data && data.user) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: "Verification failed" };
    } catch (err) {
      console.log(err);
      return {
        success: false,
        message: err?.response?.data?.message || "Invalid or expired verification code."
      };
    } finally {
      setLoading(false);
    }
  };

  const handleResendRegistrationOtp = async ({ tempToken }) => {
    try {
      const data = await resendRegistrationOtpApi({ tempToken });
      return { success: true, message: data.message };
    } catch (err) {
      console.log(err);
      return {
        success: false,
        message: err?.response?.data?.message || "Unable to resend verification code."
      };
    }
  };

  // -------------------------
  // Login Flow
  // -------------------------
  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    try {
      const data = await login({ email, password });
      if (data && data.otpRequired) {
        return {
          success: true,
          otpRequired: true,
          tempToken: data.tempToken,
          email: data.email,
          message: data.message
        };
      }
      return { success: false, message: "Invalid server response" };
    } catch (err) {
      console.log(err);
      return {
        success: false,
        message: err?.response?.data?.message || "Invalid email or password."
      };
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLogin = async ({ tempToken, otp }) => {
    setLoading(true);
    try {
      const data = await verifyLoginApi({ tempToken, otp });
      if (data && data.user) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: "Verification failed" };
    } catch (err) {
      console.log(err);
      return {
        success: false,
        message: err?.response?.data?.message || "Invalid or expired verification code."
      };
    } finally {
      setLoading(false);
    }
  };

  const handleResendLoginOtp = async ({ tempToken }) => {
    try {
      const data = await resendLoginOtpApi({ tempToken });
      return { success: true, message: data.message };
    } catch (err) {
      console.log(err);
      return {
        success: false,
        message: err?.response?.data?.message || "Unable to resend verification code."
      };
    }
  };

  // -------------------------
  // Profile Updates
  // -------------------------
  const handleUpdateProfile = async ({ username }) => {
    try {
      const data = await updateProfileApi({ username });
      if (data && data.user) {
        setUser(data.user);
        return { success: true, message: data.message || "Profile updated successfully." };
      }
      return { success: false, message: "Unable to update profile." };
    } catch (err) {
      console.log(err);
      return {
        success: false,
        message: err?.response?.data?.message || "Unable to update profile. Please try again."
      };
    }
  };

  // -------------------------
  // Password Updates with Email OTP
  // -------------------------
  const handleInitiatePasswordChange = async ({ currentPassword, newPassword, confirmPassword }) => {
    try {
      const data = await initiatePasswordChangeApi({ currentPassword, newPassword, confirmPassword });
      if (data && data.otpRequired) {
        return {
          success: true,
          otpRequired: true,
          tempToken: data.tempToken,
          email: data.email,
          message: data.message || "Verification code sent to your email."
        };
      }
      return { success: false, message: "Unable to initiate password change." };
    } catch (err) {
      console.log(err);
      return {
        success: false,
        message: err?.response?.data?.message || "Unable to initiate password change. Please check your current password."
      };
    }
  };

  const handleVerifyPasswordChange = async ({ tempToken, otp }) => {
    try {
      const data = await verifyPasswordChangeApi({ tempToken, otp });
      return { success: true, message: data.message || "Password changed successfully." };
    } catch (err) {
      console.log(err);
      return {
        success: false,
        message: err?.response?.data?.message || "Invalid or expired verification code."
      };
    }
  };

  const handleResendPasswordChangeOtp = async ({ tempToken }) => {
    try {
      const data = await resendPasswordChangeOtpApi({ tempToken });
      return {
        success: true,
        message: data.message,
        tempToken: data.tempToken,
        email: data.email
      };
    } catch (err) {
      console.log(err);
      return {
        success: false,
        message: err?.response?.data?.message || "Unable to resend verification code."
      };
    }
  };

  // -------------------------
  // Guest & Logout
  // -------------------------
  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      const data = await guestLogin();
      if (data && data.user) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: "Guest login failed" };
    } catch (err) {
      console.log(err);
      return { success: false, message: "Guest demo is temporarily unavailable." };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("resumeiq_had_session");
        sessionStorage.removeItem("resumeiq_session_expired");
      }
      await logout();
      setUser(null);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    setUser,
    loading,
    handleRegister,
    handleVerifyRegistration,
    handleResendRegistrationOtp,
    handleLogin,
    handleVerifyLogin,
    handleResendLoginOtp,
    handleUpdateProfile,
    handleInitiatePasswordChange,
    handleVerifyPasswordChange,
    handleResendPasswordChangeOtp,
    handleGuestLogin,
    handleLogout
  };
}
