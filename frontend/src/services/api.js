// frontend/src/services/api.js
import axios from 'axios';

// Configuración base de Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    // Agregar token de autenticación si existe
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log para desarrollo
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    // Log para desarrollo
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error);
    
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirigir al login solo si no estamos ya en una ruta pública
      if (window.location.pathname !== '/' && !window.location.pathname.startsWith('/shop')) {
        window.location.href = '/';
      }
    }
    
    // Crear un error más descriptivo
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Error de conexión';
    
    return Promise.reject(new Error(errorMessage));
  }
);

// Función helper para manejar errores de red
export const handleNetworkError = (error) => {
  if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
    return 'Error de conexión. Verifica que el servidor esté ejecutándose.';
  }
  if (error.code === 'ECONNABORTED') {
    return 'Tiempo de espera agotado. Intenta nuevamente.';
  }
  return error.message;
};

// Función para verificar la salud del API
export const checkApiHealth = async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/health`,
      { timeout: 5000 }
    );
    return response.data;
  } catch (error) {
    throw new Error(handleNetworkError(error));
  }
};

export default api;