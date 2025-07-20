// frontend/src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';
import productService from '../services/productService';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getAllProducts({ featured: true });
        setFeaturedProducts(response.data.slice(0, 8)); // Mostrar solo 8 productos
      } catch (err) {
        setError(err.message);
        console.error('Error loading featured products:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center min-vh-50">
            <Col lg={6} className="mb-4 mb-lg-0">
              <h1 className="display-4 fw-bold mb-4">
                Las Mejores Computadoras Gamer
              </h1>
              <p className="lead mb-4">
                Descubre nuestra selección de PCs gamer de alta gama, 
                diseñadas para ofrecerte la mejor experiencia de juego.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3">
                <Button 
                  as={Link} 
                  to="/shop" 
                  variant="light" 
                  size="lg"
                  className="px-4 py-3"
                >
                  Ver Catálogo
                </Button>
                <Button 
                  as={Link} 
                  to="/shop?featured=true" 
                  variant="outline-light" 
                  size="lg"
                  className="px-4 py-3"
                >
                  Productos Destacados
                </Button>
              </div>
            </Col>
            <Col lg={6} className="text-center">
              {/* Logo UriShopp Container */}
              <div className="logo-container position-relative">
                <div 
                  className="urishopp-logo-bg"
                  style={{
                    background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
                    borderRadius: '20px',
                    padding: '3rem',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    border: '2px solid rgba(255,255,255,0.1)'
                  }}
                >
                  {/* Logo SVG Inline */}
                  <div className="urishopp-logo" style={{ fontSize: '0' }}>
                    <svg 
                      width="300" 
                      height="200" 
                      viewBox="0 0 400 250" 
                      style={{ filter: 'drop-shadow(0 5px 15px rgba(74, 222, 128, 0.3))' }}
                    >
                      {/* Server/Computer Icon */}
                      <defs>
                        <linearGradient id="serverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#4ade80" />
                          <stop offset="100%" stopColor="#22c55e" />
                        </linearGradient>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                          <feMerge> 
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      
                      {/* Server Box */}
                      <rect 
                        x="120" 
                        y="30" 
                        width="80" 
                        height="110" 
                        rx="8" 
                        fill="none" 
                        stroke="url(#serverGradient)" 
                        strokeWidth="4"
                        filter="url(#glow)"
                      />
                      
                      {/* Server Front Panel */}
                      <rect 
                        x="125" 
                        y="35" 
                        width="25" 
                        height="15" 
                        rx="2" 
                        fill="url(#serverGradient)"
                      />
                      
                      {/* Power Button */}
                      <circle 
                        cx="137.5" 
                        cy="60" 
                        r="6" 
                        fill="none" 
                        stroke="url(#serverGradient)" 
                        strokeWidth="2"
                      />
                      
                      {/* Server Lines */}
                      <rect x="125" y="75" width="25" height="3" rx="1" fill="url(#serverGradient)" />
                      <rect x="125" y="85" width="25" height="3" rx="1" fill="url(#serverGradient)" />
                      <rect x="125" y="95" width="25" height="3" rx="1" fill="url(#serverGradient)" />
                      
                      {/* 3D Effect - Right Side */}
                      <polygon 
                        points="200,30 230,60 230,170 200,140" 
                        fill="none" 
                        stroke="url(#serverGradient)" 
                        strokeWidth="4" 
                        opacity="0.7"
                        filter="url(#glow)"
                      />
                      
                      {/* 3D Effect - Top */}
                      <polygon 
                        points="120,30 200,30 230,60 150,60" 
                        fill="none" 
                        stroke="url(#serverGradient)" 
                        strokeWidth="4" 
                        opacity="0.5"
                        filter="url(#glow)"
                      />
                      
                      {/* URISHOPP Text */}
                      <text 
                        x="200" 
                        y="220" 
                        fontSize="48" 
                        fontWeight="bold" 
                        fontFamily="Arial Black, sans-serif" 
                        fill="url(#serverGradient)"
                        textAnchor="middle"
                        filter="url(#glow)"
                        style={{ letterSpacing: '2px' }}
                      >
                        URISHOPP
                      </text>
                    </svg>
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="floating-elements position-absolute">
                    <div 
                      className="float-1"
                      style={{
                        position: 'absolute',
                        top: '10%',
                        right: '10%',
                        animation: 'float 3s ease-in-out infinite',
                        fontSize: '2rem',
                        opacity: '0.7'
                      }}
                    >
                      💻
                    </div>
                    <div 
                      className="float-2"
                      style={{
                        position: 'absolute',
                        bottom: '15%',
                        left: '5%',
                        animation: 'float 4s ease-in-out infinite reverse',
                        fontSize: '1.5rem',
                        opacity: '0.6'
                      }}
                    >
                      🎮
                    </div>
                    <div 
                      className="float-3"
                      style={{
                        position: 'absolute',
                        top: '30%',
                        left: '15%',
                        animation: 'float 2.5s ease-in-out infinite',
                        fontSize: '1.2rem',
                        opacity: '0.5'
                      }}
                    >
                      ⚡
                    </div>
                  </div>
                </div>
                
                {/* Tech Specs Badge */}
                <div 
                  className="tech-badge position-absolute"
                  style={{
                    bottom: '-20px',
                    right: '20px',
                    background: 'rgba(74, 222, 128, 0.1)',
                    border: '1px solid #4ade80',
                    borderRadius: '15px',
                    padding: '8px 16px',
                    fontSize: '0.8rem',
                    color: '#4ade80',
                    fontWeight: 'bold'
                  }}
                >
                  ⚡ Alta Performance
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Featured Products Section */}
      <section className="featured-section py-5">
        <Container>
          <Row>
            <Col>
              <h2 className="text-center mb-5">Productos Destacados</h2>
              
              {loading && (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </Spinner>
                  <p className="mt-3">Cargando productos destacados...</p>
                </div>
              )}

              {error && (
                <Alert variant="danger" className="text-center">
                  <Alert.Heading>Error al cargar productos</Alert.Heading>
                  <p>{error}</p>
                </Alert>
              )}

              {!loading && !error && (
                <>
                  <Row>
                    {featuredProducts.map(product => (
                      <Col key={product.id} lg={3} md={4} sm={6} className="mb-4">
                        <ProductCard product={product} />
                      </Col>
                    ))}
                  </Row>
                  
                  <div className="text-center mt-4">
                    <Button 
                      as={Link} 
                      to="/shop" 
                      variant="primary" 
                      size="lg"
                    >
                      Ver Todos los Productos
                    </Button>
                  </div>
                </>
              )}
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section bg-light py-5">
        <Container>
          <Row>
            <Col>
              <h2 className="text-center mb-5">¿Por qué elegir UriShop?</h2>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center border-0 shadow-sm">
                <Card.Body>
                  <div className="mb-3">
                    <i className="fas fa-shipping-fast fa-3x text-primary"></i>
                  </div>
                  <Card.Title>Envío Gratis</Card.Title>
                  <Card.Text>
                    Envío gratuito en compras superiores a $50.000
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center border-0 shadow-sm">
                <Card.Body>
                  <div className="mb-3">
                    <i className="fas fa-tools fa-3x text-primary"></i>
                  </div>
                  <Card.Title>Garantía Extendida</Card.Title>
                  <Card.Text>
                    Todos nuestros productos incluyen garantía extendida
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center border-0 shadow-sm">
                <Card.Body>
                  <div className="mb-3">
                    <i className="fas fa-headset fa-3x text-primary"></i>
                  </div>
                  <Card.Title>Soporte 24/7</Card.Title>
                  <Card.Text>
                    Atención al cliente disponible las 24 horas del día
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .min-vh-50 {
          min-height: 50vh;
        }
        
        .urishopp-logo-bg:hover {
          transform: translateY(-5px);
          transition: transform 0.3s ease;
        }
        
        .tech-badge {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        
        .logo-container {
          max-width: 400px;
          margin: 0 auto;
        }
        
        @media (max-width: 768px) {
          .urishopp-logo-bg {
            padding: 2rem !important;
          }
          
          .urishopp-logo svg {
            width: 250px;
            height: 150px;
          }
          
          .floating-elements div {
            font-size: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;