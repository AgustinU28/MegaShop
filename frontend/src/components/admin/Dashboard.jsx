// ===== frontend/src/components/admin/Dashboard.jsx =====
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Alert, Spinner } from 'react-bootstrap';
import { FaUsers, FaShoppingCart, FaBoxes, FaChartLine } from 'react-icons/fa';
import api from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    products: 0,
    revenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Simular carga de datos del dashboard
      const [statsResponse, ordersResponse] = await Promise.all([
        api.get('/stats'),
        api.get('/orders?limit=5')
      ]);

      setStats({
        users: 150,
        orders: 75,
        products: statsResponse.data.data?.products || 9,
        revenue: 125000
      });

      setRecentOrders([
        { id: 1, customer: 'Juan Pérez', total: 15000, status: 'completed' },
        { id: 2, customer: 'María García', total: 25000, status: 'pending' },
        { id: 3, customer: 'Carlos López', total: 18000, status: 'processing' }
      ]);
    } catch (err) {
      setError('Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  const getStatusBadge = (status) => {
    const variants = {
      completed: 'success',
      pending: 'warning',
      processing: 'info',
      cancelled: 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Cargando dashboard...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <h2 className="mb-4">Dashboard Administrativo</h2>

      {/* Estadísticas */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaUsers size={40} className="text-primary mb-2" />
              <h4>{stats.users}</h4>
              <p className="text-muted">Usuarios</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaShoppingCart size={40} className="text-success mb-2" />
              <h4>{stats.orders}</h4>
              <p className="text-muted">Órdenes</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaBoxes size={40} className="text-info mb-2" />
              <h4>{stats.products}</h4>
              <p className="text-muted">Productos</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaChartLine size={40} className="text-warning mb-2" />
              <h4>{formatPrice(stats.revenue)}</h4>
              <p className="text-muted">Ingresos</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Órdenes recientes */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Órdenes Recientes</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.customer}</td>
                      <td>{formatPrice(order.total)}</td>
                      <td>{getStatusBadge(order.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;