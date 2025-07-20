// frontend/src/components/tickets/TicketList.jsx
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
  FaPlus, 
  FaEye, 
  FaSearch, 
  FaFilter, 
  FaSort,
  FaSortUp,
  FaSortDown,
  FaComment,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
  FaCalendarAlt,
  FaUser,
  FaTag,
  FaDownload,
  FaRefresh
} from 'react-icons/fa';
import ticketService from '../../services/ticketService';

const TicketList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Estados principales
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Estados de filtros y paginación
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    priority: searchParams.get('priority') || '',
    category: searchParams.get('category') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });

  const [pagination, setPagination] = useState({
    currentPage: parseInt(searchParams.get('page')) || 1,
    pageSize: 10,
    totalPages: 1,
    totalTickets: 0
  });

  // Estados adicionales
  const [selectedTickets, setSelectedTickets] = useState(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    closed: 0,
    highPriority: 0
  });

  // Cargar tickets
  useEffect(() => {
    loadTickets();
  }, [filters, pagination.currentPage]);

  // Actualizar URL
  useEffect(() => {
    updateURLParams();
  }, [filters, pagination.currentPage]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const queryParams = {
        page: pagination.currentPage,
        limit: pagination.pageSize,
        ...filters
      };

      const response = await ticketService.getAllTickets(queryParams);
      
      setTickets(response.data.tickets || []);
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.totalPages || 1,
        totalTickets: response.data.totalTickets || 0
      }));

      // Actualizar estadísticas
      if (response.data.stats) {
        setStats(response.data.stats);
      } else {
        calculateStats(response.data.tickets || []);
      }

      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas localmente
  const calculateStats = (ticketList) => {
    const stats = {
      total: ticketList.length,
      open: ticketList.filter(t => t.status === 'open').length,
      inProgress: ticketList.filter(t => t.status === 'in_progress').length,
      closed: ticketList.filter(t => t.status === 'closed').length,
      highPriority: ticketList.filter(t => t.priority === 'high').length
    };
    setStats(stats);
  };

  // Actualizar parámetros URL
  const updateURLParams = () => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value);
      }
    });

    if (pagination.currentPage > 1) {
      params.set('page', pagination.currentPage.toString());
    }

    setSearchParams(params);
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

  // Obtener configuración de estado
  const getStatusConfig = (status) => {
    const configs = {
      open: { variant: 'warning', icon: FaClock, text: 'Abierto' },
      in_progress: { variant: 'primary', icon: FaComment, text: 'En Progreso' },
      closed: { variant: 'success', icon: FaCheckCircle, text: 'Cerrado' },
      cancelled: { variant: 'danger', icon: FaTimes, text: 'Cancelado' }
    };
    return configs[status] || configs.open;
  };

  // Obtener configuración de prioridad
  const getPriorityConfig = (priority) => {
    const configs = {
      low: { variant: 'secondary', text: 'Baja' },
      medium: { variant: 'info', text: 'Media' },
      high: { variant: 'warning', text: 'Alta' },
      urgent: { variant: 'danger', text: 'Urgente' }
    };
    return configs[priority] || configs.low;
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Manejar selección múltiple
  const handleSelectTicket = (ticketId) => {
    const newSelected = new Set(selectedTickets);
    if (newSelected.has(ticketId)) {
      newSelected.delete(ticketId);
    } else {
      newSelected.add(ticketId);
    }
    setSelectedTickets(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTickets.size === tickets.length) {
      setSelectedTickets(new Set());
    } else {
      setSelectedTickets(new Set(tickets.map(ticket => ticket.id)));
    }
  };

  // Acciones en lote
  const handleBulkAction = async () => {
    try {
      const ticketIds = Array.from(selectedTickets);
      
      switch (bulkAction) {
        case 'close':
          await ticketService.bulkUpdateStatus(ticketIds, 'closed');
          break;
        case 'export':
          await ticketService.exportTickets(ticketIds);
          break;
        default:
          break;
      }
      
      setSelectedTickets(new Set());
      setShowBulkModal(false);
      loadTickets();
    } catch (err) {
      console.error('Error en acción en lote:', err);
    }
  };

  // Refrescar tickets
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTickets();
    setRefreshing(false);
  };

  // Renderizar icono de ordenamiento
  const renderSortIcon = (field) => {
    if (filters.sortBy !== field) return <FaSort className="text-muted" />;
    return filters.sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  if (loading && tickets.length === 0) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando tickets...</span>
        </Spinner>
        <p className="mt-2">Cargando tickets...</p>
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
                <h2 className="mb-1">🎫 Mis Tickets de Soporte</h2>
                <p className="text-muted mb-0">
                  {pagination.totalTickets} ticket{pagination.totalTickets !== 1 ? 's' : ''} encontrado{pagination.totalTickets !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <FaRefresh className={refreshing ? 'fa-spin' : ''} />
                </Button>
                {selectedTickets.size > 0 && (
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-primary" size="sm">
                      Acciones ({selectedTickets.size})
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item 
                        onClick={() => {
                          setBulkAction('close');
                          setShowBulkModal(true);
                        }}
                      >
                        <FaCheckCircle className="me-2" />
                        Cerrar seleccionados
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={() => {
                          setBulkAction('export');
                          setShowBulkModal(true);
                        }}
                      >
                        <FaDownload className="me-2" />
                        Exportar seleccionados
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                )}
                <Button 
                  variant="primary" 
                  as={Link} 
                  to="/tickets/new"
                  size="sm"
                >
                  <FaPlus className="me-1" />
                  Nuevo Ticket
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        {/* Estadísticas */}
        <Row className="mb-4">
          <Col md={2}>
            <Card className="text-center border-primary">
              <Card.Body>
                <h5 className="text-primary">{stats.total}</h5>
                <small className="text-muted">Total</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center border-warning">
              <Card.Body>
                <h5 className="text-warning">{stats.open}</h5>
                <small className="text-muted">Abiertos</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center border-info">
              <Card.Body>
                <h5 className="text-info">{stats.inProgress}</h5>
                <small className="text-muted">En Progreso</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center border-success">
              <Card.Body>
                <h5 className="text-success">{stats.closed}</h5>
                <small className="text-muted">Cerrados</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center border-danger">
              <Card.Body>
                <h5 className="text-danger">{stats.highPriority}</h5>
                <small className="text-muted">Alta Prioridad</small>
              </Card.Body>
            </Card>
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
                    placeholder="Buscar tickets..."
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
                  <option value="open">Abierto</option>
                  <option value="in_progress">En Progreso</option>
                  <option value="closed">Cerrado</option>
                  <option value="cancelled">Cancelado</option>
                </Form.Select>
              </Col>

              <Col md={2}>
                <Form.Select 
                  size="sm"
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                >
                  <option value="">Todas las prioridades</option>
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </Form.Select>
              </Col>

              <Col md={2}>
                <Form.Control
                  type="date"
                  size="sm"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
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
                      priority: '',
                      category: '',
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
            <h6>Error al cargar los tickets</h6>
            <p className="mb-0">{error}</p>
          </Alert>
        )}

        {/* Tabla de tickets */}
        <Card>
          <Card.Body className="p-0">
            {tickets.length === 0 ? (
              <div className="text-center py-5">
                <FaTag size={48} className="text-muted mb-3" />
                <h5>No hay tickets</h5>
                <p className="text-muted">
                  {filters.search || filters.status ? 
                    'No se encontraron tickets con los filtros aplicados.' :
                    'Aún no has creado ningún ticket de soporte.'
                  }
                </p>
                <Button variant="primary" as={Link} to="/tickets/new">
                  Crear primer ticket
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
                          checked={selectedTickets.size === tickets.length && tickets.length > 0}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th 
                        className="cursor-pointer user-select-none"
                        onClick={() => handleSort('ticketNumber')}
                      >
                        # Ticket {renderSortIcon('ticketNumber')}
                      </th>
                      <th 
                        className="cursor-pointer user-select-none"
                        onClick={() => handleSort('subject')}
                      >
                        Asunto {renderSortIcon('subject')}
                      </th>
                      <th>Estado</th>
                      <th>Prioridad</th>
                      <th>Categoría</th>
                      <th 
                        className="cursor-pointer user-select-none"
                        onClick={() => handleSort('createdAt')}
                      >
                        Fecha {renderSortIcon('createdAt')}
                      </th>
                      <th 
                        className="cursor-pointer user-select-none"
                        onClick={() => handleSort('updatedAt')}
                      >
                        Última Act. {renderSortIcon('updatedAt')}
                      </th>
                      <th width="120" className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => {
                      const statusConfig = getStatusConfig(ticket.status);
                      const priorityConfig = getPriorityConfig(ticket.priority);
                      const StatusIcon = statusConfig.icon;

                      return (
                        <tr key={ticket.id}>
                          <td>
                            <Form.Check
                              type="checkbox"
                              checked={selectedTickets.has(ticket.id)}
                              onChange={() => handleSelectTicket(ticket.id)}
                            />
                          </td>
                          <td>
                            <div>
                              <strong>#{ticket.ticketNumber}</strong>
                              {ticket.hasNewMessages && (
                                <Badge bg="danger" className="ms-2">Nuevo</Badge>
                              )}
                            </div>
                          </td>
                          <td>
                            <div>
                              <Link 
                                to={`/tickets/${ticket.id}`}
                                className="text-decoration-none fw-bold"
                              >
                                {ticket.subject}
                              </Link>
                              <div className="small text-muted">
                                {ticket.description?.substring(0, 50)}...
                              </div>
                            </div>
                          </td>
                          <td>
                            <Badge bg={statusConfig.variant} className="d-flex align-items-center gap-1">
                              <StatusIcon size={12} />
                              {statusConfig.text}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg={priorityConfig.variant}>
                              {priorityConfig.text}
                            </Badge>
                          </td>
                          <td>
                            <span className="text-muted">{ticket.category}</span>
                          </td>
                          <td>
                            <div>
                              <div>{formatDate(ticket.createdAt)}</div>
                              <small className="text-muted">
                                <FaUser className="me-1" />
                                {ticket.user?.name || ticket.user?.email}
                              </small>
                            </div>
                          </td>
                          <td>
                            <div>{formatDate(ticket.updatedAt)}</div>
                            {ticket.lastMessage && (
                              <small className="text-muted">
                                por {ticket.lastMessage.author}
                              </small>
                            )}
                          </td>
                          <td className="text-center">
                            <div className="d-flex gap-1 justify-content-center">
                              <Button
                                as={Link}
                                to={`/tickets/${ticket.id}`}
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
                                  <Dropdown.Item as={Link} to={`/tickets/${ticket.id}`}>
                                    <FaEye className="me-2" />
                                    Ver detalles
                                  </Dropdown.Item>
                                  {ticket.status !== 'closed' && (
                                    <Dropdown.Item onClick={() => {/* Cerrar ticket */}}>
                                      <FaCheckCircle className="me-2" />
                                      Cerrar ticket
                                    </Dropdown.Item>
                                  )}
                                </Dropdown.Menu>
                              </Dropdown>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>

                {/* Paginación */}
                {pagination.totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center p-3 border-top">
                    <div className="text-muted">
                      Mostrando {((pagination.currentPage - 1) * pagination.pageSize) + 1} a{' '}
                      {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalTickets)} de{' '}
                      {pagination.totalTickets} tickets
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
      </Container>

      {/* Modal de acciones en lote */}
      <Modal show={showBulkModal} onHide={() => setShowBulkModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Acción</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Estás seguro que deseas{' '}
            {bulkAction === 'close' ? 'cerrar' : 'exportar'}{' '}
            {selectedTickets.size} ticket{selectedTickets.size !== 1 ? 's' : ''}?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBulkModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleBulkAction}>
            {bulkAction === 'close' ? 'Cerrar' : 'Exportar'}
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
      `}</style>
    </>
  );
};

export default TicketList;