import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fraudgraph_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: clear token if invalid
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const transactionAPI = {
  create: (data) => api.post('/transactions', data),
  getList: (page = 0, size = 20) => api.get(`/transactions?page=${page}&size=${size}`),
  getRecent: () => api.get('/transactions/recent'),
  getByRef: (ref) => api.get(`/transactions/${ref}`),
};

export const alertAPI = {
  getList: (page = 0, size = 20) => api.get(`/alerts?page=${page}&size=${size}`),
  getPrioritized: (limit = 15) => api.get(`/alerts/prioritized?limit=${limit}`),
  getByRef: (ref) => api.get(`/alerts/${ref}`),
  resolve: (ref, data) => api.patch(`/alerts/${ref}/resolve`, data),
};

export const analyticsAPI = {
  getSummary: () => api.get('/analytics/summary'),
  getDriftReports: () => api.get('/analytics/drift-reports'),
};

export const graphAPI = {
  getTopology: () => api.get('/graph/topology'),
};

export const simulationAPI = {
  runBatch: (data) => api.post('/simulation/batch', data),
  generateSingle: () => api.post('/simulation/single'),
  toggleStreaming: (active, scenario = 'NORMAL_STREAM') =>
    api.post('/simulation/toggle', { active, scenario }),
  getStatus: () => api.get('/simulation/status'),
};

export default api;
