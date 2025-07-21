// frontend/src/services/orderService.js - Con apertura en nueva ventana

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

  // ====== MÉTODOS DE DESCARGA Y EXPORTACIÓN - ACTUALIZADOS ======

  /**
   * Descargar factura de una orden como PDF - NUEVA VERSIÓN QUE ABRE EN VENTANA
   * @param {string|number} orderId - ID de la orden
   */
  async downloadInvoice(orderId) {
    try {
      if (!orderId) {
        throw new Error('ID de orden requerido');
      }

      console.log('📄 Downloading invoice for order:', orderId);

      // ✅ CAMBIO: responseType blob configurado correctamente
      const response = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });

      // ✅ CAMBIO: En lugar de hacer download automático, abrir en nueva ventana
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // ✅ NUEVA FUNCIONALIDAD: Abrir PDF en nueva pestaña
      const newWindow = window.open(url, '_blank');
      
      // Verificar si la ventana se abrió correctamente
      if (!newWindow) {
        // Si no se puede abrir en nueva ventana (por bloqueo de popups), hacer download
        console.log('⚠️ Popup blocked, falling back to download');
        this.fallbackDownload(blob, orderId);
      } else {
        // Opcional: cerrar la URL después de un tiempo para liberar memoria
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 10000); // 10 segundos
      }

      console.log('✅ Invoice opened in new window successfully');
      
      return {
        success: true,
        message: 'Factura abierta en nueva ventana'
      };
    } catch (error) {
      console.error('❌ Error opening invoice:', error);
      throw new Error(error.response?.data?.message || 'Error al abrir la factura');
    }
  }

  /**
   * Método de respaldo para descargar si no se puede abrir en ventana
   * @param {Blob} blob - Blob del PDF
   * @param {string} orderId - ID de la orden
   */
  fallbackDownload(blob, orderId) {
    try {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generar nombre de archivo con timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `factura-orden-${orderId}-${timestamp}.pdf`;
      
      // Agregar al DOM, hacer clic y remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar URL del objeto
      window.URL.revokeObjectURL(url);

      console.log('✅ Invoice downloaded as fallback');
    } catch (error) {
      console.error('❌ Error in fallback download:', error);
    }
  }

  /**
   * Método alternativo: Forzar descarga (mantener funcionalidad original)
   * @param {string|number} orderId - ID de la orden
   */
  async forceDownloadInvoice(orderId) {
    try {
      if (!orderId) {
        throw new Error('ID de orden requerido');
      }

      console.log('📄 Force downloading invoice for order:', orderId);

      const response = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });

      // Forzar descarga directa
      const blob = new Blob([response.data], { type: 'application/pdf' });
      this.fallbackDownload(blob, orderId);
      
      return {
        success: true,
        message: 'Factura descargada exitosamente'
      };
    } catch (error) {
      console.error('❌ Error downloading invoice:', error);
      throw new Error(error.response?.data?.message || 'Error al descargar la factura');
    }
  }

  /**
   * Descargar facturas de múltiples órdenes como un reporte
   * @param {Array} orderIds - Array de IDs de órdenes
   */
  async downloadOrdersReport(orderIds) {
    try {
      if (!orderIds || orderIds.length === 0) {
        throw new Error('Debe seleccionar al menos una orden');
      }

      console.log('📄 Downloading bulk invoice report for orders:', orderIds);

      const response = await api.post('/orders/bulk-invoice', 
        { orderIds }, 
        { responseType: 'blob' }
      );

      // Crear y descargar el archivo
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `reporte-facturas-${timestamp}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ Bulk invoice report downloaded successfully');

      return {
        success: true,
        message: 'Reporte de facturas descargado exitosamente'
      };
    } catch (error) {
      console.error('❌ Error downloading bulk invoice report:', error);
      throw new Error(error.response?.data?.message || 'Error al descargar el reporte de facturas');
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

      console.log('📊 Exporting orders to Excel:', orderIds);

      const response = await api.post('/orders/export', 
        { orderIds }, 
        { responseType: 'blob' }
      );

      // Crear y descargar el archivo Excel
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `ordenes-${timestamp}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ Orders exported to Excel successfully');

      return {
        success: true,
        message: 'Órdenes exportadas a Excel exitosamente'
      };
    } catch (error) {
      console.error('❌ Error exporting orders to Excel:', error);
      throw new Error(error.response?.data?.message || 'Error al exportar las órdenes');
    }
  }

  // ====== RESTO DE MÉTODOS (sin cambios) ======

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

  async getOrderStatuses() {
    try {
      const response = await api.get('/orders/statuses');
      return {
        success: true,
        data: response.data,
        message: 'Estados obtenidos exitosamente'
      };
    } catch (error) {
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
      
      const taxRate = options.taxRate || 0.21;
      const tax = subtotal * taxRate;
      
      const freeShippingThreshold = options.freeShippingThreshold || 50000;
      const shippingCost = options.shippingCost || 2500;
      const shipping = subtotal >= freeShippingThreshold ? 0 : shippingCost;
      
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

  formatPrice(price) {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(price || 0);
  }

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