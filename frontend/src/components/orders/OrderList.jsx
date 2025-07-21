// frontend/src/components/orders/OrderList.jsx - Archivo completo con actualización incremental
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
  FaTimesCircle,
  FaSync // ✅ NUEVO ÍCONO AGREGADO
} from 'react-icons/fa';
import orderService from '../../services/orderService';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // ✅ NUEVOS ESTADOS PARA ACTUALIZACIÓN INCREMENTAL
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [hasNewOrders, setHasNewOrders] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

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

  // ✅ NUEVO EFECTO PARA POLLING PERIÓDICO
  useEffect(() => {
    // Polling cada 30 segundos para detectar nuevas órdenes
    const interval = setInterval(() => {
      if (pagination.currentPage === 1 && !loading && !hasNewOrders) {
        console.log('🔄 Checking for new orders...');
        loadOrders();
      }
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [pagination.currentPage, loading, filters, hasNewOrders]);

  // ✅ FUNCIÓN MODIFICADA - loadOrders con detección de nuevas órdenes
  const loadOrders = async (isRefresh = false) => {
    try {
      setLoading(true);
      const queryParams = {
        page: pagination.currentPage,
        limit: pagination.pageSize,
        ...filters
      };

      console.log('🔍 Calling API with params:', queryParams);
      const response = await orderService.getAllOrders(queryParams);
      
      // ✅ DEBUG: Verificar estructura de la respuesta
      console.log('📦 Full API Response:', response);
      console.log('📦 Response.data:', response.data);
      
      // ✅ CORRECCIÓN: Acceso correcto a los datos
      const ordersData = response.data.data?.orders || [];
      const paginationData = response.data.data?.pagination || {};
      
      console.log('✅ Extracted orders:', ordersData);
      console.log('✅ Previous order count:', lastOrderCount);
      console.log('✅ New total orders:', paginationData.totalOrders);
      console.log('✅ Orders count:', ordersData.length);
      
      // ✅ DETECTAR NUEVAS ÓRDENES
      if (lastOrderCount > 0 && paginationData.totalOrders > lastOrderCount && !isRefresh) {
        setHasNewOrders(true);
        console.log('🆕 Nuevas órdenes detectadas!');
      }
      
      // ✅ ACTUALIZACIÓN INTELIGENTE
      if (pagination.currentPage === 1 && !isRefresh && !hasNewOrders) {
        // Si estamos en la primera página, mergeamos las nuevas órdenes
        const existingOrderIds = new Set(orders.map(order => order._id));
        const newOrders = ordersData.filter(order => !existingOrderIds.has(order._id));
        
        if (newOrders.length > 0) {
          console.log('➕ Agregando nuevas órdenes:', newOrders.length);
          setOrders(prevOrders => [...newOrders, ...prevOrders]);
        } else if (ordersData.length > 0) {
          setOrders(ordersData);
        }
      } else {
        // Para otras páginas o refresh completo, reemplazar
        setOrders(ordersData);
      }
      
      setPagination(prev => ({
        ...prev,
        totalPages: paginationData.totalPages || 1,
        totalOrders: paginationData.totalOrders || 0
      }));

      setLastOrderCount(paginationData.totalOrders || 0);

      // Actualizar URL
      const newSearchParams = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value) newSearchParams.set(key, value);
      });
      setSearchParams(newSearchParams);

      setError(null);
      
      // ✅ ACTUALIZAR TIMESTAMP
      if (isRefresh) {
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('❌ Error in loadOrders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NUEVA FUNCIÓN PARA REFRESCAR MANUALMENTE
  const handleRefresh = () => {
    setHasNewOrders(false);
    loadOrders(true); // isRefresh = true
  };

  // ✅ NUEVA FUNCIÓN DE REFRESH MANUAL COMPLETO
  const handleManualRefresh = async () => {
    try {
      setLoading(true);
      setHasNewOrders(false);
      await loadOrders(true);
      
      // Mostrar mensaje de éxito temporal
      setTimeout(() => {
        console.log('✅ Lista actualizada correctamente');
      }, 500);
    } catch (error) {
      console.error('Error al actualizar:', error);
      setError('Error al actualizar la lista');
    }
  };

  // Manejar cambios en filtros
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setHasNewOrders(false); // ✅ RESETEAR NOTIFICACIÓN AL FILTRAR
  };

  // Manejar cambio de página
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    setHasNewOrders(false); // ✅ RESETEAR NOTIFICACIÓN AL CAMBIAR PÁGINA
  };

  // Manejar ordenamiento
  const handleSort = (field) => {
    const newOrder = filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    setFilters(prev => ({ ...prev, sortBy: field, sortOrder: newOrder }));
    setHasNewOrders(false); // ✅ RESETEAR NOTIFICACIÓN AL ORDENAR
  };

  // ✅ FUNCIÓN CORREGIDA: Manejar selección de órdenes
  const handleOrderSelection = (orderId) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  // ✅ ACTUALIZADA: Manejar descarga de factura
  const handleDownloadInvoice = async (orderId, orderNumber) => {
    try {
      console.log('📄 Downloading invoice for order:', orderNumber);
      
      await orderService.downloadInvoice(orderId);
      
      // Mostrar mensaje de éxito
      alert(`✅ Factura descargada exitosamente para la orden ${orderNumber}`);
      
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert(`❌ Error al descargar la factura: ${error.message}`);
    }
  };

  // ✅ CORREGIDA: Manejar selección de todas las órdenes
  const handleSelectAll = () => {
    if (selectedOrders.size === orders.length && orders.length > 0) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map(order => order._id)));
    }
  };

  // ✅ ACTUALIZADA: Manejar acciones en lote
  const handleBulkAction = async () => {
    try {
      const orderIds = Array.from(selectedOrders);
      console.log(`Executing ${bulkAction} for orders:`, orderIds);
      
      switch (bulkAction) {
        case 'download':
          await orderService.downloadOrdersReport(orderIds);
          alert(`✅ Descargadas ${orderIds.length} facturas exitosamente`);
          break;
        case 'export':
          // TODO: Implementar exportación a Excel si es necesario
          alert(`📊 Exportando ${orderIds.length} órdenes a Excel...`);
          // await orderService.exportOrders(orderIds);
          break;
        default:
          break;
      }
      
      setShowBulkModal(false);
      setSelectedOrders(new Set());
    } catch (error) {
      console.error('Error en acción en lote:', error);
      alert(`❌ Error al ejecutar la acción: ${error.message}`);
    }
  };

  // Obtener estado del badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', text: 'Pendiente' },
      confirmed: { variant: 'info', text: 'Confirmado' },
      processing: { variant: 'primary', text: 'Procesando' },
      shipped: { variant: 'info', text: 'Enviado' },
      delivered: { variant: 'success', text: 'Entregado' },
      cancelled: { variant: 'danger', text: 'Cancelado' }
    };
    return statusConfig[status] || statusConfig.pending;
  };

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  // Formatear fecha
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener ícono de ordenamiento
  const getSortIcon = (field) => {
    if (filters.sortBy !== field) return <FaSort className="ms-1" />;
    return filters.sortOrder === 'asc' ? <FaSortUp className="ms-1" /> : <FaSortDown className="ms-1" />;
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
                {/* ✅ INDICADOR DE ÚLTIMA ACTUALIZACIÓN MEJORADO */}
                <p className="text-muted mb-0">
                  {pagination.totalOrders} órden{pagination.totalOrders !== 1 ? 'es' : ''} encontrada{pagination.totalOrders !== 1 ? 's' : ''}
                  <small className="ms-2">
                    (Última actualización: {lastUpdated.toLocaleTimeString()})
                  </small>
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
                
                {/* ✅ BOTÓN DE ACTUALIZACIÓN MANUAL */}
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={handleManualRefresh}
                  disabled={loading}
                  title="Actualizar lista de órdenes"
                >
                  <FaSync className={`me-1 ${loading ? 'fa-spin' : ''}`} />
                  Actualizar
                </Button>
                
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

        {/* ✅ NOTIFICACIÓN DE NUEVAS ÓRDENES */}
        {hasNewOrders && (
          <Alert variant="info" className="mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <span>
                <FaClock className="me-2" />
                Hay nuevas órdenes disponibles
              </span>
              <Button variant="outline-info" size="sm" onClick={handleRefresh}>
                Ver nuevas órdenes
              </Button>
            </div>
          </Alert>
        )}

        {/* Filtros */}
        <Card className="mb-4">
          <Card.Body>
            <Row>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Buscar</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Número de orden o email..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                    <Button variant="outline-secondary">
                      <FaSearch />
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
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
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Fecha desde</Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Fecha hasta</Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Error */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            <strong>Error:</strong> {error}
          </Alert>
        )}

        {/* Tabla de órdenes */}
        <Card>
          <Card.Body className="p-0">
            {orders.length === 0 && !loading ? (
              <div className="text-center py-5">
                <FaShoppingCart size={64} className="text-muted mb-3" />
                <h4>No hay órdenes</h4>
                <p className="text-muted">Aún no has realizado ninguna compra.</p>
                <Button variant="primary" as={Link} to="/shop">
                  Ir a la tienda
                </Button>
              </div>
            ) : (
              <>
                <Table responsive className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>
                        <Form.Check
                          type="checkbox"
                          checked={selectedOrders.size === orders.length && orders.length > 0}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th 
                        className="cursor-pointer"
                        onClick={() => handleSort('orderNumber')}
                      >
                        Número de Orden {getSortIcon('orderNumber')}
                      </th>
                      <th 
                        className="cursor-pointer"
                        onClick={() => handleSort('createdAt')}
                      >
                        Fecha {getSortIcon('createdAt')}
                      </th>
                      <th>Estado</th>
                      <th>Items</th>
                      <th 
                        className="cursor-pointer"
                        onClick={() => handleSort('pricing.total')}
                      >
                        Total {getSortIcon('pricing.total')}
                      </th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={selectedOrders.has(order._id)}
                            onChange={() => handleOrderSelection(order._id)}
                          />
                        </td>
                        <td>
                          <strong>{order.orderNumber}</strong>
                        </td>
                        <td>
                          <small className="text-muted">
                            {formatDate(order.createdAt)}
                          </small>
                        </td>
                        <td>
                          <Badge bg={getStatusBadge(order.status).variant}>
                            {getStatusBadge(order.status).text}
                          </Badge>
                        </td>
                        <td>
                          <small>
                            {order.items?.length || 0} producto{(order.items?.length || 0) !== 1 ? 's' : ''}
                          </small>
                        </td>
                        <td>
                          <strong>{formatPrice(order.pricing?.total || 0)}</strong>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            {/* ✅ BOTÓN VER - Corregido con order._id y title */}
                            <Button
                              variant="outline-primary"
                              size="sm"
                              as={Link}
                              to={`/orders/${order._id}`}
                              title="Ver detalles de la orden"
                            >
                              <FaEye />
                            </Button>
                            
                            {/* ✅ BOTÓN DESCARGAR - Con función implementada */}
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleDownloadInvoice(order._id, order.orderNumber)}
                              title="Descargar factura"
                            >
                              <FaDownload />
                            </Button>
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
    </>
  );
};

export default OrderList;