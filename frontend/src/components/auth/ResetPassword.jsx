
import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!email.trim()) {
      setError('Por favor ingresa tu email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Por favor ingresa un email válido');
      return;
    }

    setLoading(true);

    try {
      // Simular envío de email de recuperación
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setEmailSent(true);
      setMessage(`Se ha enviado un enlace de recuperación a ${email}`);
    } catch (err) {
      setError('Error al enviar el email de recuperación. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setMessage('Email reenviado correctamente');
    } catch (err) {
      setError('Error al reenviar el email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <Card className="shadow-lg border-0">
            <Card.Header className="text-center bg-warning text-dark">
              <h4 className="mb-0">
                <FaEnvelope className="me-2" />
                Recuperar Contraseña
              </h4>
              <small>Te ayudamos a recuperar tu acceso</small>
            </Card.Header>
            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger" className="mb-3">
                  <small>{error}</small>
                </Alert>
              )}
              
              {message && (
                <Alert variant="success" className="mb-3">
                  <FaCheckCircle className="me-2" />
                  <small>{message}</small>
                </Alert>
              )}

              {!emailSent ? (
                <>
                  <div className="text-center mb-4">
                    <p className="text-muted">
                      Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
                    </p>
                  </div>

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                      <Form.Label>
                        <FaEnvelope className="me-2 text-muted" />
                        Email
                      </Form.Label>
                      <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError('');
                        }}
                        placeholder="tu@email.com"
                        className="form-control-lg"
                        disabled={loading}
                        required
                        autoFocus
                      />
                      <Form.Text className="text-muted">
                        Te enviaremos un enlace para restablecer tu contraseña.
                      </Form.Text>
                    </Form.Group>

                    <Button 
                      variant="warning" 
                      type="submit" 
                      className="w-100 btn-lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Enviando enlace...
                        </>
                      ) : (
                        'Enviar Enlace de Recuperación'
                      )}
                    </Button>
                  </Form>
                </>
              ) : (
                <div className="text-center">
                  <div className="mb-4">
                    <FaCheckCircle size={48} className="text-success mb-3" />
                    <h5>¡Email enviado!</h5>
                    <p className="text-muted">
                      Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="text-muted small">
                      ¿No ves el email? Revisa tu carpeta de spam o correo no deseado.
                    </p>
                  </div>

                  <Button 
                    variant="outline-warning" 
                    onClick={handleResendEmail}
                    disabled={loading}
                    className="mb-3"
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Reenviando...
                      </>
                    ) : (
                      'Reenviar Email'
                    )}
                  </Button>
                </div>
              )}

              {/* Link para volver */}
              <div className="text-center mt-4">
                <hr className="my-3" />
                <Link 
                  to="/login" 
                  className="text-decoration-none d-flex align-items-center justify-content-center"
                >
                  <FaArrowLeft className="me-2" />
                  Volver al inicio de sesión
                </Link>
              </div>

              {/* Información adicional */}
              <div className="mt-4 p-3 bg-light rounded">
                <small className="text-muted">
                  <strong>¿Necesitas ayuda?</strong><br />
                  Si tienes problemas para acceder a tu cuenta, contáctanos en{' '}
                  <a href="mailto:soporte@urishop.com" className="text-decoration-none">
                    soporte@urishop.com
                  </a>
                </small>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default ResetPassword;