import axios from 'axios';

const API_BASE = '/api';

/**
 * Helper to retrieve cookie by name (used for reading XSRF-TOKEN set by Spring Security)
 */
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Required for session cookies & XSRF-TOKEN cookie
});

// Request Interceptor: Attach X-XSRF-TOKEN header to state-changing secure requests
apiClient.interceptors.request.use((config) => {
  const method = config.method ? config.method.toUpperCase() : 'GET';

  if (['POST', 'PUT', 'DELETE'].includes(method)) {
    const xsrfToken = getCookie('XSRF-TOKEN');
    if (xsrfToken) {
      config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export const api = {
  // Initialize CSRF Cookie from Backend
  initCsrf: async () => {
    try {
      await apiClient.get('/csrf');
    } catch (err) {
      console.warn('CSRF Initialization error:', err);
    }
  },

  // Auth Endpoints
  login: async (username, password) => {
    const response = await apiClient.post('/auth/login', { username, password });
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Secure Complaint Endpoints
  getComplaints: async (category = 'ALL', status = 'ALL') => {
    const params = {};
    if (category !== 'ALL') params.category = category;
    if (status !== 'ALL') params.status = status;
    const response = await apiClient.get('/complaints', { params });
    return response.data;
  },

  createComplaint: async (formData) => {
    await api.initCsrf();
    const response = await apiClient.post('/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateComplaintStatus: async (id, status) => {
    await api.initCsrf();
    const response = await apiClient.put(`/complaints/${id}/status`, { status });
    return response.data;
  },

  deleteComplaint: async (id) => {
    await api.initCsrf();
    const response = await apiClient.delete(`/complaints/${id}`);
    return response.data;
  },

  resetDatabase: async () => {
    await api.initCsrf();
    const response = await apiClient.post('/complaints/reset');
    return response.data;
  },
};

export default apiClient;
