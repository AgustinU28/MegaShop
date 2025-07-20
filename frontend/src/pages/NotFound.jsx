// frontend/src/pages/NotFound.jsx
import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHome, FaShoppingBag, FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="text-center shadow-lg border-0">
            <Card.Body className="p-5">
              {/* Icono grande */}
              <div className="mb-4">
                <FaExclamationTriangle 
                  className="text-warning mb-3" 
                  size={80} 
                />
                <h1 className="display-1 fw-bold text-primary">404</h1>
              </div>

              {/* Mensaje */}
              <h2 className="h3 mb-3">¡Oops! Página no encontrada</h2>
              <p className="text-muted mb-4">
                La página que buscas no existe o ha sido movida. 
                Pero no te preocupes, tenemos muchas otras cosas geniales para mostrarte.
              </p>

              {/* Botones de acción */}
              <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                <Button 
                  as={Link} 
                  to="/" 
                  variant="primary" 
                  size="lg"
                  className="me-md-2"
                >
                  <FaHome className="me-2" />
                  Ir al Inicio
                </Button>
                
                <Button 
                  as={Link} 
                  to="/shop" 
                  variant="outline-primary" 
                  size="lg"
                >
                  <FaShoppingBag className="me-2" />
                  Ver Tienda
                </Button>
              </div>

              {/* Enlaces adicionales */}
              <div className="mt-4 pt-4 border-top">
                <p className="text-muted mb-2">¿Necesitas ayuda?</p>
                <div className="d-flex justify-content-center gap-3">
                  <Link to="/contact" className="text-decoration-none">
                    Contactanos
                  </Link>
                  <span className="text-muted">|</span>
                  <Link to="/about" className="text-decoration-none">
                    Acerca de nosotros
                  </Link>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;