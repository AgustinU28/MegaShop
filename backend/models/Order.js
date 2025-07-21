// backend/routes/orders.js - Agregar estos endpoints para facturas

// Instalar las dependencias necesarias:
// npm install puppeteer html-pdf-node

const puppeteer = require('puppeteer');

// @route   GET /api/orders/:id/invoice
// @desc    Download order invoice as PDF
// @access  Private
router.get('/:id/invoice', auth, async (req, res) => {
  try {
    console.log('📄 Generating invoice for order:', req.params.id);

    const order = await Order.findById(req.params.id)
      .populate('items.product', 'title image code category brand')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Verificar permisos (misma lógica que GET /:id)
    let orderUserId = null;
    if (order.user) {
      if (typeof order.user === 'object' && order.user._id) {
        orderUserId = order.user._id.toString();
      } else {
        orderUserId = order.user.toString();
      }
    }
    
    const requestingUserId = req.user.id.toString();
    const isAdmin = req.user.role === 'admin';

    if (order.user && orderUserId !== requestingUserId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para descargar esta factura'
      });
    }

    // Generar HTML de la factura
    const invoiceHTML = generateInvoiceHTML(order);

    // Configurar Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(invoiceHTML, { waitUntil: 'networkidle0' });

    // Generar PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      printBackground: true
    });

    await browser.close();

    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="factura-${order.orderNumber}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    console.log('✅ Invoice PDF generated successfully');
    res.send(pdfBuffer);

  } catch (error) {
    console.error('❌ Error generating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar la factura',
      error: error.message
    });
  }
});

// Función para generar el HTML de la factura
function generateInvoiceHTML(order) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Factura - ${order.orderNumber}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #007bff;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .company-name {
          font-size: 28px;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 5px;
        }
        .invoice-title {
          font-size: 24px;
          margin: 20px 0;
        }
        .invoice-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .info-section {
          flex: 1;
          margin-right: 20px;
        }
        .info-section h3 {
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
          color: #007bff;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .items-table th {
          background-color: #f8f9fa;
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        .items-table td {
          border: 1px solid #ddd;
          padding: 12px;
        }
        .text-right {
          text-align: right;
        }
        .total-section {
          float: right;
          width: 300px;
          margin-top: 20px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .total-final {
          font-weight: bold;
          font-size: 18px;
          border-bottom: 2px solid #007bff;
          color: #007bff;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">🛍️ UriShop</div>
        <div>Tu tienda de confianza</div>
      </div>

      <div class="invoice-title">
        <h1>FACTURA - ${order.orderNumber}</h1>
      </div>

      <div class="invoice-info">
        <div class="info-section">
          <h3>Información de la Empresa</h3>
          <p><strong>UriShop</strong><br>
          Dirección: Don Bosco 186<br>
          Ciudad: Bahía Blanca, Buenos Aires<br>
          CP: 8000<br>
          País: Argentina</p>
        </div>

        <div class="info-section">
          <h3>Facturar a</h3>
          <p><strong>${order.customer.firstName} ${order.customer.lastName}</strong><br>
          Email: ${order.customer.email}<br>
          Teléfono: ${order.customer.phone}</p>
        </div>

        <div class="info-section">
          <h3>Detalles de la Factura</h3>
          <p><strong>Número:</strong> ${order.orderNumber}<br>
          <strong>Fecha:</strong> ${formatDate(order.createdAt)}<br>
          <strong>Estado:</strong> ${order.status}<br>
          <strong>Método de Pago:</strong> ${order.payment.method}</p>
        </div>
      </div>

      <div class="info-section">
        <h3>Dirección de Envío</h3>
        <p>${order.shipping.address}<br>
        ${order.shipping.city}, ${order.shipping.state}<br>
        CP: ${order.shipping.zipCode}<br>
        ${order.shipping.country}</p>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Código</th>
            <th class="text-right">Cantidad</th>
            <th class="text-right">Precio Unitario</th>
            <th class="text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
            <tr>
              <td>${item.product?.title || item.title}</td>
              <td>${item.product?.code || item.productId}</td>
              <td class="text-right">${item.quantity}</td>
              <td class="text-right">${formatPrice(item.price)}</td>
              <td class="text-right">${formatPrice(item.subtotal)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="total-section">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>${formatPrice(order.pricing.subtotal)}</span>
        </div>
        <div class="total-row">
          <span>Impuestos (21%):</span>
          <span>${formatPrice(order.pricing.tax)}</span>
        </div>
        <div class="total-row">
          <span>Envío:</span>
          <span>${order.pricing.shipping === 0 ? 'GRATIS' : formatPrice(order.pricing.shipping)}</span>
        </div>
        <div class="total-row total-final">
          <span>TOTAL:</span>
          <span>${formatPrice(order.pricing.total)}</span>
        </div>
      </div>

      <div class="footer">
        <p>Gracias por tu compra en UriShop</p>
        <p>Para consultas, contacta a: support@urishop.com</p>
        <p>Este documento fue generado automáticamente el ${formatDate(new Date())}</p>
      </div>
    </body>
    </html>
  `;
}