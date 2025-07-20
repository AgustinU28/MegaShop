// frontend/src/services/paymentService.js
import api from './api';

class PaymentService {
  // Obtener configuración de Stripe
  async getStripeConfig() {
    try {
      const response = await api.get('/payments/config');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener configuración de pagos');
    }
  }

  // Crear Payment Intent
  async createPaymentIntent(amount, metadata = {}) {
    try {
      const response = await api.post('/payments/create-payment-intent', {
        amount,
        currency: 'ars',
        metadata
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al crear payment intent');
    }
  }

  // Confirmar pago y crear orden
  async confirmPayment(paymentIntentId, orderData, shippingInfo, customerInfo) {
    try {
      const response = await api.post('/payments/confirm-payment', {
        paymentIntentId,
        orderData,
        shippingInfo,
        customerInfo
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al confirmar pago');
    }
  }

  // Formatear precio para mostrar
  formatPrice(amount, currency = 'ARS') {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  // Validar datos de tarjeta (básico)
  validateCardData(cardData) {
    const errors = {};

    if (!cardData.number || cardData.number.length < 13) {
      errors.number = 'Número de tarjeta inválido';
    }

    if (!cardData.expiry || !/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
      errors.expiry = 'Fecha de vencimiento inválida (MM/YY)';
    }

    if (!cardData.cvc || cardData.cvc.length < 3) {
      errors.cvc = 'CVC inválido';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

export default new PaymentService();

