
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Configuración del transportador de email
    this.transporter = this.createTransporter();
  }

  createTransporter() {
    // Configuración para Gmail (puedes cambiar por otro proveedor)
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // tu-email@gmail.com
        pass: process.env.EMAIL_PASS  // contraseña de aplicación
      }
    });

    // Alternativa para otros proveedores:
    /*
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    */
  }

  // Enviar email de bienvenida
  async sendWelcomeEmail(user) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'UriShop <noreply@urishop.com>',
        to: user.email,
        subject: '¡Bienvenido a UriShop! 🎮',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #007bff;">¡Hola ${user.name}!</h1>
            <p>¡Bienvenido a UriShop, tu tienda gamer de confianza!</p>
            <p>Tu cuenta ha sido creada exitosamente. Ahora puedes:</p>
            <ul>
              <li>Explorar nuestro catálogo de productos gaming</li>
              <li>Realizar compras seguras</li>
              <li>Seguir el estado de tus órdenes</li>
              <li>Acceder a ofertas exclusivas</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}/shop" 
                 style="background-color: #007bff; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Explorar Tienda
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              Si tienes alguna pregunta, no dudes en contactarnos.
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent to:', user.email);
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      throw error;
    }
  }

  // Enviar confirmación de orden
  async sendOrderConfirmation(order) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'UriShop <noreply@urishop.com>',
        to: order.customer.email,
        subject: `Confirmación de Orden #${order.orderNumber} 📦`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #28a745;">¡Orden Confirmada!</h1>
            <p>Hola ${order.customer.firstName},</p>
            <p>Tu orden ha sido confirmada y está siendo procesada.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Detalles de la Orden</h3>
              <p><strong>Número de Orden:</strong> #${order.orderNumber}</p>
              <p><strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleDateString('es-AR')}</p>
              <p><strong>Total:</strong> $${order.pricing.total.toFixed(2)}</p>
            </div>

            <h3>Productos:</h3>
            ${order.items.map(item => `
              <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
                <p><strong>${item.title}</strong></p>
                <p>Cantidad: ${item.quantity} - Precio: $${item.price.toFixed(2)}</p>
              </div>
            `).join('')}

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}/orders/${order._id}" 
                 style="background-color: #007bff; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Ver Orden
              </a>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('✅ Order confirmation email sent:', order.orderNumber);
    } catch (error) {
      console.error('❌ Error sending order confirmation:', error);
      throw error;
    }
  }

  // Enviar notificación de envío
  async sendShippingNotification(order, trackingInfo) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'UriShop <noreply@urishop.com>',
        to: order.customer.email,
        subject: `Tu orden #${order.orderNumber} está en camino 🚚`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #17a2b8;">¡Tu orden está en camino!</h1>
            <p>Hola ${order.customer.firstName},</p>
            <p>Tu orden #${order.orderNumber} ha sido enviada y está en camino.</p>
            
            ${trackingInfo?.trackingNumber ? `
              <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Información de Seguimiento</h3>
                <p><strong>Número de Seguimiento:</strong> ${trackingInfo.trackingNumber}</p>
                <p><strong>Transportadora:</strong> ${trackingInfo.carrier || 'N/A'}</p>
                ${trackingInfo.trackingUrl ? `
                  <p><a href="${trackingInfo.trackingUrl}" target="_blank">Seguir envío</a></p>
                ` : ''}
              </div>
            ` : ''}

            <p>Te notificaremos cuando tu pedido sea entregado.</p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('✅ Shipping notification sent:', order.orderNumber);
    } catch (error) {
      console.error('❌ Error sending shipping notification:', error);
      throw error;
    }
  }

  // Enviar email de restablecimiento de contraseña
  async sendPasswordResetEmail(user, resetToken) {
    try {
      const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'UriShop <noreply@urishop.com>',
        to: user.email,
        subject: 'Restablecer contraseña - UriShop 🔑',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #dc3545;">Restablecer Contraseña</h1>
            <p>Hola ${user.name},</p>
            <p>Recibimos una solicitud para restablecer tu contraseña.</p>
            <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #dc3545; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Restablecer Contraseña
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Este enlace expira en 10 minutos. Si no solicitaste este cambio, ignora este email.
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent to:', user.email);
    } catch (error) {
      console.error('❌ Error sending password reset email:', error);
      throw error;
    }
  }

  // Método de prueba
  async sendTestEmail(to) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'UriShop <noreply@urishop.com>',
        to: to,
        subject: 'Test Email - UriShop 🧪',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #007bff;">Email de Prueba</h1>
            <p>Este es un email de prueba desde UriShop.</p>
            <p>Si recibes este mensaje, la configuración de email está funcionando correctamente.</p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('✅ Test email sent to:', to);
      return true;
    } catch (error) {
      console.error('❌ Error sending test email:', error);
      return false;
    }
  }
}

module.exports = new EmailService();