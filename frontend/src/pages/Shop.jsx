// frontend/src/pages/Shop.jsx
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import ProductList from '../components/products/ProductList';

const Shop = () => {
  return (
    <div className="shop-page">
      {/* Header de la tienda */}
      <div className="bg-light py-4 mb-4">
        <Container>
          <Row>
            <Col>
              <div className="text-center">
                <h1 className="display-4 fw-bold text-primary mb-2">🎮 UriShop</h1>
                <p className="lead text-muted mb-3">
                  Encuentra la computadora gamer perfecta para ti
                </p>
                <div className="d-flex justify-content-center gap-3">
                  <div className="d-flex align-items-center text-muted">
                    <i className="fas fa-shipping-fast me-2"></i>
                    <small>Envío gratis +$50.000</small>
                  </div>
                  <div className="d-flex align-items-center text-muted">
                    <i className="fas fa-shield-alt me-2"></i>
                    <small>Garantía extendida</small>
                  </div>
                  <div className="d-flex align-items-center text-muted">
                    <i className="fas fa-credit-card me-2"></i>
                    <small>12 cuotas sin interés</small>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* ProductList incluye ProductFilter y ProductCard automáticamente */}
      <ProductList />
    </div>
  );
};

export default Shop;