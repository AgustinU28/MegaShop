// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../services/api';

// Estado inicial
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true
};

// Tipos de acciones
const AUTH_TYPES = {
  USER_LOADED: 'USER_LOADED',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  AUTH_ERROR: 'AUTH_ERROR',
  LOGOUT: 'LOGOUT',
  CLEAR_ERRORS: 'CLEAR_ERRORS'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_TYPES.USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload
      };
    
    case AUTH_TYPES.LOGIN_SUCCESS:
    case AUTH_TYPES.REGISTER_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        ...action.payload,
        isAuthenticated: true,
        loading: false
      };
    
    case AUTH_TYPES.AUTH_ERROR:
    case AUTH_TYPES.LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null
      };
    
    case AUTH_TYPES.CLEAR_ERRORS:
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
};

// Crear contexto
const AuthContext = createContext();

// Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

// Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Cargar usuario si hay token
  useEffect(() => {
    if (state.token) {
      loadUser();
    } else {
      dispatch({ type: AUTH_TYPES.AUTH_ERROR });
    }
  }, []);

  // Cargar datos del usuario
  const loadUser = async () => {
    try {
      const response = await api.get('/auth/me');
      dispatch({
        type: AUTH_TYPES.USER_LOADED,
        payload: response.data.user
      });
    } catch (error) {
      dispatch({ type: AUTH_TYPES.AUTH_ERROR });
    }
  };

  // Registrar usuario
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        dispatch({
          type: AUTH_TYPES.REGISTER_SUCCESS,
          payload: response.data
        });
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error en el registro';
      dispatch({ type: AUTH_TYPES.AUTH_ERROR });
      return { success: false, error: errorMessage };
    }
  };

  // Iniciar sesión
  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.success) {
        dispatch({
          type: AUTH_TYPES.LOGIN_SUCCESS,
          payload: response.data
        });
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error en el inicio de sesión';
      dispatch({ type: AUTH_TYPES.AUTH_ERROR });
      return { success: false, error: errorMessage };
    }
  };

  // Cerrar sesión
  const logout = () => {
    dispatch({ type: AUTH_TYPES.LOGOUT });
  };

  // Limpiar errores
  const clearErrors = () => {
    dispatch({ type: AUTH_TYPES.CLEAR_ERRORS });
  };

  const value = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    register,
    login,
    logout,
    clearErrors,
    loadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};