// frontend/src/components/cart/Cart.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaShoppingCart, FaTrash, FaCreditCard, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import CartItem from './CartItem';
import cartService from '../../services/cartService';
import './Styles/Cart.css';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  // Cargar carrito
  const loadCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await cartService.getCurrentCart();
      setCart(response.data);
      
    } catch (err) {
      setError(err.message);
      console.error('Error loading cart:', err);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar cantidad
  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      setUpdating(true);
      const response = await cartService.updateCurrentCartQuantity(productId, newQuantity);
      setCart(response.data);
      
    } catch (err) {
      setError(err.message);
      console.error('Error updating quantity:', err);
    } finally {
      setUpdating(false);
    }
  };

  // Eliminar producto
  const handleRemoveProduct = async (productId) => {
    try {
      setUpdating(true);
      const response = await cartService.removeFromCurrentCart(productId);
      setCart(response.data);
      
    } catch (err) {
      setError(err.message);
      console.error('Error removing product:', err);
    } finally {
      setUpdating(false);
    }
  };

  // Vaciar carrito
  const handleClearCart = async () => {
    if (!window.confirm('¿Estás seguro de que quieres vaciar todo el carrito?')) {
      return;
    }

    try {
      setUpdating(true);
      await cartService.clearCurrentCart();
      setCart({ items: [], total: 0, totalItems: 0, subtotal: 0, tax: 0, shipping: 0 });
      
    } catch (err) {
      setError(err.message);
      console.error('Error clearing cart:', err);
    } finally {
      setUpdating(false);
    }
  };

  // Proceder al checkout
  const handleCheckout = () => {
    if (!cart || cart.items.length === 0) return;
    navigate('/checkout');
  };

  // Continuar comprando
  const handleContinueShopping = () => {
    navigate('/shop');
  };

  // Calcular totales del carrito
  const getCartTotals = () => {
    if (!cart || !cart.items) {
      return { 
        subtotal: 0, 
        itemCount: 0, 
        total: 0, 
        tax: 0, 
        shipping: 0 
      };
    }

    return {
      subtotal: cart.subtotal || 0,
      itemCount: cart.totalItems || 0,
      total: cart.total || 0,
      tax: cart.tax || 0,
      shipping: cart.shipping || 0
    };
  };

  const totals = getCartTotals();

  useEffect(() => {
    loadCart();
  }, []);

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" role="status" className="me-2">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p>Cargando carrito...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <Alert.Heading>Error al cargar el carrito</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={loadCart}>
            Reintentar
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>
              <FaShoppingCart className="me-2" />
              Mi Carrito
              {totals.itemCount > 0 && (
                <Badge bg="primary" className="ms-2">
                  {totals.itemCount}
                </Badge>
              )}
            </h2>
            
            {cart && cart.items && cart.items.length > 0 && (
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={handleClearCart}
                disabled={updating}
              >
                <FaTrash className="me-1" />
                Vaciar carrito
              </Button>
            )}
          </div>
        </Col>
      </Row>

      {!cart || !cart.items || cart.items.length === 0 ? (
        <Row>
          <Col>
            <Card className="text-center py-5">
              <Card.Body>
                <FaShoppingCart size={64} className="text-muted mb-3" />
                <h4>Tu carrito está vacío</h4>
                <p className="text-muted">
                  Agrega algunos productos para comenzar a comprar
                </p>
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={handleContinueShopping}
                >
                  <FaArrowLeft className="me-2" />
                  Continuar comprando
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        <Row>
          {/* Lista de productos */}
          <Col lg={8}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Productos en tu carrito ({cart.items.length})</h5>
              </Card.Header>
              <Card.Body className="p-0">
                {cart.items.map((item, index) => (
                  <div key={`${item.productId}-${index}`}>
                    <CartItem
                      item={item}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemove={handleRemoveProduct}
                      disabled={updating}
                    />
                    {index < cart.items.length - 1 && <hr className="m-0" />}
                  </div>
                ))}
              </Card.Body>
            </Card>

            <div className="mt-3">
              <Button 
                variant="outline-primary" 
                onClick={handleContinueShopping}
              >
                <FaArrowLeft className="me-2" />
                Continuar comprando
              </Button>
            </div>
          </Col>

          {/* Resumen del carrito */}
          <Col lg={4}>
            <Card className="cart-summary">
              <Card.Header>
                <h5 className="mb-0">Resumen del pedido</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal ({totals.itemCount} productos)</span>
                  <span>{formatPrice(totals.subtotal)}</span>
                </div>
                
                <div className="d-flex justify-content-between mb-2">
                  <span>IVA (21%)</span>
                  <span>{formatPrice(totals.tax)}</span>
                </div>
                
                <div className="d-flex justify-content-between mb-2">
                  <span>Envío</span>
                  <span className={totals.shipping === 0 ? "text-success" : ""}>
                    {totals.shipping === 0 ? "Gratis" : formatPrice(totals.shipping)}
                  </span>
                </div>
                
                <hr />
                
                <div className="d-flex justify-content-between mb-3">
                  <strong>Total</strong>
                  <strong className="text-primary fs-4">
                    {formatPrice(totals.total)}
                  </strong>
                </div>

                <Button 
                  variant="success" 
                  size="lg" 
                  className="w-100"
                  onClick={handleCheckout}
                  disabled={updating || totals.itemCount === 0}
                >
                  <FaCreditCard className="me-2" />
                  Proceder al pago
                </Button>

                <div className="mt-3 text-center">
                  <small className="text-muted">
                    🚚 Envío gratis en compras superiores a $50.000
                  </small>
                </div>

                {totals.subtotal >= 50000 && (
                  <div className="mt-2 text-center">
                    <Badge bg="success">
                      ¡Felicitaciones! Tenés envío gratis 🎉
                    </Badge>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Cart;