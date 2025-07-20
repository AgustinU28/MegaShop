// frontend/src/components/cart/CheckoutWithStripe.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  Alert, 
  Spinner,
  Modal 
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaLock, 
  FaUser, 
  FaShippingFast, 
  FaCreditCard, 
  FaCheckCircle 
} from 'react-icons/fa';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import stripePromise from '../../config/stripe';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import cartService from '../../services/cartService';
import paymentService from '../../services/paymentService';

// Componente del formulario de pago
const CheckoutForm = ({ cart, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [errors, setErrors] = useState({});

  // Estados del formulario
  const [customerInfo, setCustomerInfo] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: ''
  });

  const [shippingInfo, setShippingInfo] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    instructions: ''
  });

  // Crear Payment Intent al cargar
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        if (!cart?.data?.total) return;

        const response = await paymentService.createPaymentIntent(
          cart.data.total,
          {
            cartId: cart.data.cartId || 'unknown',
            userId: user?.id || 'guest'
          }
        );

        setClientSecret(response.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        onError('Error al preparar el pago');
      }
    };

    createPaymentIntent();
  }, [cart, user]);

  // Manejar cambios en customer info
  const handleCustomerInfoChange = (field, value) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Manejar cambios en shipping info
  const handleShippingInfoChange = (field, value) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!customerInfo.firstName.trim()) newErrors.firstName = 'Nombre requerido';
    if (!customerInfo.lastName.trim()) newErrors.lastName = 'Apellido requerido';
    if (!customerInfo.email.trim()) newErrors.email = 'Email requerido';
    if (!customerInfo.phone.trim()) newErrors.phone = 'Teléfono requerido';
    if (!shippingInfo.address.trim()) newErrors.address = 'Dirección requerida';
    if (!shippingInfo.city.trim()) newErrors.city = 'Ciudad requerida';
    if (!shippingInfo.state.trim()) newErrors.state = 'Provincia requerida';
    if (!shippingInfo.zipCode.trim()) newErrors.zipCode = 'Código postal requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Procesar pago
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);

      // Confirmar pago con Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            email: customerInfo.email,
            phone: customerInfo.phone,
            address: {
              line1: shippingInfo.address,
              city: shippingInfo.city,
              state: shippingInfo.state,
              postal_code: shippingInfo.zipCode,
              country: 'AR'
            }
          },
        },
      });

      if (error) {
        console.error('Payment failed:', error);
        onError(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        // Confirmar en el backend y crear orden
        const response = await paymentService.confirmPayment(
          paymentIntent.id,
          { items: cart.data.items },
          shippingInfo,
          customerInfo
        );

        onSuccess(response.order);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      onError('Error al procesar el pago');
    } finally {
      setProcessing(false);
    }
  };

  // Opciones para CardElement
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
    },
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        {/* Información del Cliente */}
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <FaUser className="me-2" />
                Información del Cliente
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombre *</Form.Label>
                    <Form.Control
                      type="text"
                      value={customerInfo.firstName}
                      onChange={(e) => handleCustomerInfoChange('firstName', e.target.value)}
                      isInvalid={!!errors.firstName}
                      disabled={processing}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.firstName}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Apellido *</Form.Label>
                    <Form.Control
                      type="text"
                      value={customerInfo.lastName}
                      onChange={(e) => handleCustomerInfoChange('lastName', e.target.value)}
                      isInvalid={!!errors.lastName}
                      disabled={processing}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.lastName}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email *</Form.Label>
                    <Form.Control
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                      isInvalid={!!errors.email}
                      disabled={processing}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Teléfono *</Form.Label>
                    <Form.Control
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                      isInvalid={!!errors.phone}
                      disabled={processing}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.phone}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Información de Envío */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <FaShippingFast className="me-2" />
                Información de Envío
              </h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Dirección *</Form.Label>
                <Form.Control
                  type="text"
                  value={shippingInfo.address}
                  onChange={(e) => handleShippingInfoChange('address', e.target.value)}
                  isInvalid={!!errors.address}
                  disabled={processing}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.address}
                </Form.Control.Feedback>
              </Form.Group>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Ciudad *</Form.Label>
                    <Form.Control
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) => handleShippingInfoChange('city', e.target.value)}
                      isInvalid={!!errors.city}
                      disabled={processing}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.city}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Provincia *</Form.Label>
                    <Form.Control
                      type="text"
                      value={shippingInfo.state}
                      onChange={(e) => handleShippingInfoChange('state', e.target.value)}
                      isInvalid={!!errors.state}
                      disabled={processing}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.state}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Código Postal *</Form.Label>
                    <Form.Control
                      type="text"
                      value={shippingInfo.zipCode}
                      onChange={(e) => handleShippingInfoChange('zipCode', e.target.value)}
                      isInvalid={!!errors.zipCode}
                      disabled={processing}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.zipCode}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Información de Pago */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <FaCreditCard className="me-2" />
                Información de Pago
              </h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Datos de la Tarjeta *</Form.Label>
                <div className="p-3 border rounded">
                  <CardElement options={cardElementOptions} />
                </div>
                <Form.Text className="text-muted">
                  <FaLock className="me-1" />
                  Tu información de pago está segura y encriptada.
                </Form.Text>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        {/* Resumen del Pedido */}
        <Col lg={4}>
          <Card className="order-summary sticky-top" style={{ top: '20px' }}>
            <Card.Header>
              <h5 className="mb-0">Resumen del Pedido</h5>
            </Card.Header>
            <Card.Body>
              {cart?.data?.items?.map((item, index) => (
                <div key={index} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="me-3 rounded"
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                  />
                  <div className="flex-grow-1">
                    <h6 className="mb-1">{item.title}</h6>
                    <small className="text-muted">Cantidad: {item.quantity}</small>
                  </div>
                  <strong>${item.price * item.quantity}</strong>
                </div>
              ))}
              
              <div className="border-top pt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>${cart?.data?.subtotal || 0}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Envío:</span>
                  <span>Gratis</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <strong>Total:</strong>
                  <strong className="text-primary">${cart?.data?.total || 0}</strong>
                </div>
              </div>

              <Button
                type="submit"
                variant="success"
                size="lg"
                className="w-100"
                disabled={!stripe || processing}
              >
                {processing ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <FaLock className="me-2" />
                    Finalizar Compra
                  </>
                )}
              </Button>

              <div className="text-center mt-3">
                <small className="text-muted">
                  <FaLock className="me-1" />
                  Pago seguro con encriptación SSL
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Form>
  );
};

// Componente principal del Checkout
const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [order, setOrder] = useState(null);

  // Cargar carrito
  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true);
        const response = await cartService.getCurrentCart();
        
        if (!response.data?.items || response.data.items.length === 0) {
          navigate('/cart');
          return;
        }
        
        setCart(response);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [navigate]);

  // Manejar éxito del pago
  const handlePaymentSuccess = (orderData) => {
    setOrder(orderData);
    setShowSuccess(true);
  };

  // Manejar error del pago
  const handlePaymentError = (errorMessage) => {
    setError(errorMessage);
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-3">Cargando checkout...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => navigate('/cart')}>
            Volver al carrito
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <Container className="py-4">
        <Row>
          <Col>
            <div className="d-flex align-items-center mb-4">
              <Button
                variant="outline-secondary"
                onClick={() => navigate('/cart')}
                className="me-3"
              >
                <FaArrowLeft />
              </Button>
              <h2>
                <FaLock className="me-2" />
                Finalizar Compra
              </h2>
            </div>
          </Col>
        </Row>

        <CheckoutForm
          cart={cart}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />

        {/* Modal de éxito */}
        <Modal show={showSuccess} onHide={() => {}} backdrop="static" centered>
          <Modal.Header>
            <Modal.Title>
              <FaCheckCircle className="text-success me-2" />
              ¡Pago Exitoso!
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            <h5>¡Gracias por tu compra!</h5>
            <p>Tu pedido ha sido procesado exitosamente.</p>
            {order && (
              <div className="alert alert-info">
                <strong>Número de orden:</strong> #{order.id}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={() => navigate('/orders')}>
              Ver mis pedidos
            </Button>
            <Button variant="secondary" onClick={() => navigate('/')}>
              Ir al inicio
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </Elements>
  );
};

export default Checkout;