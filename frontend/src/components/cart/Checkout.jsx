// frontend/src/components/cart/Checkout.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert, 
  Spinner,
  Badge,
  Modal
} from 'react-bootstrap';
import { 
  FaCreditCard, 
  FaUser, 
  FaMapMarkerAlt, 
  FaShoppingCart,
  FaLock,
  FaArrowLeft,
  FaCheckCircle
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import cartService from '../../services/cartService';
import './Styles/Checkout.css';

const Checkout = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const navigate = useNavigate();

  // Estados del formulario
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const [shippingInfo, setShippingInfo] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    instructions: ''
  });

  const [paymentInfo, setPaymentInfo] = useState({
    method: 'credit_card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });

  const [errors, setErrors] = useState({});

  // Cargar carrito
  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await cartService.getCurrentCart();
      setCart(response.data);
      
      // Si el carrito está vacío, redirigir
      if (!response.data || !response.data.items || response.data.items.length === 0) {
        navigate('/cart');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    // Validar información del cliente
    if (!customerInfo.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }
    if (!customerInfo.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }
    if (!customerInfo.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) {
      newErrors.email = 'El email no es válido';
    }
    if (!customerInfo.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    // Validar información de envío
    if (!shippingInfo.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }
    if (!shippingInfo.city.trim()) {
      newErrors.city = 'La ciudad es requerida';
    }
    if (!shippingInfo.state.trim()) {
      newErrors.state = 'La provincia es requerida';
    }
    if (!shippingInfo.zipCode.trim()) {
      newErrors.zipCode = 'El código postal es requerido';
    }

    // Validar información de pago
    if (paymentInfo.method === 'credit_card' || paymentInfo.method === 'debit_card') {
      if (!paymentInfo.cardNumber.trim()) {
        newErrors.cardNumber = 'El número de tarjeta es requerido';
      }
      if (!paymentInfo.expiryDate.trim()) {
        newErrors.expiryDate = 'La fecha de vencimiento es requerida';
      }
      if (!paymentInfo.cvv.trim()) {
        newErrors.cvv = 'El CVV es requerido';
      }
      if (!paymentInfo.cardName.trim()) {
        newErrors.cardName = 'El nombre en la tarjeta es requerido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Procesar pedido
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      // Simular procesamiento del pedido
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generar ID de orden simulado
      const newOrderId = `ORD-${Date.now()}`;
      setOrderId(newOrderId);

      // Limpiar carrito
      await cartService.clearCurrentCart();

      // Mostrar modal de éxito
      setShowSuccessModal(true);

    } catch (err) {
      setError(err.message || 'Error al procesar el pedido');
      console.error('Error processing order:', err);
    } finally {
      setProcessing(false);
    }
  };

  // Manejar cambios en los formularios
  const handleCustomerInfoChange = (field, value) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleShippingInfoChange = (field, value) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handlePaymentInfoChange = (field, value) => {
    setPaymentInfo(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Calcular totales
  const getCartTotals = () => {
    if (!cart) return { subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 };
    return {
      subtotal: cart.subtotal || 0,
      tax: cart.tax || 0,
      shipping: cart.shipping || 0,
      total: cart.total || 0,
      itemCount: cart.totalItems || 0
    };
  };

  const totals = getCartTotals();

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

      <Form onSubmit={handleSubmitOrder} className="checkout-form">
        <Row>
          {/* Formularios */}
          <Col lg={8}>
            {/* Información del Cliente */}
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
                  <FaMapMarkerAlt className="me-2" />
                  Dirección de Envío
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
                      <Form.Select
                        value={shippingInfo.state}
                        onChange={(e) => handleShippingInfoChange('state', e.target.value)}
                        isInvalid={!!errors.state}
                        disabled={processing}
                        required
                      >
                        <option value="">Seleccionar...</option>
                        <option value="Buenos Aires">Buenos Aires</option>
                        <option value="CABA">CABA</option>
                        <option value="Córdoba">Córdoba</option>
                        <option value="Santa Fe">Santa Fe</option>
                        <option value="Mendoza">Mendoza</option>
                        <option value="Tucumán">Tucumán</option>
                        <option value="Entre Ríos">Entre Ríos</option>
                        <option value="Salta">Salta</option>
                        <option value="Corrientes">Corrientes</option>
                        <option value="Misiones">Misiones</option>
                        <option value="San Juan">San Juan</option>
                        <option value="Jujuy">Jujuy</option>
                        <option value="Río Negro">Río Negro</option>
                        <option value="Neuquén">Neuquén</option>
                        <option value="Chubut">Chubut</option>
                        <option value="San Luis">San Luis</option>
                        <option value="Formosa">Formosa</option>
                        <option value="Chaco">Chaco</option>
                        <option value="Santiago del Estero">Santiago del Estero</option>
                        <option value="Catamarca">Catamarca</option>
                        <option value="La Rioja">La Rioja</option>
                        <option value="La Pampa">La Pampa</option>
                        <option value="Santa Cruz">Santa Cruz</option>
                        <option value="Tierra del Fuego">Tierra del Fuego</option>
                      </Form.Select>
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
                <Form.Group className="mb-3">
                  <Form.Label>Instrucciones de entrega (opcional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={shippingInfo.instructions}
                    onChange={(e) => handleShippingInfoChange('instructions', e.target.value)}
                    disabled={processing}
                    placeholder="Ej: Portero eléctrico, piso, departamento, referencias..."
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Información de Pago */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <FaCreditCard className="me-2" />
                  Método de Pago
                </h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Método de pago</Form.Label>
                  <Form.Select
                    value={paymentInfo.method}
                    onChange={(e) => handlePaymentInfoChange('method', e.target.value)}
                    disabled={processing}
                  >
                    <option value="credit_card">Tarjeta de Crédito</option>
                    <option value="debit_card">Tarjeta de Débito</option>
                    <option value="bank_transfer">Transferencia Bancaria</option>
                    <option value="cash_on_delivery">Efectivo contra entrega</option>
                  </Form.Select>
                </Form.Group>

                {(paymentInfo.method === 'credit_card' || paymentInfo.method === 'debit_card') && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Número de tarjeta *</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={paymentInfo.cardNumber}
                        onChange={(e) => handlePaymentInfoChange('cardNumber', e.target.value)}
                        isInvalid={!!errors.cardNumber}
                        disabled={processing}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.cardNumber}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Fecha de vencimiento *</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="MM/AA"
                            value={paymentInfo.expiryDate}
                            onChange={(e) => handlePaymentInfoChange('expiryDate', e.target.value)}
                            isInvalid={!!errors.expiryDate}
                            disabled={processing}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.expiryDate}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>CVV *</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="123"
                            value={paymentInfo.cvv}
                            onChange={(e) => handlePaymentInfoChange('cvv', e.target.value)}
                            isInvalid={!!errors.cvv}
                            disabled={processing}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.cvv}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre en la tarjeta *</Form.Label>
                      <Form.Control
                        type="text"
                        value={paymentInfo.cardName}
                        onChange={(e) => handlePaymentInfoChange('cardName', e.target.value)}
                        isInvalid={!!errors.cardName}
                        disabled={processing}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.cardName}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </>
                )}

                {paymentInfo.method === 'bank_transfer' && (
                  <Alert variant="info">
                    <Alert.Heading>Transferencia Bancaria</Alert.Heading>
                    <p>Una vez confirmado el pedido, recibirás los datos bancarios para realizar la transferencia.</p>
                  </Alert>
                )}

                {paymentInfo.method === 'cash_on_delivery' && (
                  <Alert variant="warning">
                    <Alert.Heading>Efectivo contra entrega</Alert.Heading>
                    <p>Pagarás en efectivo al momento de recibir tu pedido. Asegúrate de tener el monto exacto.</p>
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Resumen del Pedido */}
          <Col lg={4}>
            <Card className="order-summary sticky-top">
              <Card.Header>
                <h5 className="mb-0">
                  <FaShoppingCart className="me-2" />
                  Resumen del Pedido
                </h5>
              </Card.Header>
              <Card.Body>
                {/* Items del carrito */}
                {cart && cart.items && cart.items.map((item, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                    <div className="d-flex align-items-center flex-grow-1">
                      <img 
                        src={item.product?.thumbnail || '/placeholder-image.jpg'} 
                        alt={item.product?.title || 'Producto'}
                        className="item-image me-2"
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                      <div className="flex-grow-1">
                        <small className="fw-bold d-block">
                          {item.product?.title || 'Producto'}
                        </small>
                        <small className="text-muted">
                          Cantidad: {item.quantity}
                        </small>
                      </div>
                    </div>
                    <div>
                      <small className="fw-bold">{formatPrice(item.subtotal || 0)}</small>
                    </div>
                  </div>
                ))}

                <hr />

                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
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
                  <strong className="text-primary fs-5">
                    {formatPrice(totals.total)}
                  </strong>
                </div>

                <Button 
                  type="submit"
                  variant="success" 
                  size="lg" 
                  className="w-100"
                  disabled={processing || totals.itemCount === 0}
                >
                  {processing ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <FaLock className="me-2" />
                      Confirmar Pedido
                    </>
                  )}
                </Button>

                <div className="mt-3 text-center">
                  <small className="text-muted security-badge">
                    <FaLock className="me-1" />
                    Transacción segura y encriptada
                  </small>
                </div>

                {totals.shipping === 0 && (
                  <div className="mt-2 text-center">
                    <Badge bg="success">
                      🚚 Envío gratuito incluido
                    </Badge>
                  </div>
                )}

                <div className="mt-3 text-center">
                  <small className="text-muted">
                    Al confirmar tu pedido, aceptas nuestros términos y condiciones.
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>

      {/* Modal de Éxito */}
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaCheckCircle className="text-success me-2" />
            ¡Pedido Confirmado!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="mb-4">
            <FaCheckCircle size={80} className="text-success" />
          </div>
          <h4 className="mb-3">¡Gracias por tu compra!</h4>
          <p className="mb-3">Tu pedido ha sido procesado exitosamente.</p>
          
          <div className="bg-light p-3 rounded mb-4">
            <h5 className="mb-2">Número de pedido:</h5>
            <code className="fs-6">{orderId}</code>
          </div>
          
          <div className="mb-4">
            <h6>Resumen del pedido:</h6>
            <div className="d-flex justify-content-between">
              <span>Total pagado:</span>
              <strong className="text-success">{formatPrice(totals.total)}</strong>
            </div>
            <div className="d-flex justify-content-between">
              <span>Método de pago:</span>
              <span className="text-capitalize">
                {paymentInfo.method === 'credit_card' && 'Tarjeta de Crédito'}
                {paymentInfo.method === 'debit_card' && 'Tarjeta de Débito'}
                {paymentInfo.method === 'bank_transfer' && 'Transferencia Bancaria'}
                {paymentInfo.method === 'cash_on_delivery' && 'Efectivo contra entrega'}
              </span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Dirección de envío:</span>
              <span>{shippingInfo.city}, {shippingInfo.state}</span>
            </div>
          </div>
          
          <Alert variant="info" className="text-start">
            <Alert.Heading className="h6">
              <FaMapMarkerAlt className="me-2" />
              Próximos pasos
            </Alert.Heading>
            <ul className="mb-0 ps-3">
              <li>Recibirás un email de confirmación con los detalles</li>
              <li>Te enviaremos el código de seguimiento del envío</li>
              <li>El tiempo estimado de entrega es de 3-5 días hábiles</li>
              {paymentInfo.method === 'bank_transfer' && (
                <li>Revisa tu email para los datos de transferencia</li>
              )}
            </ul>
          </Alert>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <Button 
            variant="outline-primary" 
            onClick={() => {
              setShowSuccessModal(false);
              navigate('/');
            }}
          >
            <FaArrowLeft className="me-2" />
            Continuar comprando
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              setShowSuccessModal(false);
              navigate('/orders');
            }}
          >
            Ver mis pedidos
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Checkout;