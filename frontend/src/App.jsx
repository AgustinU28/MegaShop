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
            
            <Route path="/admin" element={
              <AdminLayout>
                <ProtectedRoute adminOnly={true}>
                  <Dashboard />
                </ProtectedRoute>
              </AdminLayout>
            } />

            <Route path="/admin/products" element={
              <AdminLayout>
                <ProtectedRoute adminOnly={true}>
                  <div className="container py-4">
                    <h1>Gestión de Productos</h1>
                    <p>Próximamente: CRUD de productos</p>
                  </div>
                </ProtectedRoute>
              </AdminLayout>
            } />

            <Route path="/admin/orders" element={
              <AdminLayout>
                <ProtectedRoute adminOnly={true}>
                  <div className="container py-4">
                    <h1>Gestión de Órdenes</h1>
                    <p>Próximamente: Gestión de pedidos</p>
                  </div>
                </ProtectedRoute>
              </AdminLayout>
            } />

            <Route path="/admin/users" element={
              <AdminLayout>
                <ProtectedRoute adminOnly={true}>
                  <div className="container py-4">
                    <h1>Gestión de Usuarios</h1>
                    <p>Próximamente: Gestión de usuarios</p>
                  </div>
                </ProtectedRoute>
              </AdminLayout>
            } />

            {/* ====== PÁGINAS ESTÁTICAS ====== */}
            
            <Route path="/contact" element={
              <Layout>
                <div className="container py-5">
                  <div className="row justify-content-center">
                    <div className="col-md-8">
                      <h1 className="mb-4">📞 Contacto</h1>
                      <div className="card">
                        <div className="card-body">
                          <h5>¿Necesitas ayuda?</h5>
                          <p>Estamos aquí para ayudarte con cualquier consulta.</p>
                          <ul className="list-unstyled">
                            <li><strong>Email:</strong> info@urishop.com</li>
                            <li><strong>Teléfono:</strong> +54 291 123-4567</li>
                            <li><strong>WhatsApp:</strong> +54 291 123-4567</li>
                            <li><strong>Horarios:</strong> Lun-Vie 9:00-18:00</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Layout>
            } />

            <Route path="/about" element={
              <Layout>
                <div className="container py-5">
                  <div className="row justify-content-center">
                    <div className="col-md-8">
                      <h1 className="mb-4">ℹ️ Acerca de UriShop</h1>
                      <div className="card">
                        <div className="card-body">
                          <p className="lead">Tu tienda de confianza para equipos gaming</p>
                          <p>
                            En UriShop nos especializamos en ofrecer las mejores computadoras 
                            gaming y equipos tecnológicos de Argentina. Con más de 5 años de 
                            experiencia, hemos ayudado a miles de gamers a encontrar su setup perfecto.
                          </p>
                          <h5>¿Por qué elegirnos?</h5>
                          <ul>
                            <li>Productos originales con garantía</li>
                            <li>Envío gratis en compras superiores a $50.000</li>
                            <li>Financiación en 12 cuotas sin interés</li>
                            <li>Soporte técnico especializado</li>
                            <li>Devolución sin preguntas en 30 días</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Layout>
            } />

            <Route path="/terms" element={
              <Layout>
                <div className="container py-5">
                  <div className="row justify-content-center">
                    <div className="col-md-10">
                      <h1 className="mb-4">📋 Términos y Condiciones</h1>
                      <div className="card">
                        <div className="card-body">
                          <p><strong>Última actualización:</strong> Enero 2025</p>
                          <h5>1. Aceptación de los términos</h5>
                          <p>Al usar UriShop, aceptas estos términos y condiciones...</p>
                          
                          <h5>2. Productos y precios</h5>
                          <p>Todos nuestros productos son originales y cuentan con garantía...</p>
                          
                          <h5>3. Política de envíos</h5>
                          <p>Realizamos envíos a todo el país...</p>
                          
                          <h5>4. Política de devoluciones</h5>
                          <p>Aceptamos devoluciones dentro de 30 días de la compra...</p>
                          
                          <h5>5. Garantías</h5>
                          <p>Todos nuestros productos incluyen garantía del fabricante...</p>
                          
                          <h5>6. Privacidad</h5>
                          <p>Respetamos tu privacidad y protegemos tus datos personales...</p>
                          
                          <div className="alert alert-info mt-4">
                            <strong>¿Tienes dudas?</strong> Contáctanos en info@urishop.com
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Layout>
            } />

            <Route path="/privacy" element={
              <Layout>
                <div className="container py-5">
                  <div className="row justify-content-center">
                    <div className="col-md-10">
                      <h1 className="mb-4">🔒 Política de Privacidad</h1>
                      <div className="card">
                        <div className="card-body">
                          <p><strong>Última actualización:</strong> Enero 2025</p>
                          
                          <h5>1. Información que recopilamos</h5>
                          <p>Recopilamos información que nos proporcionas directamente...</p>
                          
                          <h5>2. Cómo usamos tu información</h5>
                          <p>Utilizamos tu información para procesar pedidos, comunicarnos contigo...</p>
                          
                          <h5>3. Compartir información</h5>
                          <p>No vendemos ni alquilamos tu información personal a terceros...</p>
                          
                          <h5>4. Seguridad de datos</h5>
                          <p>Implementamos medidas de seguridad para proteger tu información...</p>
                          
                          <h5>5. Cookies</h5>
                          <p>Utilizamos cookies para mejorar tu experiencia de navegación...</p>
                          
                          <h5>6. Contacto</h5>
                          <p>Si tienes preguntas sobre esta política, contáctanos en privacy@urishop.com</p>
                          
                          <div className="alert alert-success mt-4">
                            <strong>Tu privacidad es importante para nosotros.</strong> 
                            Estamos comprometidos con la protección de tus datos.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Layout>
            } />

            {/* ====== PÁGINAS DE AYUDA ====== */}
            
            <Route path="/help" element={
              <Layout>
                <div className="container py-5">
                  <div className="row">
                    <div className="col-md-8">
                      <h1 className="mb-4">❓ Centro de Ayuda</h1>
                      
                      {/* FAQ Sections */}
                      <div className="accordion" id="helpAccordion">
                        <div className="accordion-item">
                          <h2 className="accordion-header">
                            <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#shipping">
                              ¿Cómo funcionan los envíos?
                            </button>
                          </h2>
                          <div id="shipping" className="accordion-collapse collapse show">
                            <div className="accordion-body">
                              Realizamos envíos a todo el país. Envío gratis en compras superiores a $50.000.
                              Los tiempos de entrega varían entre 3-7 días hábiles según la ubicación.
                            </div>
                          </div>
                        </div>
                        
                        <div className="accordion-item">
                          <h2 className="accordion-header">
                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#payment">
                              ¿Qué métodos de pago aceptan?
                            </button>
                          </h2>
                          <div id="payment" className="accordion-collapse collapse">
                            <div className="accordion-body">
                              Aceptamos tarjetas de crédito/débito, transferencia bancaria, 
                              MercadoPago y financiación en 12 cuotas sin interés.
                            </div>
                          </div>
                        </div>
                        
                        <div className="accordion-item">
                          <h2 className="accordion-header">
                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#warranty">
                              ¿Qué incluye la garantía?
                            </button>
                          </h2>
                          <div id="warranty" className="accordion-collapse collapse">
                            <div className="accordion-body">
                              Todos nuestros productos incluyen garantía oficial del fabricante. 
                              Además, ofrecemos soporte técnico y garantía extendida opcional.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-4">
                      <div className="card">
                        <div className="card-header">
                          <h5>¿Necesitas más ayuda?</h5>
                        </div>
                        <div className="card-body">
                          <p>Nuestro equipo está listo para ayudarte</p>
                          <div className="d-grid gap-2">
                            <a href="mailto:info@urishop.com" className="btn btn-primary">
                              📧 Enviar Email
                            </a>
                            <a href="https://wa.me/5492911234567" className="btn btn-success">
                              📱 WhatsApp
                            </a>
                            <a href="tel:+5492911234567" className="btn btn-outline-primary">
                              📞 Llamar
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Layout>
            } />

            {/* ====== RUTA 404 ====== */}
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