// frontend/src/components/orders/OrderDetail.jsx
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
        setOrder(response.data);
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

  // Función para obtener el variant del badge según el estado
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

  // Función para formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para descargar factura
  const handleDownloadInvoice = () => {
    // Aquí implementarías la descarga de la factura
    console.log('Descargando factura...');
  };

  // Función para ver seguimiento
  const handleViewTracking = () => {
    setShowTrackingModal(true);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-2">Cargando detalles de la orden...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h5>Error al cargar la orden</h5>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => navigate('/orders')}>
            Volver a órdenes
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <h5>Orden no encontrada</h5>
          <p>La orden que buscas no existe o no tienes permisos para verla.</p>
          <Button variant="outline-warning" onClick={() => navigate('/orders')}>
            Volver a órdenes
          </Button>
        </Alert>
      </Container>
    );
  }

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
                <h5 className="mb-0">Productos ({order.items.length})</h5>
                <div className="d-flex gap-2">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={handleDownloadInvoice}
                  >
                    <FaDownload className="me-1" />
                    Factura
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
                    {order.items.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img 
                              src={item.product?.thumbnail || '/placeholder-product.jpg'} 
                              alt={item.product?.title}
                              width="60"
                              height="60"
                              className="rounded me-3 object-fit-cover"
                            />
                            <div>
                              <h6 className="mb-1">{item.product?.title}</h6>
                              <p className="text-muted small mb-0">
                                Código: {item.product?.code}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="text-center align-middle">
                          <Badge bg="light" text="dark">{item.quantity}</Badge>
                        </td>
                        <td className="text-end align-middle">
                          {formatPrice(item.price)}
                        </td>
                        <td className="text-end align-middle">
                          <strong>{formatPrice(item.subtotal)}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
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
                    <p className="mb-2">
                      <strong>{order.shipping?.address?.name}</strong>
                    </p>
                    <p className="text-muted">
                      {order.shipping?.address?.street}<br />
                      {order.shipping?.address?.city}, {order.shipping?.address?.state}<br />
                      CP: {order.shipping?.address?.zipCode}
                    </p>
                  </Col>
                  <Col md={6}>
                    <h6>Método de envío</h6>
                    <p className="mb-2">{order.shipping?.method}</p>
                    <p className="text-muted">
                      Costo: {order.shipping?.cost === 0 ? 'Gratis' : formatPrice(order.shipping.cost)}
                    </p>
                    {order.tracking?.number && (
                      <p className="small">
                        <strong>Número de seguimiento:</strong><br />
                        <code>{order.tracking.number}</code>
                      </p>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            {/* Resumen del pedido */}
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">Resumen del Pedido</h6>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>{formatPrice(order.summary?.subtotal || 0)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>IVA (21%):</span>
                  <span>{formatPrice(order.summary?.tax || 0)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Envío:</span>
                  <span>
                    {order.summary?.shipping === 0 ? 
                      <span className="text-success">Gratis</span> : 
                      formatPrice(order.summary?.shipping || 0)
                    }
                  </span>
                </div>
                {order.summary?.discount > 0 && (
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>Descuento:</span>
                    <span>-{formatPrice(order.summary.discount)}</span>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between">
                  <strong>Total:</strong>
                  <strong className="text-primary fs-5">
                    {formatPrice(order.total)}
                  </strong>
                </div>
              </Card.Body>
            </Card>

            {/* Información de contacto */}
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">Información de Contacto</h6>
              </Card.Header>
              <Card.Body>
                <div className="d-flex align-items-center mb-2">
                  <FaEnvelope className="me-2 text-muted" />
                  <span>{order.customer?.email}</span>
                </div>
                {order.customer?.phone && (
                  <div className="d-flex align-items-center">
                    <FaPhone className="me-2 text-muted" />
                    <span>{order.customer.phone}</span>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Información de pago */}
            <Card>
              <Card.Header>
                <h6 className="mb-0">Información de Pago</h6>
              </Card.Header>
              <Card.Body>
                <p className="mb-2">
                  <strong>Método:</strong> {order.payment?.method}
                </p>
                <p className="mb-2">
                  <strong>Estado:</strong>{' '}
                  <Badge bg={order.payment?.status === 'paid' ? 'success' : 'warning'}>
                    {order.payment?.status === 'paid' ? 'Pagado' : 'Pendiente'}
                  </Badge>
                </p>
                {order.payment?.transactionId && (
                  <p className="small text-muted">
                    <strong>ID Transacción:</strong><br />
                    <code>{order.payment.transactionId}</code>
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
            <p><strong>Número de seguimiento:</strong> {order.tracking?.number}</p>
            <p><strong>Transportista:</strong> {order.tracking?.carrier}</p>
            
            {/* Timeline de seguimiento */}
            <div className="mt-4">
              <h6>Estado del envío:</h6>
              <div className="timeline">
                <div className="timeline-item completed">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h6>Orden confirmada</h6>
                    <p className="text-muted small">Tu orden ha sido confirmada y está siendo preparada</p>
                  </div>
                </div>
                <div className="timeline-item completed">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h6>En preparación</h6>
                    <p className="text-muted small">Tu pedido está siendo preparado para el envío</p>
                  </div>
                </div>
                <div className="timeline-item current">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h6>En tránsito</h6>
                    <p className="text-muted small">Tu pedido está en camino</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h6>Entregado</h6>
                    <p className="text-muted small">Tu pedido ha sido entregado</p>
                  </div>
                </div>
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

      <style jsx>{`
        .timeline {
          position: relative;
          padding-left: 2rem;
        }
        
        .timeline::before {
          content: '';
          position: absolute;
          left: 1rem;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #dee2e6;
        }
        
        .timeline-item {
          position: relative;
          margin-bottom: 2rem;
        }
        
        .timeline-marker {
          position: absolute;
          left: -2rem;
          top: 0;
          width: 1rem;
          height: 1rem;
          border-radius: 50%;
          border: 2px solid #dee2e6;
          background: white;
        }
        
        .timeline-item.completed .timeline-marker {
          background: #198754;
          border-color: #198754;
        }
        
        .timeline-item.current .timeline-marker {
          background: #0d6efd;
          border-color: #0d6efd;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(13, 110, 253, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(13, 110, 253, 0);
          }
        }
      `}</style>
    </>
  );
};

export default OrderDetail;