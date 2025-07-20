// ===== Para middleware/upload.js =====
// backend/middleware/upload.js
const multer = require('multer');

// Configuración básica de multer (placeholder)
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

module.exports = upload;



