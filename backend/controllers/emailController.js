// ===== backend/controllers/emailController.js =====
const sendEmail = (req, res) => {
  res.json({
    success: false,
    message: 'Envío de emails no implementado aún'
  });
};

const sendWelcomeEmail = (req, res) => {
  res.json({
    success: true,
    message: 'Email de bienvenida enviado (placeholder)'
  });
};

const sendPasswordReset = (req, res) => {
  res.json({
    success: true,
    message: 'Email de reset enviado (placeholder)'
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordReset
};