// frontend/src/services/productService.js
import api from './api';

class ProductService {
  // Obtener todos los productos
  async getAllProducts(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.inStock) params.append('inStock', filters.inStock);

      const response = await api.get(`/products?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener productos');
    }
  }

  // Obtener producto por ID
  async getProductById(id) {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener producto');
    }
  }

  // Buscar productos
  async searchProducts(query) {
    try {
      const response = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error en la búsqueda');
    }
  }

  // Crear producto (Admin)
  async createProduct(productData) {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al crear producto');
    }
  }

  // Actualizar producto (Admin)
  async updateProduct(id, productData) {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar producto');
    }
  }

  // Eliminar producto (Admin)
  async deleteProduct(id) {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al eliminar producto');
    }
  }

  // Actualizar stock
  async updateStock(id, quantity, operation) {
    try {
      const response = await api.patch(`/products/${id}/stock`, {
        quantity,
        operation
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar stock');
    }
  }

  // Obtener productos con stock bajo
  async getLowStockProducts(threshold = 5) {
    try {
      const response = await api.get('/products');
      const products = response.data.data.filter(product => product.stock <= threshold);
      return {
        success: true,
        data: products,
        count: products.length
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener productos con stock bajo');
    }
  }

  // Obtener productos por rango de precio
  async getProductsByPriceRange(minPrice, maxPrice) {
    return this.getAllProducts({ minPrice, maxPrice });
  }

  // Obtener productos disponibles
  async getAvailableProducts() {
    return this.getAllProducts({ inStock: true });
  }
}

export default new ProductService();