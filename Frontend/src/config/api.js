import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const API_BASE_URL = API_URL.replace(/\/$/, '');

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

/**
 * Attaches a shared response interceptor to handle access token expiration (401),
 * automatic token refresh via POST /api/auth/refresh, request queueing to prevent refresh storms,
 * and retry upon successful refresh.
 */
export function setupAuthInterceptor(axiosInstance) {
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Do not attempt refresh on 401s from refresh endpoint, login, register, or if already retried
      const isAuthBypass =
        originalRequest?.url?.includes('/refresh') ||
        originalRequest?.url?.includes('/login') ||
        originalRequest?.url?.includes('/register') ||
        originalRequest?.url?.includes('/verify-');

      if (
        error.response &&
        error.response.status === 401 &&
        !originalRequest?._retry &&
        !isAuthBypass
      ) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => axiosInstance(originalRequest))
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          await axios.post(
            `${API_BASE_URL}/api/auth/refresh`,
            {},
            { withCredentials: true }
          );

          processQueue(null);
          return axiosInstance(originalRequest);
        } catch (refreshErr) {
          processQueue(refreshErr);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:expired'));
          }
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
}
