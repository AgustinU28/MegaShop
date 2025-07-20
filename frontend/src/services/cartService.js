// frontend/src/services/cartService.js
import api from './api';

class CartService {
  // Crear un nuevo carrito
  async createCart() {
    try {
      const response = await api.post('/carts');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al crear carrito');
    }
  }

  // Obtener carrito por ID
  async getCartById(cartId) {
    try {
      const response = await api.get(`/carts/${cartId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener carrito');
    }
  }

  // Agregar producto al carrito
  async addProductToCart(cartId, productId, quantity = 1) {
    try {
      const response = await api.post(`/carts/${cartId}/products`, {
        productId,
        quantity
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al agregar producto al carrito');
    }
  }

  // Actualizar cantidad de producto en el carrito
  async updateProductQuantity(cartId, productId, quantity) {
    try {
      const response = await api.put(`/carts/${cartId}/products/${productId}`, {
        quantity
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar cantidad');
    }
  }

  // Eliminar producto del carrito
  async removeProductFromCart(cartId, productId) {
    try {
      const response = await api.delete(`/carts/${cartId}/products/${productId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al eliminar producto del carrito');
    }
  }

  // Vaciar carrito
  async clearCart(cartId) {
    try {
      const response = await api.delete(`/carts/${cartId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al vaciar carrito');
    }
  }

  // Obtener todos los carritos (Admin)
  async getAllCarts() {
    try {
      const response = await api.get('/carts');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener carritos');
    }
  }

  // Métodos locales para manejo de carrito en localStorage
  getLocalCartId() {
    return localStorage.getItem('cartId');
  }

  setLocalCartId(cartId) {
    localStorage.setItem('cartId', cartId);
  }

  removeLocalCartId() {
    localStorage.removeItem('cartId');
  }

  // Inicializar carrito (crear si no existe)
  async initializeCart() {
    let cartId = this.getLocalCartId();
    
    if (!cartId) {
      try {
        const response = await this.createCart();
        // 🔧 FIX: Usar cartId en lugar de id
        cartId = response.data.cartId;
        this.setLocalCartId(cartId);
      } catch (error) {
        console.error('Error al inicializar carrito:', error);
        throw error;
      }
    } else {
      // Verificar si el carrito existe en el servidor
      try {
        await this.getCartById(cartId);
      } catch (error) {
        // Si el carrito no existe, crear uno nuevo
        console.log('Carrito no encontrado, creando uno nuevo...');
        localStorage.removeItem('cartId');
        const response = await this.createCart();
        cartId = response.data.cartId;
        this.setLocalCartId(cartId);
      }
    }
    
    return cartId;
  }

  // Obtener carrito actual (del localStorage)
  async getCurrentCart() {
    try {
      const cartId = await this.initializeCart();
      return await this.getCartById(cartId);
    } catch (error) {
      console.error('Error al obtener carrito actual:', error);
      // Si falla, limpiar localStorage e intentar crear uno nuevo
      localStorage.removeItem('cartId');
      try {
        const cartId = await this.initializeCart();
        return await this.getCartById(cartId);
      } catch (retryError) {
        throw retryError;
      }
    }
  }

  // Agregar producto al carrito actual
  async addToCurrentCart(productId, quantity = 1) {
    try {
      const cartId = await this.initializeCart();
      return await this.addProductToCart(cartId, productId, quantity);
    } catch (error) {
      console.error('Error al agregar al carrito actual:', error);
      throw error;
    }
  }

  // Actualizar cantidad en carrito actual
  async updateCurrentCartQuantity(productId, quantity) {
    try {
      const cartId = this.getLocalCartId();
      if (!cartId) {
        throw new Error('No hay carrito activo');
      }
      return await this.updateProductQuantity(cartId, productId, quantity);
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      throw error;
    }
  }

  // Eliminar producto del carrito actual
  async removeFromCurrentCart(productId) {
    try {
      const cartId = this.getLocalCartId();
      if (!cartId) {
        throw new Error('No hay carrito activo');
      }
      return await this.removeProductFromCart(cartId, productId);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      throw error;
    }
  }

  // Vaciar carrito actual
  async clearCurrentCart() {
    try {
      const cartId = this.getLocalCartId();
      if (!cartId) {
        throw new Error('No hay carrito activo');
      }
      const response = await this.clearCart(cartId);
      return response;
    } catch (error) {
      console.error('Error al vaciar carrito:', error);
      throw error;
    }
  }

  // Obtener resumen del carrito
  getCartSummary(cart) {
    if (!cart || !cart.data) {
      return {
        itemCount: 0,
        subtotal: 0,
        total: 0,
        isEmpty: true
      };
    }

    const cartData = cart.data;
    return {
      itemCount: cartData.totalItems || 0,
      subtotal: cartData.subtotal || 0,
      total: cartData.total || 0,
      tax: cartData.tax || 0,
      shipping: cartData.shipping || 0,
      isEmpty: !cartData.items || cartData.items.length === 0
    };
  }
}

export default new CartService();