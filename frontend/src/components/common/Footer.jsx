// frontend/src/components/common/Footer.jsx
import React from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaYoutube,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaShieldAlt,
  FaTruck,
  FaHeadset,
  FaCreditCard,
  FaArrowUp,
  FaHeart
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Handle newsletter subscription
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    if (email) {
      // Aquí integrarías con tu servicio de newsletter
      alert('¡Gracias por suscribirte a nuestro newsletter!');
      e.target.reset();
    }
  };

  return (
    <footer className="footer bg-dark text-light">
      {/* Newsletter Section */}
      <div className="newsletter-section bg-primary text-white py-4">
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="mb-3 mb-md-0">
              <h5 className="mb-1">📧 Suscríbete a nuestro newsletter</h5>
              <p className="mb-0">Recibe ofertas exclusivas y novedades sobre gaming</p>
            </Col>
            <Col md={6}>
              <Form onSubmit={handleNewsletterSubmit} className="d-flex">
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Tu email aquí..."
                  className="me-2"
                  required
                />
                <Button type="submit" variant="light">
                  Suscribirse
                </Button>
              </Form>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Main Footer Content */}
      <div className="footer-main py-5">
        <Container>
          <Row>
            {/* Company Info */}
            <Col lg={3} md={6} className="mb-4">
              <div className="footer-section">
                <h5 className="footer-title mb-3">
                  <span className="brand-icon">🎮</span>
                  UriShop
                </h5>
                <p className="footer-text">
                  Tu tienda especializada en equipamiento gamer de alta gama. 
                  Los mejores productos para llevar tu experiencia gaming al siguiente nivel.
                </p>
                
                {/* Social Media */}
                <div className="social-links mt-3">
                  <h6 className="mb-2">Síguenos:</h6>
                  <div className="d-flex gap-2">
                    <Button 
                      variant="outline-light" 
                      size="sm" 
                      className="social-btn"
                      href="https://facebook.com/urishop"
                      target="_blank"
                    >
                      <FaFacebook />
                    </Button>
                    <Button 
                      variant="outline-light" 
                      size="sm" 
                      className="social-btn"
                      href="https://instagram.com/urishop"
                      target="_blank"
                    >
                      <FaInstagram />
                    </Button>
                    <Button 
                      variant="outline-light" 
                      size="sm" 
                      className="social-btn"
                      href="https://twitter.com/urishop"
                      target="_blank"
                    >
                      <FaTwitter />
                    </Button>
                    <Button 
                      variant="outline-light" 
                      size="sm" 
                      className="social-btn"
                      href="https://youtube.com/urishop"
                      target="_blank"
                    >
                      <FaYoutube />
                    </Button>
                  </div>
                </div>
              </div>
            </Col>

            {/* Quick Links */}
            <Col lg={2} md={6} className="mb-4">
              <div className="footer-section">
                <h6 className="footer-title">Enlaces Rápidos</h6>
                <ul className="footer-links">
                  <li><Link to="/">Inicio</Link></li>
                  <li><Link to="/shop">Tienda</Link></li>
                  <li><Link to="/shop?category=Gaming">PC Gaming</Link></li>
                  <li><Link to="/shop?featured=true">Ofertas</Link></li>
                  <li><Link to="/about">Nosotros</Link></li>
                  <li><Link to="/contact">Contacto</Link></li>
                  <li><Link to="/blog">Blog</Link></li>
                </ul>
              </div>
            </Col>

            {/* Customer Service */}
            <Col lg={2} md={6} className="mb-4">
              <div className="footer-section">
                <h6 className="footer-title">Atención al Cliente</h6>
                <ul className="footer-links">
                  <li><Link to="/help">Centro de Ayuda</Link></li>
                  <li><Link to="/shipping">Envíos</Link></li>
                  <li><Link to="/returns">Devoluciones</Link></li>
                  <li><Link to="/warranty">Garantías</Link></li>
                  <li><Link to="/faq">Preguntas Frecuentes</Link></li>
                  <li><Link to="/size-guide">Guía de Compra</Link></li>
                  <li><Link to="/track-order">Seguir Pedido</Link></li>
                </ul>
              </div>
            </Col>

            {/* Legal */}
            <Col lg={2} md={6} className="mb-4">
              <div className="footer-section">
                <h6 className="footer-title">Legal</h6>
                <ul className="footer-links">
                  <li><Link to="/privacy">Privacidad</Link></li>
                  <li><Link to="/terms">Términos y Condiciones</Link></li>
                  <li><Link to="/cookies">Política de Cookies</Link></li>
                  <li><Link to="/legal">Información Legal</Link></li>
                  <li><Link to="/data-protection">Protección de Datos</Link></li>
                </ul>
              </div>
            </Col>

            {/* Contact Info */}
            <Col lg={3} md={12} className="mb-4">
              <div className="footer-section">
                <h6 className="footer-title">Información de Contacto</h6>
                <div className="contact-info">
                  <div className="contact-item mb-2">
                    <FaMapMarkerAlt className="contact-icon" />
                    <span>Av. Corrientes 1234, CABA, Argentina</span>
                  </div>
                  <div className="contact-item mb-2">
                    <FaPhone className="contact-icon" />
                    <span>+54 11 1234-5678</span>
                  </div>
                  <div className="contact-item mb-2">
                    <FaEnvelope className="contact-icon" />
                    <span>info@urishop.com</span>
                  </div>
                  <div className="contact-item mb-3">
                    <FaClock className="contact-icon" />
                    <span>Lun - Vie: 9:00 - 18:00</span>
                  </div>

                  {/* Features */}
                  <div className="features-list">
                    <div className="feature-item mb-2">
                      <FaTruck className="feature-icon text-success" />
                      <span>Envío gratis +$50.000</span>
                    </div>
                    <div className="feature-item mb-2">
                      <FaShieldAlt className="feature-icon text-info" />
                      <span>Garantía extendida</span>
                    </div>
                    <div className="feature-item mb-2">
                      <FaHeadset className="feature-icon text-warning" />
                      <span>Soporte 24/7</span>
                    </div>
                    <div className="feature-item">
                      <FaCreditCard className="feature-icon text-primary" />
                      <span>Pago seguro</span>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Payment Methods & Certifications */}
      <div className="footer-payments py-3 border-top border-secondary">
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="mb-3 mb-md-0">
              <h6 className="mb-2">Métodos de Pago:</h6>
              <div className="payment-methods d-flex flex-wrap gap-2">
                <span className="payment-method">💳 Visa</span>
                <span className="payment-method">💳 Mastercard</span>
                <span className="payment-method">💳 American Express</span>
                <span className="payment-method">🏦 Transferencia</span>
                <span className="payment-method">💰 Efectivo</span>
                <span className="payment-method">📱 MercadoPago</span>
              </div>
            </Col>
            <Col md={6} className="text-md-end">
              <h6 className="mb-2">Certificaciones:</h6>
              <div className="certifications">
                <span className="cert-badge me-2">🔒 SSL Seguro</span>
                <span className="cert-badge me-2">✅ E-commerce Confiable</span>
                <span className="cert-badge">🛡️ Datos Protegidos</span>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Copyright */}
      <div className="footer-bottom py-3 bg-black">
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="mb-2 mb-md-0">
              <p className="mb-0 text-muted">
                © {currentYear} UriShop. Todos los derechos reservados.
                Hecho con <FaHeart className="text-danger" /> en Argentina.
              </p>
            </Col>
            <Col md={6} className="text-md-end">
              <div className="d-flex justify-content-md-end align-items-center">
                <span className="me-3 text-muted">
                  Powered by React & Node.js
                </span>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={scrollToTop}
                  className="scroll-top-btn"
                  title="Volver arriba"
                >
                  <FaArrowUp />
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;