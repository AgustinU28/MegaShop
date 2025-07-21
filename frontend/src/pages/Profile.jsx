// frontend/src/pages/Profile.jsx - CON DATOS REALES DE LA BASE DE DATOS
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
  Nav,
  Tab
} from 'react-bootstrap';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaLock,
  FaEdit,
  FaSave,
  FaTimes,
  FaShoppingBag,
  FaCog,
  FaEye
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
// ✅ IMPORTAR EL SERVICIO DE ÓRDENES
import orderService from '../services/orderService';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Estados para el formulario de perfil
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // Estados para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // ✅ ESTADO PARA ÓRDENES REALES
  const [recentOrders, setRecentOrders] = useState([]);
  const [ordersError, setOrdersError] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
    
    // ✅ CARGAR ÓRDENES REALES AL CARGAR EL COMPONENTE
    loadUserOrders();
  }, [user]);

  // ✅ FUNCIÓN PARA CARGAR ÓRDENES REALES
  const loadUserOrders = async () => {
    try {
      setOrdersLoading(true);
      setOrdersError(null);
      
      // Obtener las últimas 5 órdenes del usuario
      const response = await orderService.getAllOrders({
        page: 1,
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      console.log('📦 Orders Response:', response);

      // ✅ ACCESO CORRECTO A LOS DATOS
      if (response.success && response.data?.data?.orders) {
        setRecentOrders(response.data.data.orders);
      } else {
        setRecentOrders([]);
        console.warn('⚠️ No orders found in response');
      }
      
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      setOrdersError(error.message);
      setRecentOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Simular llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Si tienes authService configurado, usa esto:
      // const response = await authService.updateProfile(profileData);
      // if (response.success) {
      //   updateUser(response.user);
      //   setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
      //   setIsEditing(false);
      // }
      
      // Por ahora simulamos éxito
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
      setIsEditing(false);
      
    } catch (error) {
      setMessage({ type: 'danger', text: 'Error al actualizar perfil' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validaciones
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'danger', text: 'Las contraseñas no coinciden' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'danger', text: 'La nueva contraseña debe tener al menos 6 caracteres' });
      setLoading(false);
      return;
    }

    try {
      // Simular llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Contraseña cambiada correctamente' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setMessage({ type: 'danger', text: 'Error al cambiar contraseña' });
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  };

  // ✅ FUNCIÓN MEJORADA PARA OBTENER BADGE DE ESTADO
  const getStatusBadge = (status) => {
    const statusClasses = {
      'pending': 'bg-warning text-dark',
      'confirmed': 'bg-info',
      'processing': 'bg-primary',
      'shipped': 'bg-warning text-dark',
      'delivered': 'bg-success',
      'cancelled': 'bg-danger'
    };
    
    const statusTexts = {
      'pending': 'Pendiente',
      'confirmed': 'Confirmado', 
      'processing': 'Procesando',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };

    return {
      className: `badge ${statusClasses[status] || 'bg-secondary'}`,
      text: statusTexts[status] || status
    };
  };

  // ✅ FUNCIÓN PARA FORMATEAR FECHA
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // ✅ FUNCIÓN PARA FORMATEAR PRECIO
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  return (
    <Container className="py-4">
      <Row>
        <Col lg={3} className="mb-4">
          {/* Sidebar del perfil */}
          <Card>
            <Card.Body className="text-center">
              <div className="mb-3">
                <div 
                  className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center"
                  style={{ width: '80px', height: '80px' }}
                >
                  <FaUser size={40} className="text-white" />
                </div>
              </div>
              <h5 className="mb-1">{user?.name || 'Usuario'}</h5>
              <p className="text-muted mb-3">{user?.email}</p>
              <span className={`badge ${user?.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                {user?.role === 'admin' ? 'Administrador' : 'Cliente'}
              </span>
            </Card.Body>
          </Card>

          {/* Navegación del perfil */}
          <Card className="mt-3">
            <Card.Body className="p-0">
              <Nav variant="pills" className="flex-column">
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'profile'}
                    onClick={() => setActiveTab('profile')}
                    className="text-start"
                  >
                    <FaUser className="me-2" />
                    Mi Perfil
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'orders'}
                    onClick={() => setActiveTab('orders')}
                    className="text-start"
                  >
                    <FaShoppingBag className="me-2" />
                    Mis Órdenes
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'security'}
                    onClick={() => setActiveTab('security')}
                    className="text-start"
                  >
                    <FaLock className="me-2" />
                    Seguridad
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={9}>
          {/* Mensajes */}
          {message.text && (
            <Alert variant={message.type} dismissible onClose={() => setMessage({ type: '', text: '' })}>
              {message.text}
            </Alert>
          )}

          <Tab.Container activeKey={activeTab}>
            <Tab.Content>
              {/* Tab de Perfil */}
              <Tab.Pane eventKey="profile">
                <Card>
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      <FaCog className="me-2" />
                      Información Personal
                    </h5>
                    {!isEditing ? (
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <FaEdit className="me-1" />
                        Editar
                      </Button>
                    ) : (
                      <div>
                        <Button 
                          variant="outline-secondary" 
                          size="sm" 
                          className="me-2"
                          onClick={cancelEdit}
                        >
                          <FaTimes className="me-1" />
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </Card.Header>
                  <Card.Body>
                    <Form onSubmit={handleProfileSubmit}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <FaUser className="me-2" />
                              Nombre Completo
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="name"
                              value={profileData.name}
                              onChange={handleProfileChange}
                              disabled={!isEditing}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <FaEnvelope className="me-2" />
                              Email
                            </Form.Label>
                            <Form.Control
                              type="email"
                              name="email"
                              value={profileData.email}
                              onChange={handleProfileChange}
                              disabled={!isEditing}
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <FaPhone className="me-2" />
                              Teléfono
                            </Form.Label>
                            <Form.Control
                              type="tel"
                              name="phone"
                              value={profileData.phone}
                              onChange={handleProfileChange}
                              disabled={!isEditing}
                              placeholder="Ingresa tu teléfono"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <FaMapMarkerAlt className="me-2" />
                              Dirección
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="address"
                              value={profileData.address}
                              onChange={handleProfileChange}
                              disabled={!isEditing}
                              placeholder="Ingresa tu dirección"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      {isEditing && (
                        <div className="text-end">
                          <Button 
                            type="submit" 
                            variant="primary"
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <Spinner size="sm" className="me-2" />
                                Guardando...
                              </>
                            ) : (
                              <>
                                <FaSave className="me-1" />
                                Guardar Cambios
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* ✅ TAB DE ÓRDENES CON DATOS REALES */}
              <Tab.Pane eventKey="orders">
                <Card>
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      <FaShoppingBag className="me-2" />
                      Órdenes Recientes
                    </h5>
                    <Link to="/orders" className="btn btn-outline-primary btn-sm">
                      Ver Todas
                    </Link>
                  </Card.Header>
                  <Card.Body>
                    {ordersLoading ? (
                      <div className="text-center py-4">
                        <Spinner animation="border" role="status">
                          <span className="visually-hidden">Cargando órdenes...</span>
                        </Spinner>
                        <p className="mt-2 text-muted">Cargando órdenes...</p>
                      </div>
                    ) : ordersError ? (
                      <Alert variant="danger">
                        <strong>Error:</strong> {ordersError}
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          className="ms-2"
                          onClick={loadUserOrders}
                        >
                          Reintentar
                        </Button>
                      </Alert>
                    ) : recentOrders.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Orden #</th>
                              <th>Fecha</th>
                              <th>Artículos</th>
                              <th>Total</th>
                              <th>Estado</th>
                              <th>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentOrders.map(order => {
                              const statusBadge = getStatusBadge(order.status);
                              return (
                                <tr key={order._id}>
                                  <td>
                                    <strong>#{order.orderNumber}</strong>
                                  </td>
                                  <td>{formatDate(order.createdAt)}</td>
                                  <td>{order.items?.length || 0} artículo(s)</td>
                                  <td>
                                    <strong>{formatPrice(order.pricing?.total || 0)}</strong>
                                  </td>
                                  <td>
                                    <span className={statusBadge.className}>
                                      {statusBadge.text}
                                    </span>
                                  </td>
                                  <td>
                                    <Link 
                                      to={`/orders/${order._id}`}
                                      className="btn btn-outline-primary btn-sm"
                                    >
                                      <FaEye className="me-1" />
                                      Ver Detalles
                                    </Link>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <FaShoppingBag size={50} className="text-muted mb-3" />
                        <p className="text-muted">No tienes órdenes recientes</p>
                        <Link to="/shop" className="btn btn-primary">
                          Ir a la Tienda
                        </Link>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Tab de Seguridad */}
              <Tab.Pane eventKey="security">
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">
                      <FaLock className="me-2" />
                      Cambiar Contraseña
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <Form onSubmit={handlePasswordSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>Contraseña Actual</Form.Label>
                        <Form.Control
                          type="password"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Nueva Contraseña</Form.Label>
                        <Form.Control
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          minLength={6}
                          required
                        />
                        <Form.Text className="text-muted">
                          La contraseña debe tener al menos 6 caracteres.
                        </Form.Text>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Confirmar Nueva Contraseña</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                      </Form.Group>
                      <Button 
                        type="submit" 
                        variant="primary"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Spinner size="sm" className="me-2" />
                            Cambiando...
                          </>
                        ) : (
                          'Cambiar Contraseña'
                        )}
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;