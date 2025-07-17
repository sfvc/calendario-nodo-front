import axios from 'axios';

// Crear la instancia
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`
});

// Interceptores de request (opcional)
api.interceptors.request.use(
  (config) => {
    // Agregar token si existe
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptores de respuesta (opcional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('accessToken')
      window.location.href = '/login'
    }
    
    return Promise.reject(error);
  }
);

export default api;
