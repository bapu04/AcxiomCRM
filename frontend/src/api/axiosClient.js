import axios from 'axios';

const axiosClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if token exists
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('acxiom_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for auth handling
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if checking me or login failed
      const isAuthCheck = error.config.url.includes('/auth/me');
      const isLoginRequest = error.config.url.includes('/auth/login');
      if (!isAuthCheck && !isLoginRequest) {
        localStorage.removeItem('acxiom_token');
        localStorage.removeItem('acxiom_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
