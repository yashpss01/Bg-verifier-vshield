import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject Authorization header if token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vshield_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Centralized API hooks
export const authService = {
  register: async (payload: any) => {
    const response = await api.post('/auth/register', payload);
    return response.data;
  },
  login: async (payload: any) => {
    const response = await api.post('/auth/login', payload);
    return response.data;
  },
};

export const candidateService = {
  list: async (filters?: { search?: string; status?: string }) => {
    const response = await api.get('/candidates', { params: filters });
    return response.data;
  },
  create: async (payload: any) => {
    const response = await api.post('/candidates', payload);
    return response.data;
  },
  get: async (id: string) => {
    const response = await api.get(`/candidates/${id}`);
    return response.data;
  },
  update: async (id: string, payload: any) => {
    const response = await api.put(`/candidates/${id}`, payload);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/candidates/${id}`);
    return response.data;
  },
};

export const verificationService = {
  start: async (id: string) => {
    const response = await axios.post(`${API_BASE_URL}/verifications/${id}/start`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('vshield_token')}`,
      }
    });
    return response.data;
  },
};

export const reportService = {
  getJson: async (id: string) => {
    const response = await api.get(`/reports/${id}`, {
      params: { format: 'json' },
    });
    return response.data;
  },
  getDownloadUrl: (id: string) => {
    const token = localStorage.getItem('vshield_token');
    const rootUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;
    return `${rootUrl}/api/reports/${id}?token=${token}`;
  },
};

export default api;
