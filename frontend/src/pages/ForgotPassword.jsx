// frontend/src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert, 
  Spinner 
} from 'react-bootstrap';
import { 
  FaEnvelope, 
  FaArrowLeft, 
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
// import authService from '../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validación básica
    if (!email) {
      setMessage({ type: 'danger', text: 'Por favor ingresa tu email' });
      setLoading(false);
      return;
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ type: 'danger', text: 'Por favor ingresa un email válido' });
      setLoading(false);
      return;
    }

    try {
      // Simular llamada a la API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Si tienes authService configurado, usa esto:
      // const response = await authService.forgotPassword(email);
      // if (response.success) {
      //   setEmailSent(true);
      //   setMessage({ 
      //     type: 'success', 
      //     text: 'Se ha enviado un enlace de recuperación a tu email' 
      //   });
      // }
      
      // Por ahora simulamos éxito
      setEmailSent(true);
      setMessage({ 
        type: 'success', 
        text: 'Se ha enviado un enlace de recuperación a tu email' 
      });
      
    } catch (error) {
      setMessage({ 
        type: 'danger', 
        text: error.message || 'Error al enviar el email de recuperación' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Simular reenvío
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setMessage({ 
        type: 'info', 
        text: 'Email reenviado correctamente. Revisa tu bandeja de entrada.' 
      });
    } catch (error) {
      setMessage({ 
        type: 'danger', 
        text: 'Error al reenviar el email' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center bg-light">
      <Row className="justify-content-center w-100">
        <Col md={6} lg={5} xl={4}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <div className="mb-3">
                  {emailSent ? (
                    <FaCheckCircle size={48} className="text-success" />
                  ) : (
                    <FaEnvelope size={48} className="text-primary" />
                  )}
                </div>
                <h2 className="h4 mb-2">
                  {emailSent ? '¡Email Enviado!' : 'Recuperar Contraseña'}
                </h2>
                <p className="text-muted">
                  {emailSent 
                    ? 'Revisa tu bandeja de entrada y sigue las instrucciones'
                    : 'Ingresa tu email para recibir un enlace de recuperación'
                  }
                </p>
              </div>

              {/* Mensajes de alerta */}
              {message.text && (
                <Alert 
                  variant={message.type} 
                  dismissible 
                  onClose={() => setMessage({ type: '', text: '' })}
                  className="mb-4"
                >
                  {message.text}
                </Alert>
              )}

              {!emailSent ? (
                // Formulario para solicitar recuperación
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FaEnvelope className="me-2" />
                      Email
                    </Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="py-2"
                    />
                  </Form.Group>

                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="lg"
                    className="w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="me-2" />
                        Enviar Email de Recuperación
                      </>
                    )}
                  </Button>
                </Form>
              ) : (
                // Pantalla de confirmación
                <div className="text-center">
                  <div className="alert alert-light border mb-4">
                    <FaExclamationTriangle className="text-warning me-2" />
                    <strong>¿No recibiste el email?</strong>
                    <p className="mb-0 mt-2 small text-muted">
                      Revisa tu carpeta de spam o correo no deseado
                    </p>
                  </div>

                  <Button 
                    variant="outline-primary" 
                    className="w-100 mb-3"
                    onClick={handleResendEmail}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Reenviando...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="me-2" />
                        Reenviar Email
                      </>
                    )}
                  </Button>

                  <div className="small text-muted">
                    <p>El enlace de recuperación expira en <strong>24 horas</strong></p>
                  </div>
                </div>
              )}

              {/* Enlaces de navegación */}
              <div className="text-center mt-4">
                <div className="d-flex justify-content-between align-items-center">
                  <Link 
                    to="/login" 
                    className="text-decoration-none d-flex align-items-center"
                  >
                    <FaArrowLeft className="me-1" />
                    Volver al Login
                  </Link>
                  
                  <Link 
                    to="/register" 
                    className="text-decoration-none"
                  >
                    Crear Cuenta
                  </Link>
                </div>
              </div>

              {/* Información adicional */}
              <div className="mt-4 pt-3 border-top">
                <div className="small text-muted text-center">
                  <p className="mb-2">
                    <strong>¿Necesitas ayuda?</strong>
                  </p>
                  <p className="mb-0">
                    Contacta a soporte: 
                    <a href="mailto:soporte@urishop.com" className="ms-1">
                      soporte@urishop.com
                    </a>
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Consejos de seguridad */}
          <Card className="mt-3 border-0 bg-transparent">
            <Card.Body className="p-3">
              <div className="small text-muted">
                <h6 className="text-dark mb-2">💡 Consejos de Seguridad:</h6>
                <ul className="mb-0 ps-3">
                  <li>Nunca compartas tu enlace de recuperación</li>
                  <li>El enlace expira en 24 horas por seguridad</li>
                  <li>Si no solicitaste esto, ignora este email</li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;