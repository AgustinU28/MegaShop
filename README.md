# 🎮 UriShop - Tienda Gaming Online

> **Tu tienda de computadoras gamer de confianza**

UriShop es una aplicación web completa de e-commerce especializada en productos gaming, construida con tecnologías modernas y diseñada para ofrecer una experiencia de compra excepcional.

## 📋 Tabla de Contenidos

- [🚀 Tecnologías](#-tecnologías)
- [🏗️ Arquitectura del Proyecto](#️-arquitectura-del-proyecto)
- [📦 Instalación y Configuración](#-instalación-y-configuración)
- [🔧 Variables de Entorno](#-variables-de-entorno)
- [🧪 Testing con Stripe](#-testing-con-stripe)
- [🌟 Características Principales](#-características-principales)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🔐 Sistema de Autenticación](#-sistema-de-autenticación)
- [💳 Integración con Stripe](#-integración-con-stripe)
- [📧 Sistema de Emails](#-sistema-de-emails)
- [🛒 Carrito de Compras](#-carrito-de-compras)
- [📋 Sistema de Órdenes](#-sistema-de-órdenes)
- [👑 Panel de Administración](#-panel-de-administración)
- [🚀 Deployment](#-deployment)
- [🐛 Troubleshooting](#-troubleshooting)

## 🚀 Tecnologías

### Frontend
- **React 18** - Biblioteca de interfaz de usuario
- **Vite** - Build tool y dev server ultra-rápido
- **React Bootstrap** - Componentes UI responsivos
- **React Router** - Navegación SPA
- **Axios** - Cliente HTTP
- **React Icons** - Biblioteca de iconos
- **Stripe.js** - Pagos seguros
- **Context API** - Gestión de estado global

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación basada en tokens
- **Stripe** - Procesamiento de pagos
- **Nodemailer** - Envío de emails
- **Bcrypt** - Hash de contraseñas
- **Helmet** - Seguridad HTTP
- **Morgan** - Logging de requests

## 🏗️ Arquitectura del Proyecto

```
UriShop/
├── frontend/                 # Aplicación React
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   │   ├── admin/       # Panel administrativo
│   │   │   ├── auth/        # Autenticación
│   │   │   ├── cart/        # Carrito y checkout
│   │   │   ├── common/      # Componentes comunes
│   │   │   ├── orders/      # Gestión de órdenes
│   │   │   ├── products/    # Catálogo de productos
│   │   │   └── tickets/     # Sistema de tickets
│   │   ├── context/         # Contextos React
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Páginas principales
│   │   ├── services/        # Servicios API
│   │   ├── styles/          # Estilos globales
│   │   ├── utils/           # Utilidades
│   │   └── config/          # Configuraciones
│   └── public/              # Archivos estáticos
│
└── backend/                 # API REST
    ├── controllers/         # Lógica de negocio
    ├── models/              # Modelos de datos
    ├── routes/              # Definición de rutas
    ├── middleware/          # Middlewares personalizados
    ├── services/            # Servicios externos
    ├── config/              # Configuraciones
    ├── utils/               # Utilidades
    └── scripts/             # Scripts de utilidad
```

## 📦 Instalación y Configuración

### Prerrequisitos
- **Node.js** (v16 o superior)
- **MongoDB** (local o MongoDB Atlas)
- **Cuenta de Stripe** (para pagos)
- **Cuenta de Gmail** (para emails, opcional)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/urishop.git
cd urishop
```

### 2. Configurar Backend
```bash
cd backend
npm install

# Crear archivo .env (ver sección variables de entorno)
cp .env.example .env

# Ejecutar seeders (productos de ejemplo)
npm run seed

# Iniciar servidor de desarrollo
npm run dev
```

### 3. Configurar Frontend
```bash
cd frontend
npm install

# Crear archivo .env (ver sección variables de entorno)
cp .env.example .env

# Iniciar aplicación de desarrollo
npm run dev
```

### 4. Verificar Instalación
- Backend: http://localhost:5000/health
- Frontend: http://localhost:3000
- API Test: http://localhost:5000/api/test

## 🔧 Variables de Entorno

### Backend (.env)
```env
# Servidor
NODE_ENV=development
PORT=5000

# Base de datos
MONGODB_URI=mongodb://localhost:27017/urishop
# O para MongoDB Atlas:
# MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/urishop

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
JWT_EXPIRE=7d

# Stripe (Obtener en https://dashboard.stripe.com)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Email (Gmail App Password)
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu_app_password_gmail
EMAIL_FROM=UriShop <noreply@urishop.com>

# URLs
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000

# Cloudinary (opcional, para imágenes)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### Frontend (.env)
```env
# API
VITE_API_URL=http://localhost:5000/api

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# App
VITE_APP_NAME=UriShop
VITE_APP_VERSION=1.0.0
```

## 🧪 Testing con Stripe

### Tarjetas de Prueba para Desarrollo

#### ✅ Tarjetas que FUNCIONAN:
```
Visa (Éxito):
Número: 4242 4242 4242 4242
Fecha: Cualquier fecha futura (ej: 12/28)
CVC: Cualquier 3 dígitos (ej: 123)

Visa (Decline):
Número: 4000 0000 0000 0002
Fecha: Cualquier fecha futura
CVC: Cualquier 3 dígitos

Mastercard (Éxito):
Número: 5555 5555 5555 4444
Fecha: Cualquier fecha futura
CVC: Cualquier 3 dígitos

American Express (Éxito):
Número: 3782 822463 10005
Fecha: Cualquier fecha futura
CVC: Cualquier 4 dígitos (ej: 1234)
```

#### 🚨 Casos de Prueba Especiales:
```
Fondos Insuficientes:
Número: 4000 0000 0000 9995

Tarjeta Vencida:
Número: 4000 0000 0000 0069

CVC Incorrecto:
Número: 4000 0000 0000 0127

Procesamiento Requerido:
Número: 4000 0000 0000 3220
```

### Configuración de Stripe

1. **Crear cuenta en Stripe**: https://dashboard.stripe.com/register
2. **Obtener claves de prueba**:
   - Ir a Developers → API keys
   - Copiar "Publishable key" y "Secret key"
3. **Configurar webhook** (opcional):
   - Ir a Developers → Webhooks
   - Agregar endpoint: `http://localhost:5000/api/payments/webhook`

### Flujo de Pago en UriShop

```javascript
// El sistema convierte automáticamente ARS a USD para pruebas
// 1 USD ≈ 1000 ARS (aproximación para testing)

Producto: $150,000 ARS → $150 USD (en Stripe)
Producto: $85,000 ARS  → $85 USD (en Stripe)
```

## 🌟 Características Principales

### 🛍️ Para Usuarios
- **Catálogo de Productos**: Navegación y filtrado avanzado
- **Carrito Persistente**: Mantiene productos entre sesiones
- **Checkout Seguro**: Integración completa con Stripe
- **Gestión de Órdenes**: Seguimiento de pedidos en tiempo real
- **Perfil de Usuario**: Información personal y historial
- **Sistema de Reviews**: Calificaciones y comentarios
- **Búsqueda Inteligente**: Filtros por categoría, precio, rating
- **Responsive Design**: Optimizado para móviles y desktop

### 👑 Para Administradores
- **Dashboard Completo**: Métricas y estadísticas
- **Gestión de Productos**: CRUD completo con imágenes
- **Control de Órdenes**: Estados, tracking, devoluciones
- **Gestión de Usuarios**: Roles y permisos
- **Sistema de Tickets**: Soporte al cliente
- **Reportes**: Ventas, productos más vendidos, etc.
- **Configuración**: Parámetros del sistema

## 📁 Estructura del Proyecto

### Frontend Detallado
```
frontend/src/
├── components/
│   ├── admin/
│   │   ├── Dashboard.jsx         # Panel principal admin
│   │   ├── UserManager.jsx       # Gestión de usuarios
│   │   └── Layout/               # Layout administrativo
│   ├── auth/
│   │   ├── Login.jsx             # Formulario de login
│   │   ├── Register.jsx          # Registro de usuarios
│   │   ├── ForgotPassword.jsx    # Recuperar contraseña
│   │   └── ProtectedRoute.jsx    # Rutas protegidas
│   ├── cart/
│   │   ├── Cart.jsx              # Vista del carrito
│   │   ├── Checkout.jsx          # Proceso de pago
│   │   └── PaymentForm.jsx       # Formulario de pago
│   ├── common/
│   │   ├── Header.jsx            # Navegación principal
│   │   ├── Footer.jsx            # Pie de página
│   │   ├── Layout.jsx            # Layout principal
│   │   ├── Loading.jsx           # Componente de carga
│   │   ├── NotFound.jsx          # Página 404
│   │   └── Pagination.jsx        # Paginación
│   ├── orders/
│   │   ├── OrderList.jsx         # Lista de órdenes
│   │   ├── OrderDetail.jsx       # Detalle de orden
│   │   └── OrderStatus.jsx       # Estados de orden
│   ├── products/
│   │   ├── ProductCard.jsx       # Tarjeta de producto
│   │   ├── ProductDetail.jsx     # Detalle de producto
│   │   ├── ProductFilter.jsx     # Filtros de búsqueda
│   │   └── ProductList.jsx       # Lista de productos
│   └── tickets/
│       ├── TicketList.jsx        # Lista de tickets
│       └── TicketForm.jsx        # Crear ticket
├── context/
│   ├── AuthContext.jsx           # Contexto de autenticación
│   └── CartContext.jsx           # Contexto del carrito
├── services/
│   ├── api.js                    # Cliente HTTP base
│   ├── authService.js            # Servicios de auth
│   ├── cartService.js            # Servicios del carrito
│   ├── orderService.js           # Servicios de órdenes
│   ├── paymentService.js         # Servicios de pago
│   └── productService.js         # Servicios de productos
└── utils/
    ├── formatters.js             # Formateo de datos
    ├── validators.js             # Validaciones
    └── constants.js              # Constantes
```

### Backend Detallado
```
backend/
├── controllers/
│   ├── authController.js         # Autenticación y registro
│   ├── cartController.js         # Lógica del carrito
│   ├── orderController.js        # Gestión de órdenes
│   ├── paymentController.js      # Procesamiento de pagos
│   ├── productController.js      # CRUD de productos
│   └── userController.js         # Gestión de usuarios
├── models/
│   ├── User.js                   # Modelo de usuario
│   ├── Product.js                # Modelo de producto
│   ├── Cart.js                   # Modelo del carrito
│   ├── Order.js                  # Modelo de orden
│   └── Ticket.js                 # Modelo de tickets
├── routes/
│   ├── auth.js                   # Rutas de autenticación
│   ├── carts.js                  # Rutas del carrito
│   ├── orders.js                 # Rutas de órdenes
│   ├── payments.js               # Rutas de pagos
│   ├── products.js               # Rutas de productos
│   └── users.js                  # Rutas de usuarios
├── middleware/
│   ├── auth.js                   # Middleware de autenticación
│   ├── validation.js             # Validación de datos
│   └── errorHandler.js           # Manejo de errores
├── services/
│   ├── emailService.js           # Servicio de emails
│   └── stripeService.js          # Servicio de Stripe
└── config/
    ├── database.js               # Configuración MongoDB
    ├── stripe.js                 # Configuración Stripe
    └── cloudinary.js             # Configuración Cloudinary
```

## 🔐 Sistema de Autenticación

### Roles de Usuario
```javascript
// Tipos de usuario
USER_ROLES = {
  USER: 'user',      // Usuario regular
  ADMIN: 'admin'     // Administrador
}
```

### JWT Tokens
- **Expiración**: 7 días por defecto
- **Almacenamiento**: localStorage en frontend
- **Renovación**: Automática en requests

### Rutas Protegidas
```javascript
// Middleware de autenticación
auth()              // Requiere estar logueado
adminAuth()         // Requiere ser admin
optionalAuth()      // Auth opcional
```

## 💳 Integración con Stripe

### Configuración
1. **Cuenta de Stripe**: Registro en https://stripe.com
2. **Claves de API**: Dashboard → Developers → API keys
3. **Webhook** (opcional): Para eventos de pago

### Flujo de Pago

```javascript
// 1. Frontend crea Payment Intent
const paymentIntent = await paymentService.createPaymentIntent(amount);

// 2. Usuario completa formulario de pago
const { error, paymentIntent: confirmedPayment } = await stripe.confirmCardPayment(
  clientSecret,
  {
    payment_method: {
      card: cardElement,
      billing_details: { name: userName }
    }
  }
);

// 3. Backend confirma pago y crea orden
const order = await paymentService.confirmPayment(paymentIntentId, orderData);
```

### Conversión de Moneda
```javascript
// Para pruebas: ARS → USD
const amountInUSD = Math.round(amountInARS / 1000);

// Ejemplos:
// $100,000 ARS → $100 USD
// $50,000 ARS  → $50 USD
```

## 📧 Sistema de Emails

### Configuración Gmail
1. **Habilitar 2FA**: En tu cuenta de Gmail
2. **Generar App Password**: 
   - Google Account → Security → App passwords
   - Seleccionar "Mail" y el dispositivo
3. **Configurar variables**:
   ```env
   EMAIL_USER=tu-email@gmail.com
   EMAIL_PASS=tu_app_password_de_16_digitos
   ```

### Tipos de Emails
- **Bienvenida**: Al registrarse
- **Confirmación de Orden**: Al realizar compra
- **Cambio de Estado**: Actualizaciones de pedido
- **Recuperación de Contraseña**: Reset password

## 🛒 Carrito de Compras

### Características
- **Persistencia**: Se mantiene entre sesiones
- **Sincronización**: Entre dispositivos (usuarios logueados)
- **Validación**: Stock y precios en tiempo real
- **Cálculos**: Subtotal, impuestos, envío automático

### Estados del Carrito
```javascript
CART_STATUS = {
  ACTIVE: 'active',       // En uso
  ABANDONED: 'abandoned', // Abandonado
  PURCHASED: 'purchased'  // Convertido en orden
}
```

## 📋 Sistema de Órdenes

### Estados de Orden
```javascript
ORDER_STATUS = {
  PENDING: 'pending',         // Pendiente de pago
  CONFIRMED: 'confirmed',     // Confirmada
  PROCESSING: 'processing',   // En preparación
  SHIPPED: 'shipped',         // Enviada
  DELIVERED: 'delivered',     // Entregada
  CANCELLED: 'cancelled'      // Cancelada
}
```

### Workflow de Órdenes
1. **Creación**: Al confirmar pago exitoso
2. **Confirmación**: Admin confirma orden
3. **Procesamiento**: Preparación del pedido
4. **Envío**: Orden en camino
5. **Entrega**: Orden completada

## 👑 Panel de Administración

### Dashboard
- **Métricas**: Ventas, usuarios, productos
- **Gráficos**: Tendencias y estadísticas
- **Alertas**: Stock bajo, órdenes pendientes

### Gestión de Productos
- **CRUD Completo**: Crear, leer, actualizar, eliminar
- **Categorías**: Organización por tipo
- **Imágenes**: Upload múltiple
- **Stock**: Control de inventario

### Gestión de Órdenes
- **Vista Completa**: Todas las órdenes
- **Filtros**: Por estado, fecha, usuario
- **Acciones**: Cambiar estado, cancelar, reembolsar

## 🚀 Deployment

### Preparación
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
# Los archivos estáticos estarán en /dist
```

### Variables de Producción
```env
# Backend
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/urishop
JWT_SECRET=super_secure_secret_in_production
STRIPE_SECRET_KEY=sk_live_...

# Frontend
VITE_API_URL=https://api.tudominio.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Opciones de Hosting

#### Backend
- **Heroku**: Fácil deployment con Git
- **Vercel**: Serverless functions
- **Railway**: Moderno y simple
- **DigitalOcean**: VPS tradicional

#### Frontend
- **Vercel**: Recomendado para React
- **Netlify**: Excelente para SPAs
- **GitHub Pages**: Gratis para proyectos públicos

#### Base de Datos
- **MongoDB Atlas**: DBaaS oficial
- **Railway**: Incluye PostgreSQL/MySQL

## 🐛 Troubleshooting

### Problemas Comunes

#### Error: "Cannot connect to MongoDB"
```bash
# Verificar que MongoDB esté corriendo
sudo systemctl status mongod

# O usar MongoDB Atlas y verificar la URI
```

#### Error: "Stripe key not found"
```bash
# Verificar variables de entorno
echo $STRIPE_SECRET_KEY

# Reiniciar servidor después de cambiar .env
```

#### Error: "CORS blocked"
```javascript
// Verificar configuración CORS en backend
app.use(cors({
  origin: ['http://localhost:3000', 'https://tudominio.com'],
  credentials: true
}));
```

#### Error: "Payment failed"
```javascript
// Verificar:
// 1. Claves de Stripe correctas
// 2. Tarjeta de prueba válida
// 3. Monto mayor a $0.50 USD
```

### Logs Útiles
```bash
# Backend logs
tail -f backend/logs/app.log

# Frontend console
# Abrir DevTools → Console

# MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

### Comandos de Desarrollo
```bash
# Limpiar node_modules
rm -rf node_modules package-lock.json && npm install

# Reset base de datos
npm run db:reset

# Ejecutar tests
npm test

# Verificar sintaxis
npm run lint
```
# Ejecutar Proyecto en terminal
npm run dev
---





**¡Gracias por usar UriShop! 🎮🛒**