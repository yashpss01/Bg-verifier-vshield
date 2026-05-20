import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

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
    // Note: Mount endpoint directly to backend port root
    const response = await axios.post(`http://localhost:5001/api/verifications/${id}/start`, {}, {
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
    return `http://localhost:5001/api/reports/${id}?token=${token}`;
  },
};

export default api;
