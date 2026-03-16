import axios from 'axios';
import tokenService from './tokenService';

let storeRef;
let refreshPromise = null;

export const injectStore = (store) => {
  storeRef = store;
};

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

const rawAxios = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = tokenService.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!error.response || error.response.status !== 401 || originalRequest?._retry || originalRequest?.url?.includes('/api/auth/refresh')) {
      return Promise.reject(error);
    }

    const refreshToken = tokenService.getRefreshToken();
    if (!refreshToken) {
      if (storeRef) {
        const { logout } = await import('../features/auth/authSlice');
        storeRef.dispatch(logout());
      }
      window.location.assign('/login');
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = rawAxios.post('/api/auth/refresh', { refreshToken }).finally(() => {
          refreshPromise = null;
        });
      }
      const response = await refreshPromise;
      const accessToken = response.data.accessToken;
      tokenService.setTokens({ accessToken, refreshToken });
      if (storeRef) {
        const { setAccessToken } = await import('../features/auth/authSlice');
        storeRef.dispatch(setAccessToken(accessToken));
      }
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      tokenService.clear();
      if (storeRef) {
        const { logout } = await import('../features/auth/authSlice');
        storeRef.dispatch(logout());
      }
      window.location.assign('/login');
      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;
