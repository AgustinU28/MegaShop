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
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadCart();
  }, []);

  const value = {
    ...state,
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