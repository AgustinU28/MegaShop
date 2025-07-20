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
          <Row className="align-items-center">
            <Col lg={6}>
              <h1 className="display-4 fw-bold mb-4">
                Las Mejores Computadoras Gamer
              </h1>
              <p className="lead mb-4">
                Descubre nuestra selección de PCs gamer de alta gama, 
                diseñadas para ofrecerte la mejor experiencia de juego.
              </p>
              <Button 
                as={Link} 
                to="/shop" 
                variant="light" 
                size="lg"
                className="me-3"
              >
                Ver Catálogo
              </Button>
              <Button 
                as={Link} 
                to="/shop?featured=true" 
                variant="outline-light" 
                size="lg"
              >
                Productos Destacados
              </Button>
            </Col>
            <Col lg={6} className="text-center">
              <img 
                src="https://via.placeholder.com/600x400/007bff/ffffff?text=Gaming+PC" 
                alt="Gaming PC" 
                className="img-fluid rounded shadow"
              />
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
    </div>
  );
};

export default Home;