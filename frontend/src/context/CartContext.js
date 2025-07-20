// frontend/src/context/CartContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import cartService from '../services/cartService';

const CartContext = createContext();

// Reducer para manejar el estado del carrito
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload.items || [],
        total: action.payload.total || 0,
        itemCount: action.payload.totalItems || 0,
        loaded: true
      };
    
    case 'ADD_ITEM':
      return {
        ...state,
        items: action.payload.items || state.items,
        total: action.payload.total || state.total,
        itemCount: action.payload.totalItems || state.itemCount
      };
    
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.productId === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.productId !== action.payload),
        itemCount: state.itemCount - 1
      };
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    
    default:
      return state;
  }
};

const initialState = {
  items: [],
  total: 0,
  itemCount: 0,
  loading: false,
  loaded: false
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Cargar carrito al inicializar
  useEffect(() => {
    const loadCart = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await cartService.getCurrentCart();
        dispatch({ type: 'LOAD_CART', payload: response.data });
      } catch (error) {
        console.error('Error loading cart:', error);
        // Si hay error, inicializar con carrito vacío
        dispatch({ type: 'LOAD_CART', payload: { items: [], total: 0, totalItems: 0 } });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadCart();
  }, []);

  // 🔥 FUNCIONES QUE FALTABAN:

  // Agregar producto al carrito
  const addToCart = async (productId, quantity = 1) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await cartService.addToCurrentCart(productId, quantity);
      
      if (response.success) {
        dispatch({ type: 'ADD_ITEM', payload: response.data });
        return response;
      } else {
        throw new Error(response.message || 'Error al agregar producto al carrito');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Actualizar cantidad
  const updateQuantity = async (productId, quantity) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await cartService.updateCurrentCartQuantity(productId, quantity);
      
      if (response.success) {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
        dispatch({ type: 'LOAD_CART', payload: response.data });
        return response;
      } else {
        throw new Error(response.message || 'Error al actualizar cantidad');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Eliminar producto del carrito
  const removeFromCart = async (productId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await cartService.removeFromCurrentCart(productId);
      
      if (response.success) {
        dispatch({ type: 'REMOVE_ITEM', payload: productId });
        dispatch({ type: 'LOAD_CART', payload: response.data });
        return response;
      } else {
        throw new Error(response.message || 'Error al eliminar producto');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Vaciar carrito
  const clearCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await cartService.clearCurrentCart();
      
      if (response.success) {
        dispatch({ type: 'CLEAR_CART' });
        return response;
      } else {
        throw new Error(response.message || 'Error al vaciar carrito');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Recargar carrito
  const reloadCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await cartService.getCurrentCart();
      dispatch({ type: 'LOAD_CART', payload: response.data });
      return response;
    } catch (error) {
      console.error('Error reloading cart:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Obtener resumen del carrito
  const getCartSummary = () => {
    return {
      itemCount: state.itemCount,
      total: state.total,
      isEmpty: state.items.length === 0,
      items: state.items
    };
  };

  // Verificar si un producto está en el carrito
  const isInCart = (productId) => {
    return state.items.some(item => item.productId === productId);
  };

  // Obtener cantidad de un producto en el carrito
  const getProductQuantity = (productId) => {
    const item = state.items.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };

  const value = {
    // Estado
    ...state,
    
    // Funciones principales
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    reloadCart,
    
    // Utilidades
    getCartSummary,
    isInCart,
    getProductQuantity,
    
    // Para compatibilidad
    dispatch
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de CartProvider');
  }
  return context;
};