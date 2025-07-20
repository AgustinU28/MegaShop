// frontend/src/components/orders/OrderList.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Badge, 
  Button, 
  Form, 
  InputGroup,
  Pagination,
  Alert,
  Spinner,
  Dropdown,
  Modal
} from 'react-bootstrap';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FaEye, 
  FaSearch, 
  FaFilter, 
  FaDownload,
  FaShoppingCart,
  FaCalendarAlt,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaTrash,
  FaCheckCircle,
  FaClock,
  FaShippingFast,
  FaTimesCircle
} from 'react-icons/fa';
import orderService from '../../services/orderService';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Estados para filtros y paginación
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });

  const [pagination, setPagination] = useState({
    currentPage: parseInt(searchParams.get('page')) || 1,
    pageSize: 10,
    totalPages: 1,
    totalOrders: 0
  });

  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState('');

  // Cargar órdenes
  useEffect(() => {
    loadOrders();
  }, [filters, pagination.currentPage]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const queryParams = {
        page: pagination.currentPage,
        limit: pagination.pageSize,
        ...filters
      };

      const response = await orderService.getAllOrders(queryParams);
      
      setOrders(response.data.orders || []);
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.totalPages || 1,
        totalOrders: response.data.totalOrders || 0
      }));

      // Actualizar URL
      const newSearchParams = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value) newSearchParams.set(key, value);
      });
      setSearchParams(newSearchParams);

    } catch (err) {
      setError(err.message);
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en filtros
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Manejar cambio de página
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  // Manejar ordenamiento
  const handleSort = (field) => {
    const newOrder = filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    setFilters(prev => ({ ...prev, sortBy: field, sortOrder: newOrder }));
  };

  // Función para obtener el badge del estado
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
      month: 'short',
      day: 'numeric'
    });
  };

  // Manejar selección múltiple
  const handleSelectOrder = (orderId) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map(order => order.id)));
    }
  };

  // Acciones en lote
  const handleBulkAction = async () => {
    try {
      const orderIds = Array.from(selectedOrders);
      
      switch (bulkAction) {
        case 'download':
          await orderService.downloadOrdersReport(orderIds);
          break;
        case 'export':
          await orderService.exportOrders(orderIds);
          break;
        default:
          break;
      }
      
      setSelectedOrders(new Set());
      setShowBulkModal(false);
    } catch (err) {
      console.error('Error en acción en lote:', err);
    }
  };

  // Renderizar icono de ordenamiento
  const renderSortIcon = (field) => {
    if (filters.sortBy !== field) return <FaSort className="text-muted" />;
    return filters.sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  if (loading && orders.length === 0) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando órdenes...</span>
        </Spinner>
        <p className="mt-2">Cargando órdenes...</p>
      </Container>
    );
  }

  return (
    <>
      <Container className="py-5">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-1">📦 Mis Órdenes</h2>
                <p className="text-muted mb-0">
                  {pagination.totalOrders} órden{pagination.totalOrders !== 1 ? 'es' : ''} encontrada{pagination.totalOrders !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="d-flex gap-2">
                {selectedOrders.size > 0 && (
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-primary" size="sm">
                      Acciones ({selectedOrders.size})
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item 
                        onClick={() => {
                          setBulkAction('download');
                          setShowBulkModal(true);
                        }}
                      >
                        <FaDownload className="me-2" />
                        Descargar facturas
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={() => {
                          setBulkAction('export');
                          setShowBulkModal(true);
                        }}
                      >
                        <FaDownload className="me-2" />
                        Exportar a Excel
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                )}
                <Button 
                  variant="primary" 
                  as={Link} 
                  to="/shop"
                  size="sm"
                >
                  <FaShoppingCart className="me-1" />
                  Nueva Compra
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        {/* Filtros */}
        <Card className="mb-4">
          <Card.Body>
            <Row className="g-3">
              <Col md={4}>
                <InputGroup size="sm">
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Buscar por número de orden..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </InputGroup>
              </Col>
              
              <Col md={2}>
                <Form.Select 
                  size="sm"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">Todos los estados</option>
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="processing">Procesando</option>
                  <option value="shipped">Enviado</option>
                  <option value="delivered">Entregado</option>
                  <option value="cancelled">Cancelado</option>
                </Form.Select>
              </Col>

              <Col md={2}>
                <Form.Control
                  type="date"
                  size="sm"
                  placeholder="Desde"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </Col>

              <Col md={2}>
                <Form.Control
                  type="date"
                  size="sm"
                  placeholder="Hasta"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </Col>

              <Col md={2}>
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  className="w-100"
                  onClick={() => {
                    setFilters({
                      search: '',
                      status: '',
                      dateFrom: '',
                      dateTo: '',
                      sortBy: 'createdAt',
                      sortOrder: 'desc'
                    });
                  }}
                >
                  <FaFilter className="me-1" />
                  Limpiar
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Error */}
        {error && (
          <Alert variant="danger" className="mb-4">
            <h6>Error al cargar las órdenes</h6>
            <p className="mb-0">{error}</p>
          </Alert>
        )}

        {/* Tabla de órdenes */}
        <Card>
          <Card.Body className="p-0">
            {orders.length === 0 ? (
              <div className="text-center py-5">
                <FaShoppingCart size={48} className="text-muted mb-3" />
                <h5>No hay órdenes</h5>
                <p className="text-muted">
                  {filters.search || filters.status ? 
                    'No se encontraron órdenes con los filtros aplicados.' :
                    'Aún no has realizado ninguna compra.'
                  }
                </p>
                <Button variant="primary" as={Link} to="/shop">
                  Ir a la tienda
                </Button>
              </div>
            ) : (
              <>
                <Table responsive hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th width="40">
                        <Form.Check
                          type="checkbox"
                          checked={selectedOrders.size === orders.length && orders.length > 0}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th 
                        className="cursor-pointer user-select-none"
                        onClick={() => handleSort('orderNumber')}
                      >
                        Orden {renderSortIcon('orderNumber')}
                      </th>
                      <th 
                        className="cursor-pointer user-select-none"
                        onClick={() => handleSort('createdAt')}
                      >
                        Fecha {renderSortIcon('createdAt')}
                      </th>
                      <th>Estado</th>
                      <th>Productos</th>
                      <th 
                        className="cursor-pointer user-select-none text-end"
                        onClick={() => handleSort('total')}
                      >
                        Total {renderSortIcon('total')}
                      </th>
                      <th width="120" className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={selectedOrders.has(order.id)}
                            onChange={() => handleSelectOrder(order.id)}
                          />
                        </td>
                        <td>
                          <div>
                            <strong>#{order.orderNumber}</strong>
                            {order.isUrgent && (
                              <Badge bg="warning" className="ms-2">Urgente</Badge>
                            )}
                          </div>
                        </td>
                        <td>
                          <div>
                            <div>{formatDate(order.createdAt)}</div>
                            <small className="text-muted">
                              {new Date(order.createdAt).toLocaleTimeString('es-AR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </small>
                          </div>
                        </td>
                        <td>
                          {getStatusBadge(order.status)}
                        </td>
                        <td>
                          <div>
                            <span>{order.items?.length || 0} producto{(order.items?.length || 0) !== 1 ? 's' : ''}</span>
                            {order.items && order.items.length > 0 && (
                              <div className="d-flex mt-1">
                                {order.items.slice(0, 3).map((item, index) => (
                                  <img
                                    key={index}
                                    src={item.product?.thumbnail || '/placeholder-product.jpg'}
                                    alt={item.product?.title}
                                    width="24"
                                    height="24"
                                    className="rounded me-1 border"
                                    style={{ objectFit: 'cover' }}
                                  />
                                ))}
                                {order.items.length > 3 && (
                                  <div 
                                    className="d-flex align-items-center justify-content-center bg-light border rounded"
                                    style={{ width: '24px', height: '24px', fontSize: '10px' }}
                                  >
                                    +{order.items.length - 3}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="text-end">
                          <strong>{formatPrice(order.total)}</strong>
                          {order.payment?.method && (
                            <div>
                              <small className="text-muted">{order.payment.method}</small>
                            </div>
                          )}
                        </td>
                        <td className="text-center">
                          <div className="d-flex gap-1 justify-content-center">
                            <Button
                              as={Link}
                              to={`/orders/${order.id}`}
                              variant="outline-primary"
                              size="sm"
                              title="Ver detalles"
                            >
                              <FaEye />
                            </Button>
                            <Dropdown>
                              <Dropdown.Toggle
                                variant="outline-secondary"
                                size="sm"
                                className="no-caret"
                              >
                                ⋮
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item as={Link} to={`/orders/${order.id}`}>
                                  <FaEye className="me-2" />
                                  Ver detalles
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => {/* Download invoice */}}>
                                  <FaDownload className="me-2" />
                                  Descargar factura
                                </Dropdown.Item>
                                {order.status === 'pending' && (
                                  <>
                                    <Dropdown.Divider />
                                    <Dropdown.Item className="text-danger">
                                      <FaTrash className="me-2" />
                                      Cancelar orden
                                    </Dropdown.Item>
                                  </>
                                )}
                              </Dropdown.Menu>
                            </Dropdown>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                {/* Paginación */}
                {pagination.totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center p-3 border-top">
                    <div className="text-muted">
                      Mostrando {((pagination.currentPage - 1) * pagination.pageSize) + 1} a{' '}
                      {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalOrders)} de{' '}
                      {pagination.totalOrders} órdenes
                    </div>
                    
                    <Pagination size="sm" className="mb-0">
                      <Pagination.First 
                        disabled={pagination.currentPage === 1}
                        onClick={() => handlePageChange(1)}
                      />
                      <Pagination.Prev 
                        disabled={pagination.currentPage === 1}
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                      />
                      
                      {[...Array(pagination.totalPages)].map((_, index) => {
                        const page = index + 1;
                        const showPage = (
                          page === 1 ||
                          page === pagination.totalPages ||
                          (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
                        );
                        
                        if (!showPage) {
                          if (page === pagination.currentPage - 2 || page === pagination.currentPage + 2) {
                            return <Pagination.Ellipsis key={page} />;
                          }
                          return null;
                        }
                        
                        return (
                          <Pagination.Item
                            key={page}
                            active={page === pagination.currentPage}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Pagination.Item>
                        );
                      })}
                      
                      <Pagination.Next 
                        disabled={pagination.currentPage === pagination.totalPages}
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                      />
                      <Pagination.Last 
                        disabled={pagination.currentPage === pagination.totalPages}
                        onClick={() => handlePageChange(pagination.totalPages)}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </Card.Body>
        </Card>

        {/* Loading overlay para actualizaciones */}
        {loading && orders.length > 0 && (
          <div className="position-fixed top-50 start-50 translate-middle bg-white p-3 rounded shadow">
            <div className="d-flex align-items-center">
              <Spinner animation="border" size="sm" className="me-2" />
              <span>Actualizando...</span>
            </div>
          </div>
        )}
      </Container>

      {/* Modal de acciones en lote */}
      <Modal show={showBulkModal} onHide={() => setShowBulkModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Acción</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Estás seguro que deseas{' '}
            {bulkAction === 'download' ? 'descargar las facturas' : 'exportar'} de{' '}
            {selectedOrders.size} órden{selectedOrders.size !== 1 ? 'es' : ''}?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBulkModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleBulkAction}>
            {bulkAction === 'download' ? 'Descargar' : 'Exportar'}
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .cursor-pointer {
          cursor: pointer;
        }
        
        .no-caret::after {
          display: none;
        }
        
        th.cursor-pointer:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
        
        .table th {
          border-bottom: 2px solid #dee2e6;
          font-weight: 600;
          background-color: #f8f9fa !important;
        }
        
        .table td {
          vertical-align: middle;
        }
        
        .badge {
          font-size: 0.75em;
        }
        
        .position-fixed {
          z-index: 1050;
        }
      `}</style>
    </>
  );
};

export default OrderList;