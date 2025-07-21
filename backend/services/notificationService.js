// backend/services/notificationService.js
const emailService = require('./emailService');

class NotificationService {
  constructor() {
    this.channels = ['email', 'database', 'push']; // Canales disponibles
  }

  // Notificar registro de usuario
  async notifyUserRegistration(user) {
    try {
      console.log('📧 Sending user registration notifications...');
      
      // Enviar email de bienvenida
      await emailService.sendWelcomeEmail(user);
      
      // Aquí podrías agregar otras notificaciones:
      // - Slack notification para admins
      // - Push notification setup
      // - Analytics tracking
      
      console.log('✅ User registration notifications sent');
    } catch (error) {
      console.error('❌ Error sending user registration notifications:', error);
    }
  }

  // Notificar nueva orden
  async notifyNewOrder(order) {
    try {
      console.log('📧 Sending new order notifications...');
      
      // Email al cliente
      await emailService.sendOrderConfirmation(order);
      
      // Notificación a administradores (ejemplo)
      await this.notifyAdminsNewOrder(order);
      
      console.log('✅ New order notifications sent');
    } catch (error) {
      console.error('❌ Error sending new order notifications:', error);
    }
  }

  // Notificar cambio de estado de orden
  async notifyOrderStatusChange(order, oldStatus, newStatus) {
    try {
      console.log(`📧 Notifying order status change: ${oldStatus} → ${newStatus}`);
      
      switch (newStatus) {
        case 'confirmed':
          await emailService.sendOrderConfirmation(order);
          break;
          
        case 'shipped':
          await emailService.sendShippingNotification(order, order.tracking);
          break;
          
        case 'delivered':
          await this.sendDeliveryConfirmation(order);
          break;
          
        case 'cancelled':
          await this.sendCancellationNotification(order);
          break;
      }
      
      console.log('✅ Order status change notifications sent');
    } catch (error) {
      console.error('❌ Error sending order status notifications:', error);
    }
  }

  // Notificar stock bajo
  async notifyLowStock(product, currentStock) {
    try {
      console.log(`📧 Notifying low stock for ${product.title}: ${currentStock} remaining`);
      
      // Email a administradores
      await this.notifyAdminsLowStock(product, currentStock);
      
      console.log('✅ Low stock notifications sent');
    } catch (error) {
      console.error('❌ Error sending low stock notifications:', error);
    }
  }

  // Notificar error del sistema
  async notifySystemError(error, context = {}) {
    try {
      console.log('📧 Notifying system error...');
      
      // Email a desarrolladores/administradores
      await this.notifyAdminsSystemError(error, context);
      
      console.log('✅ System error notifications sent');
    } catch (error) {
      console.error('❌ Error sending system error notifications:', error);
    }
  }

  // Métodos auxiliares para notificaciones específicas

  async notifyAdminsNewOrder(order) {
    try {
      const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
      
      if (adminEmails.length === 0) {
        console.log('⚠️ No admin emails configured');
        return;
      }

      const emailPromises = adminEmails.map(email => 
        emailService.transporter.sendMail({
          from: process.env.EMAIL_FROM || 'UriShop <noreply@urishop.com>',
          to: email.trim(),
          subject: `🛒 Nueva Orden #${order.orderNumber}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Nueva Orden Recibida</h2>
              <p><strong>Orden:</strong> #${order.orderNumber}</p>
              <p><strong>Cliente:</strong> ${order.customer.firstName} ${order.customer.lastName}</p>
              <p><strong>Email:</strong> ${order.customer.email}</p>
              <p><strong>Total:</strong> $${order.pricing.total.toFixed(2)}</p>
              <p><strong>Productos:</strong> ${order.items.length}</p>
              
              <div style="margin: 20px 0;">
                <a href="${process.env.CLIENT_URL}/admin/orders/${order._id}" 
                   style="background-color: #007bff; color: white; padding: 10px 20px; 
                          text-decoration: none; border-radius: 5px;">
                  Ver Orden
                </a>
              </div>
            </div>
          `
        })
      );

      await Promise.all(emailPromises);
    } catch (error) {
      console.error('❌ Error notifying admins of new order:', error);
    }
  }

  async notifyAdminsLowStock(product, currentStock) {
    try {
      const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
      
      if (adminEmails.length === 0) return;

      const emailPromises = adminEmails.map(email => 
        emailService.transporter.sendMail({
          from: process.env.EMAIL_FROM || 'UriShop <noreply@urishop.com>',
          to: email.trim(),
          subject: `⚠️ Stock Bajo: ${product.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc3545;">Stock Bajo</h2>
              <p><strong>Producto:</strong> ${product.title}</p>
              <p><strong>Código:</strong> ${product.code}</p>
              <p><strong>Stock Actual:</strong> ${currentStock} unidades</p>
              <p><strong>Estado:</strong> ${currentStock <= 5 ? 'Crítico' : 'Bajo'}</p>
              
              <div style="margin: 20px 0;">
                <a href="${process.env.CLIENT_URL}/admin/products/${product._id}" 
                   style="background-color: #dc3545; color: white; padding: 10px 20px; 
                          text-decoration: none; border-radius: 5px;">
                  Gestionar Producto
                </a>
              </div>
            </div>
          `
        })
      );

      await Promise.all(emailPromises);
    } catch (error) {
      console.error('❌ Error notifying admins of low stock:', error);
    }
  }

  async notifyAdminsSystemError(error, context) {
    try {
      const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
      
      if (adminEmails.length === 0) return;

      const emailPromises = adminEmails.map(email => 
        emailService.transporter.sendMail({
          from: process.env.EMAIL_FROM || 'UriShop <noreply@urishop.com>',
          to: email.trim(),
          subject: `🚨 Error del Sistema - UriShop`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc3545;">Error del Sistema</h2>
              <p><strong>Mensaje:</strong> ${error.message}</p>
              <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
              ${context.url ? `<p><strong>URL:</strong> ${context.url}</p>` : ''}
              ${context.user ? `<p><strong>Usuario:</strong> ${context.user}</p>` : ''}
              
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h4>Stack Trace:</h4>
                <pre style="font-size: 12px; overflow-x: auto;">${error.stack}</pre>
              </div>
            </div>
          `
        })
      );

      await Promise.all(emailPromises);
    } catch (error) {
      console.error('❌ Error notifying admins of system error:', error);
    }
  }

  async sendDeliveryConfirmation(order) {
    try {
      await emailService.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'UriShop <noreply@urishop.com>',
        to: order.customer.email,
        subject: `¡Tu orden #${order.orderNumber} ha sido entregada! 📦✅`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #28a745;">¡Entrega Completada!</h1>
            <p>Hola ${order.customer.firstName},</p>
            <p>Tu orden #${order.orderNumber} ha sido entregada exitosamente.</p>
            <p>Esperamos que disfrutes tu compra. Si tienes algún problema, no dudes en contactarnos.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}/orders/${order._id}" 
                 style="background-color: #28a745; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Ver Orden
              </a>
            </div>
            
            <p>¡Gracias por elegir UriShop! 🎮</p>
          </div>
        `
      });
    } catch (error) {
      console.error('❌ Error sending delivery confirmation:', error);
    }
  }

  async sendCancellationNotification(order) {
    try {
      await emailService.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'UriShop <noreply@urishop.com>',
        to: order.customer.email,
        subject: `Orden #${order.orderNumber} cancelada`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #dc3545;">Orden Cancelada</h1>
            <p>Hola ${order.customer.firstName},</p>
            <p>Tu orden #${order.orderNumber} ha sido cancelada.</p>
            <p>El reembolso se procesará en 3-5 días hábiles.</p>
            
            <p>Si tienes alguna pregunta, contacta con nuestro servicio al cliente.</p>
          </div>
        `
      });
    } catch (error) {
      console.error('❌ Error sending cancellation notification:', error);
    }
  }

  // Método para enviar notificaciones de prueba
  async sendTestNotifications(email) {
    try {
      console.log('🧪 Sending test notifications...');
      
      await emailService.sendTestEmail(email);
      
      console.log('✅ Test notifications sent');
      return true;
    } catch (error) {
      console.error('❌ Error sending test notifications:', error);
      return false;
    }
  }
}

module.exports = new NotificationService();