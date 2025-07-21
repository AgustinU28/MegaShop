// frontend/src/components/orders/OrderDetail.jsx - Corregido con validaciones defensivas
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Badge, 
  Button, 
  Table,
  Alert,
  Spinner,
  Modal
} from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaDownload, 
  FaEye, 
  FaShippingFast,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope
} from 'react-icons/fa';
import orderService from '../../services/orderService';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        const response = await orderService.getOrderById(id);
        
        // ✅ DEBUG: Verificar estructura de datos recibidos
        console.log('📦 Order received from API:', response);
        console.log('📦 Order.data:', response.data);
        console.log('📦 Order.data.data:', response.data.data);
        
        // ✅ Extraer datos correctamente (igual que en OrderList)
        const orderData = response.data.data || response.data;
        console.log('✅ Processed order data:', orderData);
        
        setOrder(orderData);
      } catch (err) {
        setError(err.message);
        console.error('Error loading order:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadOrder();
    }
  }, [id]);

  // ✅ Función para obtener el variant del badge según el estado
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', icon: FaClock, text: 'Pendiente' },
      confirmed: { variant: 'info', icon: FaCheckCircle, text: 'Confirmado' },
      processing: { variant: 'primary', icon: FaClock, text: 'Procesando' },
      shipped: { variant: 'info', icon: FaShippingFast, text: 'Enviado' },
      delivered: { variant: 'success', icon: FaCheckCircle, text: 'Entregado' },
      cancelled: { variant: 'danger', icon: FaTimesCircle, text: 'Cancelado' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge bg={config.variant} className="d-flex align-items-center gap-1">
        <IconComponent size={12} />
        {config.text}
      </Badge>
    );
  };

  // ✅ Función para formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price || 0);
  };

  // ✅ Función para formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ Manejar descarga de factura
  const handleDownloadInvoice = async () => {
    try {
      setLoading(true); // Mostrar estado de carga
      console.log('📄 Downloading invoice for order:', order?.orderNumber);
      
      await orderService.downloadInvoice(order._id);
      
      // Mostrar mensaje de éxito
      alert(`✅ Factura descargada exitosamente para la orden ${order?.orderNumber}`);
      
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert(`❌ Error al descargar la factura: ${error.message}`);
    } finally {
      setLoading(false); // Ocultar estado de carga
    }
  };

  // ✅ Manejar visualización de seguimiento
  const handleViewTracking = () => {
    setShowTrackingModal(true);
  };

  // Loading state
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando orden...</span>
        </Spinner>
        <p className="mt-2">Cargando detalles de la orden...</p>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h4>Error al cargar la orden</h4>
          <p>No se pudo cargar la información de la orden. La orden que buscas no existe o no tienes permisos para verla.</p>
          <Button variant="outline-danger" onClick={() => navigate('/orders')}>
            Volver a órdenes
          </Button>
        </Alert>
      </Container>
    );
  }

  // No order found
  if (!order) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <h4>Orden no encontrada</h4>
          <p>No se encontró la orden solicitada.</p>
          <Button variant="outline-warning" onClick={() => navigate('/orders')}>
            Volver a órdenes
          </Button>
        </Alert>
      </Container>
    );
  }

  // ✅ VALIDACIÓN DEFENSIVA: Asegurar que items existe
  const orderItems = order.items || [];
  const orderPricing = order.pricing || {};
  const orderCustomer = order.customer || {};
  const orderShipping = order.shipping || {};
  const orderPayment = order.payment || {};

  return (
    <>
      <Container className="py-5">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <Button 
                  as={Link} 
                  to="/orders" 
                  variant="outline-secondary" 
                  className="me-3"
                >
                  <FaArrowLeft className="me-1" />
                  Volver
                </Button>
                <div>
                  <h2 className="mb-1">Orden #{order.orderNumber}</h2>
                  <p className="text-muted mb-0">
                    Realizada el {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                {getStatusBadge(order.status)}
              </div>
            </div>
          </Col>
        </Row>

        <Row>
          {/* Información principal */}
          <Col lg={8}>
            {/* Productos */}
            <Card className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Productos ({orderItems.length})</h5>
                <div className="d-flex gap-2">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={handleDownloadInvoice}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-1" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <FaDownload className="me-1" />
                        Factura
                      </>
                    )}
                  </Button>
                  {(order.status === 'shipped' || order.status === 'delivered') && (
                    <Button 
                      variant="outline-info" 
                      size="sm"
                      onClick={handleViewTracking}
                    >
                      <FaEye className="me-1" />
                      Seguimiento
                    </Button>
                  )}
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                {orderItems.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">No hay productos en esta orden.</p>
                  </div>
                ) : (
                  <Table hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Producto</th>
                        <th className="text-center">Cantidad</th>
                        <th className="text-end">Precio Unit.</th>
                        <th className="text-end">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <div className="d-flex align-items-center">
                              <img 
                                src={item.product?.thumbnail || item.image || '/placeholder-product.jpg'} 
                                alt={item.product?.title || item.title}
                                width="60"
                                height="60"
                                className="rounded me-3 object-fit-cover"
                                onError={(e) => {
                                  e.target.src = '/placeholder-product.jpg';
                                }}
                              />
                              <div>
                                <h6 className="mb-1">{item.product?.title || item.title || 'Producto sin nombre'}</h6>
                                <p className="text-muted small mb-0">
                                  Código: {item.product?.code || item.productId || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="text-center">
                            <span className="fw-bold">{item.quantity || 1}</span>
                          </td>
                          <td className="text-end">
                            {formatPrice(item.price)}
                          </td>
                          <td className="text-end">
                            <strong>{formatPrice(item.subtotal || (item.price * item.quantity))}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>

            {/* Información de envío */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <FaMapMarkerAlt className="me-2" />
                  Información de Envío
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h6>Dirección de entrega</h6>
                    <p className="mb-1">{orderShipping.address || 'No especificada'}</p>
                    <p className="mb-1">
                      {orderShipping.city && orderShipping.state ? 
                        `${orderShipping.city}, ${orderShipping.state}` : 
                        'Ciudad no especificada'
                      }
                    </p>
                    <p className="mb-1">
                      CP: {orderShipping.zipCode || 'No especificado'}
                    </p>
                    <p className="mb-0">
                      {orderShipping.country || 'Argentina'}
                    </p>
                  </Col>
                  {orderShipping.instructions && (
                    <Col md={6}>
                      <h6>Instrucciones especiales</h6>
                      <p className="text-muted">{orderShipping.instructions}</p>
                    </Col>
                  )}
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Información lateral */}
          <Col lg={4}>
            {/* Resumen de pago */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Resumen de Pago</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <span>Subtotal:</span>
                  <span>{formatPrice(orderPricing.subtotal)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Impuestos:</span>
                  <span>{formatPrice(orderPricing.tax)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Envío:</span>
                  <span>
                    {orderPricing.shipping === 0 ? 
                      <Badge bg="success">Gratis</Badge> : 
                      formatPrice(orderPricing.shipping)
                    }
                  </span>
                </div>
                <hr />
                <div className="d-flex justify-content-between fw-bold fs-5">
                  <span>Total:</span>
                  <span>{formatPrice(orderPricing.total)}</span>
                </div>
              </Card.Body>
            </Card>

            {/* Información del cliente */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Cliente</h5>
              </Card.Header>
              <Card.Body>
                <p className="mb-2">
                  <strong>{orderCustomer.firstName} {orderCustomer.lastName}</strong>
                </p>
                <p className="mb-2">
                  <FaEnvelope className="me-2" />
                  {orderCustomer.email}
                </p>
                <p className="mb-0">
                  <FaPhone className="me-2" />
                  {orderCustomer.phone}
                </p>
              </Card.Body>
            </Card>

            {/* Información de pago */}
            <Card>
              <Card.Header>
                <h5 className="mb-0">Pago</h5>
              </Card.Header>
              <Card.Body>
                <p className="mb-2">
                  <strong>Método:</strong> {orderPayment.method || 'No especificado'}
                </p>
                <p className="mb-2">
                  <strong>Estado:</strong>
                  <Badge bg={orderPayment.status === 'completed' ? 'success' : 'warning'} className="ms-2">
                    {orderPayment.status === 'completed' ? 'Pagado' : 'Pendiente'}
                  </Badge>
                </p>
                {orderPayment.paidAt && (
                  <p className="small text-muted mb-0">
                    <strong>Pagado el:</strong><br />
                    {formatDate(orderPayment.paidAt)}
                  </p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Modal de seguimiento */}
      <Modal show={showTrackingModal} onHide={() => setShowTrackingModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Seguimiento de Envío</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="tracking-timeline">
            <p><strong>Número de orden:</strong> {order.orderNumber}</p>
            
            {/* Timeline de seguimiento */}
            <div className="mt-4">
              <h6>Estado del envío:</h6>
              <div className="timeline">
                <div className="timeline-item completed">
                  <div className="timeline-marker bg-success"></div>
                  <div className="timeline-content">
                    <h6>Orden confirmada</h6>
                    <p className="text-muted small">Tu orden ha sido confirmada y está siendo preparada</p>
                  </div>
                </div>
                {order.status !== 'pending' && (
                  <div className="timeline-item completed">
                    <div className="timeline-marker bg-success"></div>
                    <div className="timeline-content">
                      <h6>En preparación</h6>
                      <p className="text-muted small">Tu pedido está siendo preparado para el envío</p>
                    </div>
                  </div>
                )}
                {(order.status === 'shipped' || order.status === 'delivered') && (
                  <div className="timeline-item current">
                    <div className="timeline-marker bg-primary"></div>
                    <div className="timeline-content">
                      <h6>En tránsito</h6>
                      <p className="text-muted small">Tu pedido está en camino</p>
                    </div>
                  </div>
                )}
                {order.status === 'delivered' && (
                  <div className="timeline-item completed">
                    <div className="timeline-marker bg-success"></div>
                    <div className="timeline-content">
                      <h6>Entregado</h6>
                      <p className="text-muted small">Tu pedido ha sido entregado</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTrackingModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* CSS para el timeline */}
      <style>{`
        .timeline {
          position: relative;
          padding-left: 30px;
        }
        
        .timeline-item {
          position: relative;
          margin-bottom: 20px;
        }
        
        .timeline-marker {
          position: absolute;
          left: -30px;
          top: 5px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        
        .timeline-item:not(:last-child)::before {
          content: '';
          position: absolute;
          left: -24px;
          top: 17px;
          width: 2px;
          height: calc(100% + 5px);
          background-color: #dee2e6;
        }
        
        .timeline-item.completed .timeline-marker {
          background-color: #198754;
        }
        
        .timeline-item.current .timeline-marker {
          background-color: #0d6efd;
        }
      `}</style>
    </>
  );
};

export default OrderDetail;