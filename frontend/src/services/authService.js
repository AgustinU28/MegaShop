// frontend/src/services/authService.js
import api from './api';

class AuthService {
  // Registrar nuevo usuario
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      
      // Si el registro es exitoso y retorna token, guardarlo
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error en el registro');
    }
  }

  // Iniciar sesión
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      
      // Si el login es exitoso, guardar token y usuario
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error en el inicio de sesión');
    }
  }

  // Cerrar sesión
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cartId'); // También limpiar carrito
  }

  // Obtener usuario actual
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener usuario');
    }
  }

  // Verificar si está autenticado
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  // Obtener token
  getToken() {
    return localStorage.getItem('token');
  }

  // Obtener usuario desde localStorage
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Actualizar perfil
  async updateProfile(profileData) {
    try {
      const response = await api.put('/auth/profile', profileData);
      
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar perfil');
    }
  }

  // Cambiar contraseña
  async changePassword(passwordData) {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al cambiar contraseña');
    }
  }

  // Solicitar reset de contraseña
  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al solicitar reset de contraseña');
    }
  }

  // Reset de contraseña
  async resetPassword(token, newPassword) {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        password: newPassword
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al resetear contraseña');
    }
  }
}

export default new AuthService();