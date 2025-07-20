// frontend/src/components/tickets/TicketDetail.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Badge, 
  Button, 
  Form, 
  Alert, 
  Spinner,
  Modal,
  Dropdown,
  Timeline,
  Breadcrumb
} from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaReply, 
  FaPaperclip,
  FaDownload,
  FaClock,
  FaUser,
  FaCheckCircle,
  FaTimes,
  FaExclamationTriangle,
  FaComment,
  FaEllipsisV,
  FaPrint,
  FaShare,
  FaFlag,
  FaEye,
  FaFile,
  FaImage,
  FaFilePdf,
  FaSend,
  FaSpinner
} from 'react-icons/fa';
import ticketService from '../../services/ticketService';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // Estados principales
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de mensajes
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageAttachments, setMessageAttachments] = useState([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  // Estados de modales
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Estados de acciones
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPriority, setUpdatingPriority] = useState(false);

  // Cargar ticket y mensajes
  useEffect(() => {
    if (id) {
      loadTicket();
      loadMessages();
      
      // Marcar como leído
      markAsRead();
    }
  }, [id]);

  // Scroll automático a nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getTicketById(id);
      setTicket(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading ticket:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await ticketService.getTicketMessages(id);
      setMessages(response.data || []);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const markAsRead = async () => {
    try {
      await ticketService.markTicketAsRead(id);
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    return configs[priority] || configs.medium;
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Obtener icono por tipo de archivo
  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return FaImage;
    } else if (extension === 'pdf') {
      return FaFilePdf;
    } else {
      return FaFile;
    }
  };

  // Manejar subida de archivos para mensajes
  const handleAttachmentUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;

    try {
      setUploadingAttachment(true);
      
      for (const file of files) {
        const response = await ticketService.uploadMessageAttachment(file);
        setMessageAttachments(prev => [...prev, {
          id: response.data.id,
          filename: file.name,
          size: file.size,
          type: file.type,
          url: response.data.url
        }]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingAttachment(false);
    }
  };

  // Enviar mensaje
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() && messageAttachments.length === 0) {
      return;
    }

    try {
      setSendingMessage(true);
      
      const messageData = {
        content: newMessage.trim(),
        attachments: messageAttachments
      };

      const response = await ticketService.addMessage(id, messageData);
      
      // Agregar mensaje a la lista
      setMessages(prev => [...prev, response.data]);
      
      // Limpiar formulario
      setNewMessage('');
      setMessageAttachments([]);
      
      // Recargar ticket para actualizar estado
      loadTicket();
    } catch (err) {
      setError(err.message);
    } finally {
      setSendingMessage(false);
    }
  };

  // Actualizar estado del ticket
  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      await ticketService.updateTicketStatus(id, newStatus);
      setTicket(prev => ({ ...prev, status: newStatus }));
      loadMessages(); // Recargar para ver mensaje automático del sistema
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Actualizar prioridad del ticket
  const handleUpdatePriority = async (newPriority) => {
    try {
      setUpdatingPriority(true);
      await ticketService.updateTicketPriority(id, newPriority);
      setTicket(prev => ({ ...prev, priority: newPriority }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingPriority(false);
    }
  };

  // Cerrar ticket
  const handleCloseTicket = async () => {
    await handleUpdateStatus('closed');
    setShowCloseModal(false);
  };

  // Reabrir ticket
  const handleReopenTicket = async () => {
    await handleUpdateStatus('open');
  };

  // Renderizar archivo adjunto
  const renderAttachment = (attachment, isMessage = false) => {
    const FileIcon = getFileIcon(attachment.filename);
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(
      attachment.filename.split('.').pop().toLowerCase()
    );

    return (
      <div 
        key={attachment.id} 
        className={`d-flex align-items-center gap-2 p-2 border rounded ${isMessage ? 'bg-light' : ''}`}
      >
        <FileIcon className="text-muted" />
        <div className="flex-grow-1">
          <div className="fw-bold small">{attachment.filename}</div>
          <div className="text-muted small">{formatFileSize(attachment.size)}</div>
        </div>
        <div className="d-flex gap-1">
          {isImage && (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => {
                setSelectedImage(attachment.url);
                setShowImageModal(true);
              }}
            >
              <FaEye />
            </Button>
          )}
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => window.open(attachment.url, '_blank')}
          >
            <FaDownload />
          </Button>
        </div>
      </div>
    );
  };

  // Renderizar mensaje
  const renderMessage = (message, index) => {
    const isSystemMessage = message.type === 'system';
    const isUserMessage = message.author.role === 'user';
    
    return (
      <div key={message.id} className={`mb-4 ${isSystemMessage ? 'text-center' : ''}`}>
        {isSystemMessage ? (
          <div className="system-message">
            <Badge bg="secondary" className="px-3 py-2">
              <FaClock className="me-2" />
              {message.content}
            </Badge>
            <div className="small text-muted mt-1">
              {formatDate(message.createdAt)}
            </div>
          </div>
        ) : (
          <Card className={`${isUserMessage ? 'ms-5 border-primary' : 'me-5 border-success'}`}>
            <Card.Header className={`py-2 ${isUserMessage ? 'bg-primary text-white' : 'bg-success text-white'}`}>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <FaUser className="me-2" />
                  <strong>{message.author.name || message.author.email}</strong>
                  <Badge bg="light" text="dark" className="ms-2">
                    {message.author.role === 'user' ? 'Cliente' : 'Soporte'}
                  </Badge>
                </div>
                <small>{formatDate(message.createdAt)}</small>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="message-content">
                {message.content.split('\n').map((line, i) => (
                  <p key={i} className="mb-2">{line}</p>
                ))}
              </div>
              
              {/* Archivos adjuntos del mensaje */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-3">
                  <h6 className="small fw-bold mb-2">
                    <FaPaperclip className="me-1" />
                    Archivos adjuntos ({message.attachments.length})
                  </h6>
                  <div className="d-grid gap-2">
                    {message.attachments.map(attachment => 
                      renderAttachment(attachment, true)
                    )}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando ticket...</span>
        </Spinner>
        <p className="mt-2">Cargando detalles del ticket...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h5>Error al cargar el ticket</h5>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => navigate('/tickets')}>
            Volver a tickets
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!ticket) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <h5>Ticket no encontrado</h5>
          <p>El ticket que buscas no existe o no tienes permisos para verlo.</p>
          <Button variant="outline-warning" onClick={() => navigate('/tickets')}>
            Volver a tickets
          </Button>
        </Alert>
      </Container>
    );
  }

  const statusConfig = getStatusConfig(ticket.status);
  const priorityConfig = getPriorityConfig(ticket.priority);
  const StatusIcon = statusConfig.icon;

  return (
    <>
      <Container className="py-4">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item as={Link} to="/">Inicio</Breadcrumb.Item>
          <Breadcrumb.Item as={Link} to="/tickets">Tickets</Breadcrumb.Item>
          <Breadcrumb.Item active>#{ticket.ticketNumber}</Breadcrumb.Item>
        </Breadcrumb>

        {/* Header del ticket */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="d-flex align-items-center mb-2">
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    className="me-3"
                    onClick={() => navigate('/tickets')}
                  >
                    <FaArrowLeft />
                  </Button>
                  <h2 className="mb-0">Ticket #{ticket.ticketNumber}</h2>
                </div>
                <h4 className="text-muted">{ticket.subject}</h4>
                <div className="d-flex align-items-center gap-3 mt-2">
                  <Badge bg={statusConfig.variant} className="d-flex align-items-center gap-1">
                    <StatusIcon size={12} />
                    {statusConfig.text}
                  </Badge>
                  <Badge bg={priorityConfig.variant}>
                    Prioridad {priorityConfig.text}
                  </Badge>
                  <span className="text-muted">
                    Creado el {formatDate(ticket.createdAt)}
                  </span>
                </div>
              </div>
              
              <div className="d-flex gap-2">
                <Dropdown>
                  <Dropdown.Toggle variant="outline-secondary" size="sm">
                    <FaEllipsisV />
                  </Dropdown.Toggle>
                  <Dropdown.Menu align="end">
                    <Dropdown.Item as={Link} to={`/tickets/${id}/edit`}>
                      <FaEdit className="me-2" />
                      Editar ticket
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => window.print()}>
                      <FaPrint className="me-2" />
                      Imprimir
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Header>Cambiar Estado</Dropdown.Header>
                    {ticket.status !== 'open' && (
                      <Dropdown.Item onClick={() => handleUpdateStatus('open')}>
                        <FaClock className="me-2" />
                        Reabrir
                      </Dropdown.Item>
                    )}
                    {ticket.status !== 'in_progress' && (
                      <Dropdown.Item onClick={() => handleUpdateStatus('in_progress')}>
                        <FaComment className="me-2" />
                        Marcar en progreso
                      </Dropdown.Item>
                    )}
                    {ticket.status !== 'closed' && (
                      <Dropdown.Item onClick={() => setShowCloseModal(true)}>
                        <FaCheckCircle className="me-2" />
                        Cerrar ticket
                      </Dropdown.Item>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
                
                {ticket.status === 'closed' ? (
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={handleReopenTicket}
                    disabled={updatingStatus}
                  >
                    {updatingStatus ? <FaSpinner className="fa-spin" /> : <FaClock />}
                    {' '}Reabrir
                  </Button>
                ) : (
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => setShowCloseModal(true)}
                    disabled={updatingStatus}
                  >
                    {updatingStatus ? <FaSpinner className="fa-spin" /> : <FaCheckCircle />}
                    {' '}Cerrar
                  </Button>
                )}
              </div>
            </div>
          </Col>
        </Row>

        <Row>
          {/* Contenido principal */}
          <Col lg={8}>
            {/* Descripción del ticket */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Descripción del Problema</h5>
              </Card.Header>
              <Card.Body>
                <div className="ticket-description">
                  {ticket.description.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
                
                {/* Archivos adjuntos originales */}
                {ticket.attachments && ticket.attachments.length > 0 && (
                  <div className="mt-4">
                    <h6>
                      <FaPaperclip className="me-2" />
                      Archivos Adjuntos ({ticket.attachments.length})
                    </h6>
                    <div className="d-grid gap-2">
                      {ticket.attachments.map(attachment => renderAttachment(attachment))}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Conversación */}
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <FaComment className="me-2" />
                  Conversación ({messages.length})
                </h5>
              </Card.Header>
              <Card.Body style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {messages.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <FaComment size={48} className="mb-3" />
                    <p>Aún no hay mensajes en este ticket.</p>
                    <p>Escribe tu primer mensaje abajo para continuar la conversación.</p>
                  </div>
                ) : (
                  <div className="messages-container">
                    {messages.map((message, index) => renderMessage(message, index))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </Card.Body>
              
              {/* Formulario de respuesta */}
              {ticket.status !== 'closed' && (
                <Card.Footer>
                  <Form onSubmit={handleSendMessage}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Agregar Respuesta</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        placeholder="Escribe tu mensaje aquí..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={sendingMessage}
                      />
                    </Form.Group>

                    {/* Archivos adjuntos del mensaje */}
                    {messageAttachments.length > 0 && (
                      <div className="mb-3">
                        <h6 className="small">Archivos a enviar:</h6>
                        <div className="d-grid gap-2">
                          {messageAttachments.map((attachment, index) => (
                            <div key={index} className="d-flex align-items-center justify-content-between p-2 border rounded">
                              <span>{attachment.filename}</span>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => setMessageAttachments(prev => 
                                  prev.filter((_, i) => i !== index)
                                )}
                              >
                                <FaTimes />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex gap-2">
                        <Form.Control
                          type="file"
                          multiple
                          accept=".jpg,.jpeg,.png,.gif,.pdf,.txt"
                          onChange={handleAttachmentUpload}
                          disabled={uploadingAttachment}
                          style={{ display: 'none' }}
                          id="message-file-input"
                        />
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => document.getElementById('message-file-input').click()}
                          disabled={uploadingAttachment}
                        >
                          {uploadingAttachment ? <FaSpinner className="fa-spin" /> : <FaPaperclip />}
                          {' '}Adjuntar
                        </Button>
                      </div>
                      
                      <Button 
                        type="submit" 
                        variant="primary"
                        disabled={sendingMessage || (!newMessage.trim() && messageAttachments.length === 0)}
                      >
                        {sendingMessage ? (
                          <>
                            <FaSpinner className="fa-spin me-2" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <FaSend className="me-2" />
                            Enviar Respuesta
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                </Card.Footer>
              )}
            </Card>
          </Col>

          {/* Sidebar con información */}
          <Col lg={4}>
            {/* Información del ticket */}
            <Card className="mb-4">
              <Card.Header>
                <h6 className="mb-0">Información del Ticket</h6>
              </Card.Header>
              <Card.Body>
                <div className="ticket-info">
                  <div className="mb-3">
                    <strong>Estado:</strong>
                    <div className="mt-1">
                      <Badge bg={statusConfig.variant} className="d-flex align-items-center gap-1 w-fit">
                        <StatusIcon size={12} />
                        {statusConfig.text}
                      </Badge>
                    </div>
                  </div>

                  <div className="mb-3">
                    <strong>Prioridad:</strong>
                    <div className="mt-1">
                      <Dropdown>
                        <Dropdown.Toggle 
                          variant="outline-secondary" 
                          size="sm"
                          disabled={updatingPriority}
                        >
                          {updatingPriority ? <FaSpinner className="fa-spin me-1" /> : null}
                          {priorityConfig.text}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          {['low', 'medium', 'high', 'urgent'].map(priority => {
                            const config = getPriorityConfig(priority);
                            return (
                              <Dropdown.Item
                                key={priority}
                                active={ticket.priority === priority}
                                onClick={() => handleUpdatePriority(priority)}
                              >
                                <Badge bg={config.variant} className="me-2">
                                  {config.text}
                                </Badge>
                              </Dropdown.Item>
                            );
                          })}
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </div>

                  <div className="mb-3">
                    <strong>Categoría:</strong>
                    <div className="mt-1">{ticket.category}</div>
                  </div>

                  <div className="mb-3">
                    <strong>Creado:</strong>
                    <div className="mt-1">{formatDate(ticket.createdAt)}</div>
                  </div>

                  <div className="mb-3">
                    <strong>Última actualización:</strong>
                    <div className="mt-1">{formatDate(ticket.updatedAt)}</div>
                  </div>

                  {ticket.orderNumber && (
                    <div className="mb-3">
                      <strong>Orden relacionada:</strong>
                      <div className="mt-1">
                        <Link to={`/orders/${ticket.orderNumber}`}>
                          #{ticket.orderNumber}
                        </Link>
                      </div>
                    </div>
                  )}

                  {ticket.productId && (
                    <div className="mb-3">
                      <strong>Producto:</strong>
                      <div className="mt-1">
                        <Link to={`/products/${ticket.productId}`}>
                          {ticket.product?.name || `Producto #${ticket.productId}`}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>

            {/* Historial de cambios */}
            <Card>
              <Card.Header>
                <h6 className="mb-0">Historial de Cambios</h6>
              </Card.Header>
              <Card.Body>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-marker bg-primary"></div>
                    <div className="timeline-content">
                      <strong>Ticket creado</strong>
                      <div className="small text-muted">{formatDate(ticket.createdAt)}</div>
                    </div>
                  </div>
                  
                  {ticket.statusHistory && ticket.statusHistory.map((change, index) => (
                    <div key={index} className="timeline-item">
                      <div className="timeline-marker bg-info"></div>
                      <div className="timeline-content">
                        <strong>Estado cambiado a {getStatusConfig(change.status).text}</strong>
                        <div className="small text-muted">
                          {formatDate(change.createdAt)} por {change.changedBy}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Modal de confirmación para cerrar */}
      <Modal show={showCloseModal} onHide={() => setShowCloseModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cerrar Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro que quieres cerrar este ticket?</p>
          <p className="text-muted">
            Una vez cerrado, podrás reabrirlo si necesitas ayuda adicional.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCloseModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleCloseTicket}>
            Sí, cerrar ticket
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para ver imágenes */}
      <Modal show={showImageModal} onHide={() => setShowImageModal(false)} size="lg" centered>
        <Modal.Body className="p-0">
          <img 
            src={selectedImage} 
            alt="Archivo adjunto" 
            className="img-fluid w-100"
            style={{ maxHeight: '80vh', objectFit: 'contain' }}
          />
        </Modal.Body>
      </Modal>

      <style jsx>{`
        .ticket-description {
          white-space: pre-line;
        }
        
        .messages-container {
          padding: 1rem 0;
        }
        
        .system-message {
          padding: 1rem 0;
        }
        
        .timeline {
          position: relative;
          padding-left: 2rem;
        }
        
        .timeline::before {
          content: '';
          position: absolute;
          left: 0.75rem;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #dee2e6;
        }
        
        .timeline-item {
          position: relative;
          margin-bottom: 1.5rem;
        }
        
        .timeline-marker {
          position: absolute;
          left: -1.75rem;
          top: 0.25rem;
          width: 0.75rem;
          height: 0.75rem;
          border-radius: 50%;
          border: 2px solid white;
        }
        
        .timeline-content {
          padding-left: 0.5rem;
        }
        
        .message-content p:last-child {
          margin-bottom: 0;
        }
        
        .w-fit {
          width: fit-content !important;
        }
      `}</style>
    </>
  );
};

export default TicketDetail;