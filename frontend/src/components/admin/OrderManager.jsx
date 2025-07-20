// ===== frontend/src/components/admin/OrderManager.jsx =====
import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Modal, Form, Alert } from 'react-bootstrap';
import { FaEdit, FaEye } from 'react-icons/fa';

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    // Datos simulados
    const mockOrders = [
      {
        id: 1,
        customer: 'Juan Pérez',
        email: 'juan@example.com',
        total: 15000,
        status: 'completed',
        date: '2024-01-15',
        items: [
          { name: 'Computadora Gamer 1', quantity: 1, price: 15000 }
        ]
      },
      {
        id: 2,
        customer: 'María García',
        email: 'maria@example.com',
        total: 25000,
        status: 'pending',
        date: '2024-01-14',
        items: [
          { name: 'Computadora Gamer 2', quantity: 1, price: 25000 }
        ]
      }
    ];
    setOrders(mockOrders);
    setLoading(false);
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

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    setShowModal(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  if (loading) {
    return <div className="text-center p-5">Cargando órdenes...</div>;
  }

  return (
    <Container fluid className="py-4">
      <h2 className="mb-4">Gestión de Órdenes</h2>
      
      <Table responsive striped hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Email</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>#{order.id}</td>
              <td>{order.customer}</td>
              <td>{order.email}</td>
              <td>{formatPrice(order.total)}</td>
              <td>{getStatusBadge(order.status)}</td>
              <td>{order.date}</td>
              <td>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  className="me-2"
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowModal(true);
                  }}
                >
                  <FaEye />
                </Button>
                <Button variant="outline-secondary" size="sm">
                  <FaEdit />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal de detalles */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Orden #{selectedOrder?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <h6>Información del Cliente</h6>
              <p><strong>Nombre:</strong> {selectedOrder.customer}</p>
              <p><strong>Email:</strong> {selectedOrder.email}</p>
              
              <h6>Productos</h6>
              {selectedOrder.items.map((item, index) => (
                <div key={index} className="border-bottom py-2">
                  <p><strong>{item.name}</strong></p>
                  <p>Cantidad: {item.quantity} - Precio: {formatPrice(item.price)}</p>
                </div>
              ))}
              
              <h6 className="mt-3">Estado de la Orden</h6>
              <Form.Select 
                value={selectedOrder.status}
                onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
              >
                <option value="pending">Pendiente</option>
                <option value="processing">Procesando</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
              </Form.Select>
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default OrderManager;