// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

// Importar componentes comunes
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Importar páginas principales
import Home from './pages/Home';
import Shop from './pages/Shop';
import NotFound from './pages/NotFound';

// Importar componentes de productos
import ProductDetail from './components/products/ProductDetail';

// Importar componentes de carrito
import Cart from './components/cart/Cart';
import Checkout from './components/cart/Checkout';

// Importar componentes de autenticación
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Importar componentes de órdenes
import OrderList from './components/orders/OrderList';
import OrderDetail from './components/orders/OrderDetail';

// Importar componentes de admin
import Dashboard from './components/admin/Dashboard';
import UserManager from './components/admin/UserManager';

// Importar páginas de usuario
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';

// Importar estilos
import 'bootstrap/dist/css/bootstrap.min.css';

// Layout principal
const Layout = ({ children }) => (
  <div className="App d-flex flex-column min-vh-100">
    <Navbar />
    <main className="flex-grow-1">
      {children}
    </main>
    <Footer />
  </div>
);

// Layout para Admin
const AdminLayout = ({ children }) => (
  <div className="App d-flex flex-column min-vh-100">
    <Navbar />
    <main className="flex-grow-1 bg-light">
      {children}
    </main>
  </div>
);

// Layout simple para auth
const SimpleLayout = ({ children }) => (
  <div className="App min-vh-100 bg-light">
    <main className="h-100">
      {children}
    </main>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* ====== RUTAS PÚBLICAS ====== */}
            
            {/* Página principal */}
            <Route path="/" element={
              <Layout>
                <Home />
              </Layout>
            } />
            
            {/* Tienda - USA ProductList que incluye ProductFilter y ProductCard */}
            <Route path="/shop" element={
              <Layout>
                <Shop />
              </Layout>
            } />
            
            {/* Detalle de producto - USA ProductDetail */}
            <Route path="/products/:id" element={
              <Layout>
                <ProductDetail />
              </Layout>
            } />

            {/* ====== AUTENTICACIÓN ====== */}
            
            <Route path="/login" element={
              <SimpleLayout>
                <Login />
              </SimpleLayout>
            } />

            <Route path="/register" element={
              <SimpleLayout>
                <Register />
              </SimpleLayout>
            } />

            {/* Recuperación de contraseña */}
            <Route path="/forgot-password" element={
              <SimpleLayout>
                <ForgotPassword />
              </SimpleLayout>
            } />

            {/* ====== CARRITO ====== */}
            
            {/* Carrito (público) */}
            <Route path="/cart" element={
              <Layout>
                <Cart />
              </Layout>
            } />

            {/* Checkout (protegido) */}
            <Route path="/checkout" element={
              <Layout>
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              </Layout>
            } />

            {/* ====== PERFIL DE USUARIO (PROTEGIDO) ====== */}
            
            <Route path="/profile" element={
              <Layout>
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              </Layout>
            } />

            {/* ====== ÓRDENES (PROTEGIDAS) ====== */}
            
            <Route path="/orders" element={
              <Layout>
                <ProtectedRoute>
                  <OrderList />
                </ProtectedRoute>
              </Layout>
            } />
            
            <Route path="/orders/:id" element={
              <Layout>
                <ProtectedRoute>
                  <OrderDetail />
                </ProtectedRoute>
              </Layout>
            } />

            {/* ====== ADMINISTRACIÓN (SOLO ADMIN) ====== */}
            
            {/* Dashboard principal del admin */}
            <Route path="/admin" element={
              <AdminLayout>
                <ProtectedRoute adminOnly={true}>
                  <Dashboard />
                </ProtectedRoute>
              </AdminLayout>
            } />

            {/* Gestión de productos */}
            <Route path="/admin/products" element={
              <AdminLayout>
                <ProtectedRoute adminOnly={true}>
                  <div className="container py-4">
                    <h1>Gestión de Productos</h1>
                    <p className="text-muted">Próximamente: CRUD de productos</p>
                    <div className="alert alert-info">
                      <strong>Funciones disponibles:</strong>
                      <ul className="mb-0 mt-2">
                        <li>Crear nuevos productos</li>
                        <li>Editar productos existentes</li>
                        <li>Eliminar productos</li>
                        <li>Gestionar inventario</li>
                      </ul>
                    </div>
                  </div>
                </ProtectedRoute>
              </AdminLayout>
            } />

            {/* Gestión de órdenes */}
            <Route path="/admin/orders" element={
              <AdminLayout>
                <ProtectedRoute adminOnly={true}>
                  <div className="container py-4">
                    <h1>Gestión de Órdenes</h1>
                    <p className="text-muted">Próximamente: Gestión de pedidos</p>
                    <div className="alert alert-info">
                      <strong>Funciones disponibles:</strong>
                      <ul className="mb-0 mt-2">
                        <li>Ver todas las órdenes</li>
                        <li>Cambiar estado de órdenes</li>
                        <li>Generar reportes</li>
                        <li>Gestionar devoluciones</li>
                      </ul>
                    </div>
                  </div>
                </ProtectedRoute>
              </AdminLayout>
            } />

            {/* Gestión de usuarios */}
            <Route path="/admin/users" element={
              <AdminLayout>
                <ProtectedRoute adminOnly={true}>
                  <UserManager />
                </ProtectedRoute>
              </AdminLayout>
            } />

            {/* ====== PÁGINAS ADICIONALES ====== */}
            
            {/* Acerca de nosotros */}
            <Route path="/about" element={
              <Layout>
                <div className="container py-5">
                  <h1>Acerca de UriShop</h1>
                  <p className="lead">Somos una tienda online comprometida con la calidad y la satisfacción del cliente.</p>
                  <p>Nuestra misión es brindar los mejores productos con un servicio excepcional.</p>
                </div>
              </Layout>
            } />

            {/* Contacto */}
            <Route path="/contact" element={
              <Layout>
                <div className="container py-5">
                  <h1>Contacto</h1>
                  <div className="row">
                    <div className="col-md-6">
                      <h3>Información de Contacto</h3>
                      <p><strong>Email:</strong> contacto@urishop.com</p>
                      <p><strong>Teléfono:</strong> +54 9 11 1234-5678</p>
                      <p><strong>Dirección:</strong> Buenos Aires, Argentina</p>
                    </div>
                    <div className="col-md-6">
                      <h3>Horarios de Atención</h3>
                      <p><strong>Lunes a Viernes:</strong> 9:00 - 18:00</p>
                      <p><strong>Sábados:</strong> 9:00 - 13:00</p>
                      <p><strong>Domingos:</strong> Cerrado</p>
                    </div>
                  </div>
                </div>
              </Layout>
            } />

            {/* FAQ */}
            <Route path="/faq" element={
              <Layout>
                <div className="container py-5">
                  <h1>Preguntas Frecuentes</h1>
                  <div className="accordion" id="faqAccordion">
                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                          ¿Cómo realizo una compra?
                        </button>
                      </h2>
                      <div id="faq1" className="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
                        <div className="accordion-body">
                          Para realizar una compra, simplemente navega por nuestros productos, agrégalos al carrito y procede al checkout.
                        </div>
                      </div>
                    </div>
                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                          ¿Cuáles son los métodos de pago?
                        </button>
                      </h2>
                      <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                        <div className="accordion-body">
                          Aceptamos tarjetas de crédito, débito, transferencias bancarias y MercadoPago.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Layout>
            } />

            {/* Política de privacidad */}
            <Route path="/privacy" element={
              <Layout>
                <div className="container py-5">
                  <h1>Política de Privacidad</h1>
                  <p className="lead">En UriShop valoramos tu privacidad y nos comprometemos a proteger tus datos personales.</p>
                  <h3>Recopilación de Información</h3>
                  <p>Recopilamos información que nos proporcionas directamente y datos de uso del sitio web.</p>
                  <h3>Uso de la Información</h3>
                  <p>Utilizamos tu información para procesar pedidos, mejorar nuestros servicios y comunicarnos contigo.</p>
                  <h3>Protección de Datos</h3>
                  <p>Implementamos medidas de seguridad para proteger tu información personal.</p>
                </div>
              </Layout>
            } />

            {/* Términos y condiciones */}
            <Route path="/terms" element={
              <Layout>
                <div className="container py-5">
                  <h1>Términos y Condiciones</h1>
                  <p className="lead">Al usar UriShop, aceptas estos términos y condiciones.</p>
                  <h3>Uso del Sitio</h3>
                  <p>Te comprometes a usar el sitio de manera responsable y de acuerdo con las leyes aplicables.</p>
                  <h3>Productos y Precios</h3>
                  <p>Los precios están sujetos a cambios sin previo aviso. Nos reservamos el derecho de corregir errores.</p>
                  <h3>Limitación de Responsabilidad</h3>
                  <p>UriShop no será responsable por daños indirectos o consecuenciales.</p>
                </div>
              </Layout>
            } />

            {/* ====== RUTA 404 - DEBE IR AL FINAL ====== */}
            <Route path="*" element={
              <Layout>
                <NotFound />
              </Layout>
            } />

          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;