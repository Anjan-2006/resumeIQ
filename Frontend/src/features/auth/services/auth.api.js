import axios from 'axios';
import { API_BASE_URL, setupAuthInterceptor } from '../../../config/api';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`,
  withCredentials: true,
});

setupAuthInterceptor(api);

// Registration API
export async function register({ username, email, password }) {
  try {
    const response = await api.post('/register', { username, email, password });
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function verifyRegistrationApi({ tempToken, otp }) {
  try {
    const response = await api.post('/verify-registration', { tempToken, otp });
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function resendRegistrationOtpApi({ tempToken }) {
  try {
    const response = await api.post('/resend-registration-otp', { tempToken });
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

// Login API
export async function login({ email, password }) {
  try {
    const response = await api.post('/login', { email, password });
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function verifyLoginApi({ tempToken, otp }) {
  try {
    const response = await api.post('/verify-login', { tempToken, otp });
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function resendLoginOtpApi({ tempToken }) {
  try {
    const response = await api.post('/resend-login-otp', { tempToken });
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

// Guest, Logout & Session API
export async function guestLogin() {
  try {
    const response = await api.post('/guest-login');
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function logout() {
  try {
    const response = await api.post('/logout');
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function refreshTokenApi() {
  try {
    const response = await api.post('/refresh');
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function getMe() {
  try {
    const response = await api.get('/getme');
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

// Profile & Password Update APIs
export async function updateProfileApi({ username }) {
  try {
    const response = await api.patch('/profile', { username });
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function initiatePasswordChangeApi({ currentPassword, newPassword, confirmPassword }) {
  try {
    const response = await api.patch('/password', { currentPassword, newPassword, confirmPassword });
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function verifyPasswordChangeApi({ tempToken, otp }) {
  try {
    const response = await api.post('/password/verify', { tempToken, otp });
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function resendPasswordChangeOtpApi({ tempToken }) {
  try {
    const response = await api.post('/password/resend-otp', { tempToken });
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

// Forgot Password Flow APIs
export async function forgotPasswordApi({ email }) {
  try {
    const response = await api.post('/forgot-password', { email });
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function verifyForgotPasswordApi({ email, otp }) {
  try {
    const response = await api.post('/verify-forgot-password', { email, otp });
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function resetPasswordApi({ tempToken, newPassword }) {
  try {
    const response = await api.post('/reset-password', { tempToken, newPassword });
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function resendForgotPasswordApi({ email }) {
  try {
    const response = await api.post('/resend-forgot-password', { email });
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

