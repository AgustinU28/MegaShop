// frontend/src/components/tickets/TicketForm.jsx
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
  Modal,
  Badge,
  ProgressBar
} from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaSave, 
  FaTimes, 
  FaUpload, 
  FaFile, 
  FaTrash,
  FaExclamationTriangle,
  FaInfoCircle,
  FaUser,
  FaEnvelope,
  FaTag,
  FaAlignLeft,
  FaPaperclip
} from 'react-icons/fa';
import ticketService from '../../services/ticketService';

const TicketForm = ({ mode = 'create' }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados principales
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: '',
    priority: 'medium',
    orderNumber: '',
    productId: '',
    attachments: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Estados de opciones
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  // Estados de validación
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Estados de modales
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
    if (mode === 'edit' && id) {
      loadTicket();
    }
  }, [mode, id]);

  const loadInitialData = async () => {
    try {
      // Cargar categorías
      const categoriesResponse = await ticketService.getCategories();
      setCategories(categoriesResponse.data || []);

      // Cargar órdenes del usuario
      const ordersResponse = await ticketService.getUserOrders();
      setOrders(ordersResponse.data || []);

      // Cargar productos
      const productsResponse = await ticketService.getProducts();
      setProducts(productsResponse.data || []);
    } catch (err) {
      console.error('Error loading initial data:', err);
    }
  };

  const loadTicket = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getTicketById(id);
      const ticket = response.data;

      setFormData({
        subject: ticket.subject || '',
        description: ticket.description || '',
        category: ticket.category || '',
        priority: ticket.priority || 'medium',
        orderNumber: ticket.orderNumber || '',
        productId: ticket.productId || '',
        attachments: ticket.attachments || []
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
    
    // Marcar como tocado
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    // Validar asunto
    if (!formData.subject.trim()) {
      newErrors.subject = 'El asunto es requerido';
    } else if (formData.subject.length < 5) {
      newErrors.subject = 'El asunto debe tener al menos 5 caracteres';
    } else if (formData.subject.length > 100) {
      newErrors.subject = 'El asunto no puede exceder 100 caracteres';
    }

    // Validar descripción
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    } else if (formData.description.length < 20) {
      newErrors.description = 'La descripción debe tener al menos 20 caracteres';
    } else if (formData.description.length > 2000) {
      newErrors.description = 'La descripción no puede exceder 2000 caracteres';
    }

    // Validar categoría
    if (!formData.category) {
      newErrors.category = 'La categoría es requerida';
    }

    // Validar prioridad
    if (!formData.priority) {
      newErrors.priority = 'La prioridad es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar subida de archivos
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;

    // Validar archivos
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
    
    for (const file of files) {
      if (file.size > maxSize) {
        setError(`El archivo ${file.name} es demasiado grande. Máximo 5MB.`);
        return;
      }
      
      if (!allowedTypes.includes(file.type)) {
        setError(`Tipo de archivo no permitido: ${file.name}`);
        return;
      }
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Simular progreso de subida
        for (let progress = 0; progress <= 100; progress += 10) {
          setUploadProgress(progress);
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Subir archivo
        const response = await ticketService.uploadAttachment(file);
        
        // Agregar a la lista de adjuntos
        setFormData(prev => ({
          ...prev,
          attachments: [...prev.attachments, {
            id: response.data.id,
            filename: file.name,
            size: file.size,
            type: file.type,
            url: response.data.url
          }]
        }));
      }

      setSuccess('Archivos subidos exitosamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Remover archivo adjunto
  const handleRemoveAttachment = async (attachmentId) => {
    try {
      await ticketService.removeAttachment(attachmentId);
      setFormData(prev => ({
        ...prev,
        attachments: prev.attachments.filter(att => att.id !== attachmentId)
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Por favor corrige los errores en el formulario');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (mode === 'create') {
        const response = await ticketService.createTicket(formData);
        setSuccess('Ticket creado exitosamente');
        setTimeout(() => {
          navigate(`/tickets/${response.data.id}`);
        }, 1500);
      } else {
        const response = await ticketService.updateTicket(id, formData);
        setSuccess('Ticket actualizado exitosamente');
        setTimeout(() => {
          navigate(`/tickets/${id}`);
        }, 1500);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cancelación
  const handleCancel = () => {
    if (hasUnsavedChanges()) {
      setShowCancelModal(true);
    } else {
      navigate('/tickets');
    }
  };

  // Verificar cambios no guardados
  const hasUnsavedChanges = () => {
    return formData.subject || formData.description || formData.attachments.length > 0;
  };

  // Obtener configuración de prioridad
  const getPriorityConfig = (priority) => {
    const configs = {
      low: { variant: 'secondary', text: 'Baja', description: 'No urgente, puede esperar' },
      medium: { variant: 'info', text: 'Media', description: 'Importancia normal' },
      high: { variant: 'warning', text: 'Alta', description: 'Requiere atención pronta' },
      urgent: { variant: 'danger', text: 'Urgente', description: 'Requiere atención inmediata' }
    };
    return configs[priority] || configs.medium;
  };

  if (loading && mode === 'edit') {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando ticket...</span>
        </Spinner>
        <p className="mt-2">Cargando datos del ticket...</p>
      </Container>
    );
  }

  return (
    <>
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card>
              <Card.Header>
                <h4 className="mb-0">
                  {mode === 'create' ? '📝 Crear Nuevo Ticket' : '✏️ Editar Ticket'}
                </h4>
                <small className="text-muted">
                  {mode === 'create' 
                    ? 'Describe tu problema y te ayudaremos a resolverlo'
                    : 'Modifica los detalles de tu ticket'
                  }
                </small>
              </Card.Header>
              <Card.Body>
                {/* Mensajes */}
                {error && (
                  <Alert variant="danger" className="mb-4">
                    <FaExclamationTriangle className="me-2" />
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert variant="success" className="mb-4">
                    <FaInfoCircle className="me-2" />
                    {success}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  {/* Información básica */}
                  <Row className="mb-4">
                    <Col md={8}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">
                          <FaTag className="me-2" />
                          Asunto *
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Describe brevemente tu problema..."
                          value={formData.subject}
                          onChange={(e) => handleChange('subject', e.target.value)}
                          isInvalid={touched.subject && errors.subject}
                          maxLength={100}
                        />
                        <Form.Text className="text-muted">
                          {formData.subject.length}/100 caracteres
                        </Form.Text>
                        <Form.Control.Feedback type="invalid">
                          {errors.subject}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Categoría *</Form.Label>
                        <Form.Select
                          value={formData.category}
                          onChange={(e) => handleChange('category', e.target.value)}
                          isInvalid={touched.category && errors.category}
                        >
                          <option value="">Seleccionar categoría</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.category}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Descripción */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">
                      <FaAlignLeft className="me-2" />
                      Descripción *
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      placeholder="Describe detalladamente tu problema, incluye pasos para reproducirlo si es aplicable..."
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      isInvalid={touched.description && errors.description}
                      maxLength={2000}
                    />
                    <Form.Text className="text-muted">
                      {formData.description.length}/2000 caracteres. 
                      Incluye toda la información relevante para una mejor asistencia.
                    </Form.Text>
                    <Form.Control.Feedback type="invalid">
                      {errors.description}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Prioridad y datos relacionados */}
                  <Row className="mb-4">
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Prioridad *</Form.Label>
                        <Form.Select
                          value={formData.priority}
                          onChange={(e) => handleChange('priority', e.target.value)}
                          isInvalid={touched.priority && errors.priority}
                        >
                          {['low', 'medium', 'high', 'urgent'].map(priority => {
                            const config = getPriorityConfig(priority);
                            return (
                              <option key={priority} value={priority}>
                                {config.text} - {config.description}
                              </option>
                            );
                          })}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.priority}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Número de Orden (opcional)</Form.Label>
                        <Form.Select
                          value={formData.orderNumber}
                          onChange={(e) => handleChange('orderNumber', e.target.value)}
                        >
                          <option value="">Seleccionar orden</option>
                          {orders.map(order => (
                            <option key={order.id} value={order.orderNumber}>
                              #{order.orderNumber} - {order.date}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Text className="text-muted">
                          Si tu consulta está relacionada con una orden específica
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Producto (opcional)</Form.Label>
                        <Form.Select
                          value={formData.productId}
                          onChange={(e) => handleChange('productId', e.target.value)}
                        >
                          <option value="">Seleccionar producto</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Text className="text-muted">
                          Si tu consulta es sobre un producto específico
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Archivos adjuntos */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">
                      <FaPaperclip className="me-2" />
                      Archivos Adjuntos
                    </Form.Label>
                    
                    <div className="border rounded p-3">
                      <div className="d-flex align-items-center mb-3">
                        <Form.Control
                          type="file"
                          multiple
                          accept=".jpg,.jpeg,.png,.gif,.pdf,.txt"
                          onChange={handleFileUpload}
                          disabled={uploading}
                          className="me-3"
                        />
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => document.querySelector('input[type="file"]').click()}
                          disabled={uploading}
                        >
                          <FaUpload className="me-1" />
                          Subir
                        </Button>
                      </div>

                      {uploading && (
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <small>Subiendo archivos...</small>
                            <small>{uploadProgress}%</small>
                          </div>
                          <ProgressBar now={uploadProgress} size="sm" />
                        </div>
                      )}

                      <Form.Text className="text-muted">
                        Formatos permitidos: JPG, PNG, GIF, PDF, TXT. Tamaño máximo: 5MB por archivo.
                      </Form.Text>

                      {/* Lista de archivos adjuntos */}
                      {formData.attachments.length > 0 && (
                        <div className="mt-3">
                          <h6>Archivos adjuntos ({formData.attachments.length})</h6>
                          {formData.attachments.map((attachment, index) => (
                            <div key={attachment.id || index} className="d-flex align-items-center justify-content-between p-2 border rounded mb-2">
                              <div className="d-flex align-items-center">
                                <FaFile className="text-muted me-2" />
                                <div>
                                  <div className="fw-bold">{attachment.filename}</div>
                                  <small className="text-muted">{formatFileSize(attachment.size)}</small>
                                </div>
                              </div>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleRemoveAttachment(attachment.id)}
                              >
                                <FaTrash />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Form.Group>

                  {/* Vista previa */}
                  {(formData.subject || formData.description) && (
                    <Card className="mb-4 bg-light">
                      <Card.Header>
                        <small className="fw-bold">Vista Previa</small>
                      </Card.Header>
                      <Card.Body>
                        {formData.subject && (
                          <h6>{formData.subject}</h6>
                        )}
                        {formData.description && (
                          <p className="mb-0 small text-muted">
                            {formData.description.substring(0, 200)}
                            {formData.description.length > 200 && '...'}
                          </p>
                        )}
                        <div className="mt-2">
                          {formData.priority && (
                            <Badge bg={getPriorityConfig(formData.priority).variant} className="me-2">
                              {getPriorityConfig(formData.priority).text}
                            </Badge>
                          )}
                          {formData.category && categories.find(c => c.id === formData.category) && (
                            <Badge bg="secondary">
                              {categories.find(c => c.id === formData.category).name}
                            </Badge>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  )}

                  {/* Botones de acción */}
                  <div className="d-flex justify-content-between">
                    <Button 
                      variant="outline-secondary" 
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      <FaTimes className="me-1" />
                      Cancelar
                    </Button>
                    
                    <div className="d-flex gap-2">
                      <Button 
                        variant="outline-primary" 
                        onClick={() => setShowPreview(true)}
                        disabled={!formData.subject || !formData.description}
                      >
                        Vista Previa
                      </Button>
                      <Button 
                        type="submit" 
                        variant="primary"
                        disabled={loading || uploading}
                      >
                        {loading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            {mode === 'create' ? 'Creando...' : 'Guardando...'}
                          </>
                        ) : (
                          <>
                            <FaSave className="me-1" />
                            {mode === 'create' ? 'Crear Ticket' : 'Guardar Cambios'}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Modal de cancelación */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>¿Cancelar creación del ticket?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Tienes cambios sin guardar. ¿Estás seguro que quieres cancelar?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Continuar editando
          </Button>
          <Button variant="danger" onClick={() => navigate('/tickets')}>
            Sí, cancelar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de vista previa */}
      <Modal show={showPreview} onHide={() => setShowPreview(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Vista Previa del Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{formData.subject}</h5>
                <div>
                  <Badge bg={getPriorityConfig(formData.priority).variant} className="me-2">
                    {getPriorityConfig(formData.priority).text}
                  </Badge>
                  {formData.category && categories.find(c => c.id === formData.category) && (
                    <Badge bg="secondary">
                      {categories.find(c => c.id === formData.category).name}
                    </Badge>
                  )}
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Descripción:</strong>
                <p className="mt-2">{formData.description}</p>
              </div>
              
              {formData.orderNumber && (
                <div className="mb-3">
                  <strong>Orden relacionada:</strong> #{formData.orderNumber}
                </div>
              )}
              
              {formData.attachments.length > 0 && (
                <div>
                  <strong>Archivos adjuntos ({formData.attachments.length}):</strong>
                  <ul className="mt-2">
                    {formData.attachments.map((file, index) => (
                      <li key={index}>{file.filename} ({formatFileSize(file.size)})</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card.Body>
          </Card>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreview(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .cursor-pointer {
          cursor: pointer;
        }
        
        .form-control:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
        }
        
        .drag-drop-zone {
          border: 2px dashed #dee2e6;
          border-radius: 0.375rem;
          padding: 2rem;
          text-align: center;
          transition: all 0.2s ease;
        }
        
        .drag-drop-zone:hover {
          border-color: #0d6efd;
          background-color: #f8f9fa;
        }
        
        .drag-drop-zone.dragover {
          border-color: #0d6efd;
          background-color: #e3f2fd;
        }
      `}</style>
    </>
  );
};

export default TicketForm;