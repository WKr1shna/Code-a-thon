import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5005/api/v1',
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
