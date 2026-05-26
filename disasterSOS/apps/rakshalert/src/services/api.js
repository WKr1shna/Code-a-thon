import axios from 'axios';

const PROD_API = 'https://code-a-thon-wblx.onrender.com/api/v1';
const DEV_API = 'http://localhost:5050/api/v1';
const BASE_URL = import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost' ? DEV_API : PROD_API);

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rakshalert_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optionally handle global 401s here to force logout
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('rakshalert_token');
      localStorage.removeItem('rakshalert_user');
      // window.location.href = '/login'; // Or handle in AuthContext
    }
    return Promise.reject(error);
  }
);

export default api;
