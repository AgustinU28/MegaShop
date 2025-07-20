// frontend/src/services/orderService.js
import api from './api';

class OrderService {
  // ====== MÉTODOS PRINCIPALES ======

  /**
   * Obtener todas las órdenes del usuario con filtros y paginación
   * @param {Object} params - Parámetros de consulta
   * @param {number} params.page - Número de página
   * @param {number} params.limit - Elementos por página
   * @param {string} params.search - Búsqueda por número de orden
   * @param {string} params.status - Filtrar por estado
   * @param {string} params.dateFrom - Fecha desde (YYYY-MM-DD)
   * @param {string} params.dateTo - Fecha hasta (YYYY-MM-DD)
   * @param {string} params.sortBy - Campo para ordenar
   * @param {string} params.sortOrder - Orden (asc/desc)
   */
  async getAllOrders(params = {}) {
    try {
      const response = await api.get('/orders', { params });
      return {
        success: true,
        data: response.data,
        message: 'Órdenes obtenidas exitosamente'
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener las órdenes');
    }
  }

  /**
   * Obtener una orden específica por ID
   * @param {string|number} orderId - ID de la orden
   */
  async getOrderById(orderId) {
    try {
      if (!orderId) {
        throw new Error('ID de orden requerido');
      }

      const response = await api.get(`/orders/${orderId}`);
      return {
        success: true,
        data: response.data,
        message: 'Orden obtenida exitosamente'
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener la orden');
    }
  }

  /**
   * Crear una nueva orden
   * @param {Object} orderData - Datos de la orden
   * @param {Array} orderData.items - Items del carrito
   * @param {Object} orderData.shipping - Información de envío
   * @param {Object} orderData.payment - Información de pago
   * @param {Object} orderData.customer - Información del cliente
   */
  async createOrder(orderData) {
    try {
      if (!orderData.items || orderData.items.length === 0) {
        throw new Error('La orden debe tener al menos un producto');
      }

      const response = await api.post('/orders', orderData);
      return {
        success: true,
        data: response.data,
        message: 'Orden creada exitosamente'
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al crear la orden');
    }
  }

  /**
   * Actualizar el estado de una orden
   * @param {string|number} orderId - ID de la orden
   * @param {string} status - Nuevo estado
   */
  async updateOrderStatus(orderId, status) {
    try {
      if (!orderId || !status) {
        throw new Error('ID de orden y estado requeridos');
      }

      const response = await api.patch(`/orders/${orderId}/status`, { status });
      return {
        success: true,
        data: response.data,
        message: 'Estado de orden actualizado exitosamente'
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar el estado de la orden');
    }
  }

  /**
   * Cancelar una orden
   * @param {string|number} orderId - ID de la orden
   * @param {string} reason - Razón de cancelación (opcional)
   */
  async cancelOrder(orderId, reason = '') {
    try {
      if (!orderId) {
        throw new Error('ID de orden requerido');
      }

      const response = await api.patch(`/orders/${orderId}/cancel`, { reason });
      return {
        success: true,
        data: response.data,
        message: 'Orden cancelada exitosamente'
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al cancelar la orden');
    }
  }

  // ====== MÉTODOS DE DESCARGA Y EXPORTACIÓN ======

  /**
   * Descargar factura de una orden
   * @param {string|number} orderId - ID de la orden
   */
  async downloadInvoice(orderId) {
    try {
      if (!orderId) {
        throw new Error('ID de orden requerido');
      }

      const response = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });

      // Crear y descargar el archivo
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `factura-orden-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        message: 'Factura descargada exitosamente'
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al descargar la factura');
    }
  }

  /**
   * Descargar facturas de múltiples órdenes
   * @param {Array} orderIds - Array de IDs de órdenes
   */
  async downloadOrdersReport(orderIds) {
    try {
      if (!orderIds || orderIds.length === 0) {
        throw new Error('Debe seleccionar al menos una orden');
      }

      const response = await api.post('/orders/download-report', 
        { orderIds }, 
        { responseType: 'blob' }
      );

      // Crear y descargar el archivo
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-ordenes-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        message: 'Reporte descargado exitosamente'
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al descargar el reporte');
    }
  }

  /**
   * Exportar órdenes a Excel
   * @param {Array} orderIds - Array de IDs de órdenes
   */
  async exportOrders(orderIds) {
    try {
      if (!orderIds || orderIds.length === 0) {
        throw new Error('Debe seleccionar al menos una orden');
      }

      const response = await api.post('/orders/export', 
        { orderIds }, 
        { responseType: 'blob' }
      );

      // Crear y descargar el archivo
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ordenes-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        message: 'Órdenes exportadas exitosamente'
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al exportar las órdenes');
    }
  }

  // ====== MÉTODOS DE SEGUIMIENTO ======

  /**
   * Obtener información de seguimiento de una orden
   * @param {string|number} orderId - ID de la orden
   */
  async getOrderTracking(orderId) {
    try {
      if (!orderId) {
        throw new Error('ID de orden requerido');
      }

      const response = await api.get(`/orders/${orderId}/tracking`);
      return {
        success: true,
        data: response.data,
        message: 'Información de seguimiento obtenida exitosamente'
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener el seguimiento');
    }
  }

  /**
   * Actualizar información de seguimiento
   * @param {string|number} orderId - ID de la orden
   * @param {Object} trackingData - Datos de seguimiento
   */
  async updateOrderTracking(orderId, trackingData) {
    try {
      if (!orderId || !trackingData) {
        throw new Error('ID de orden y datos de seguimiento requeridos');
      }

      const response = await api.patch(`/orders/${orderId}/tracking`, trackingData);
      return {
        success: true,
        data: response.data,
        message: 'Seguimiento actualizado exitosamente'
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar el seguimiento');
    }
  }

  // ====== MÉTODOS DE ESTADÍSTICAS ======

  /**
   * Obtener estadísticas de órdenes del usuario
   */
  async getOrderStats() {
    try {
      const response = await api.get('/orders/stats');
      return {
        success: true,
        data: response.data,
        message: 'Estadísticas obtenidas exitosamente'
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener las estadísticas');
    }
  }

  /**
   * Obtener resumen de gastos por período
   * @param {string} period - Período (month, quarter, year)
   */
  async getSpendingSummary(period = 'month') {
    try {
      const response = await api.get(`/orders/spending-summary?period=${period}`);
      return {
        success: true,
        data: response.data,
        message: 'Resumen de gastos obtenido exitosamente'
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener el resumen de gastos');
    }
  }

  // ====== MÉTODOS DE VALIDACIÓN ======

  /**
   * Verificar si una orden puede ser cancelada
   * @param {string|number} orderId - ID de la orden
   */
  async canCancelOrder(orderId) {
    try {
      if (!orderId) {
        throw new Error('ID de orden requerido');
      }

      const response = await api.get(`/orders/${orderId}/can-cancel`);
      return {
        success: true,
        data: response.data,
        message: 'Verificación completada'
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al verificar si la orden puede ser cancelada');
    }
  }

  /**
   * Verificar disponibilidad de productos en una orden
   * @param {Array} items - Items a verificar
   */
  async checkProductAvailability(items) {
    try {
      if (!items || items.length === 0) {
        throw new Error('Items requeridos para verificación');
      }

      const response = await api.post('/orders/check-availability', { items });
      return {
        success: true,
        data: response.data,
        message: 'Disponibilidad verificada'
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al verificar la disponibilidad');
    }
  }

  // ====== MÉTODOS AUXILIARES ======

  /**
   * Obtener estados de orden disponibles
   */
  async getOrderStatuses() {
    try {
      const response = await api.get('/orders/statuses');
      return {
        success: true,
        data: response.data,
        message: 'Estados obtenidos exitosamente'
      };
    } catch (error) {
      // Fallback con estados predefinidos
      return {
        success: true,
        data: [
          { value: 'pending', label: 'Pendiente', color: 'warning' },
          { value: 'confirmed', label: 'Confirmado', color: 'info' },
          { value: 'processing', label: 'Procesando', color: 'primary' },
          { value: 'shipped', label: 'Enviado', color: 'info' },
          { value: 'delivered', label: 'Entregado', color: 'success' },
          { value: 'cancelled', label: 'Cancelado', color: 'danger' }
        ],
        message: 'Estados predefinidos cargados'
      };
    }
  }

  /**
   * Calcular totales de una orden
   * @param {Array} items - Items de la orden
   * @param {Object} options - Opciones adicionales
   */
  calculateOrderTotals(items, options = {}) {
    try {
      if (!items || items.length === 0) {
        return {
          subtotal: 0,
          tax: 0,
          shipping: 0,
          discount: 0,
          total: 0,
          itemCount: 0
        };
      }

      const subtotal = items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);

      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
      
      // IVA 21% (configurable)
      const taxRate = options.taxRate || 0.21;
      const tax = subtotal * taxRate;
      
      // Envío gratis para compras mayores a $50,000
      const freeShippingThreshold = options.freeShippingThreshold || 50000;
      const shippingCost = options.shippingCost || 2500;
      const shipping = subtotal >= freeShippingThreshold ? 0 : shippingCost;
      
      // Descuento
      const discount = options.discount || 0;
      
      const total = subtotal + tax + shipping - discount;

      return {
        subtotal: Math.round(subtotal * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        shipping: Math.round(shipping * 100) / 100,
        discount: Math.round(discount * 100) / 100,
        total: Math.round(total * 100) / 100,
        itemCount
      };
    } catch (error) {
      console.error('Error calculating order totals:', error);
      return {
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: 0,
        itemCount: 0
      };
    }
  }

  /**
   * Formatear precio para mostrar
   * @param {number} price - Precio a formatear
   */
  formatPrice(price) {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(price || 0);
  }

  /**
   * Formatear fecha para mostrar
   * @param {string|Date} date - Fecha a formatear
   */
  formatDate(date) {
    if (!date) return '';
    
    return new Date(date).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Obtener configuración de estado con colores e iconos
   * @param {string} status - Estado de la orden
   */
  getStatusConfig(status) {
    const statusConfigs = {
      pending: { 
        variant: 'warning', 
        icon: 'FaClock', 
        text: 'Pendiente',
        description: 'La orden está pendiente de confirmación'
      },
      confirmed: { 
        variant: 'info', 
        icon: 'FaCheckCircle', 
        text: 'Confirmado',
        description: 'La orden ha sido confirmada y está siendo preparada'
      },
      processing: { 
        variant: 'primary', 
        icon: 'FaClock', 
        text: 'Procesando',
        description: 'La orden está siendo procesada'
      },
      shipped: { 
        variant: 'info', 
        icon: 'FaShippingFast', 
        text: 'Enviado',
        description: 'La orden ha sido enviada y está en camino'
      },
      delivered: { 
        variant: 'success', 
        icon: 'FaCheckCircle', 
        text: 'Entregado',
        description: 'La orden ha sido entregada exitosamente'
      },
      cancelled: { 
        variant: 'danger', 
        icon: 'FaTimesCircle', 
        text: 'Cancelado',
        description: 'La orden ha sido cancelada'
      }
    };

    return statusConfigs[status] || statusConfigs.pending;
  }
}

// Crear instancia del servicio
const orderService = new OrderService();

export default orderService;