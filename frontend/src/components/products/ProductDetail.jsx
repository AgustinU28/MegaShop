// frontend/src/components/products/ProductDetail.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Badge, 
  Alert, 
  Spinner,
  Modal,
  Form,
  Table,
  Carousel,
  Breadcrumb,
  Nav,
  Tab
} from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FaShoppingCart, 
  FaHeart, 
  FaShare, 
  FaStar, 
  FaArrowLeft,
  FaPlus,
  FaMinus,
  FaCheck,
  FaTimes,
  FaShippingFast,
  FaShieldAlt,
  FaUndo,
  FaEye,
  FaCopy,
  FaWhatsapp,
  FaFacebook,
  FaTwitter
} from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import productService from '../../services/productService';
import ProductCard from './ProductCard';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, loading: cartLoading } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('description');
  const [message, setMessage] = useState(null);

  // Cargar producto
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!id) {
          throw new Error('ID de producto no válido');
        }

        const response = await productService.getProductById(id);
        setProduct(response.data);
        
        // Cargar productos relacionados
        if (response.data?.category) {
          loadRelatedProducts(response.data.category, id);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error loading product:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // Cargar productos relacionados
  const loadRelatedProducts = async (category, currentProductId) => {
    try {
      const response = await productService.getAllProducts({ 
        category, 
        limit: 4,
        exclude: currentProductId 
      });
      setRelatedProducts(response.data || []);
    } catch (err) {
      console.error('Error loading related products:', err);
    }
  };

  // Manejar cambio de cantidad
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    if (newQuantity > product.stock) {
      setMessage({ 
        type: 'warning', 
        text: `Solo hay ${product.stock} unidades disponibles` 
      });
      return;
    }
    setQuantity(newQuantity);
    setMessage(null);
  };

  // Agregar al carrito
  const handleAddToCart = async () => {
    try {
      if (!product || product.stock === 0) return;

      await addToCart(product.id, quantity);
      
      setMessage({ 
        type: 'success', 
        text: `${quantity} producto${quantity > 1 ? 's' : ''} agregado${quantity > 1 ? 's' : ''} al carrito` 
      });

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.message 
      });
    }
  };

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  // Obtener badge de stock
  const getStockBadge = () => {
    if (product.stock === 0) {
      return <Badge bg="danger">Sin Stock</Badge>;
    } else if (product.stock <= 5) {
      return <Badge bg="warning">Últimas {product.stock} unidades</Badge>;
    } else {
      return <Badge bg="success">En Stock ({product.stock} disponibles)</Badge>;
    }
  };

  // Compartir producto
  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `¡Mira este producto! ${product.title}`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        setMessage({ type: 'success', text: 'Enlace copiado al portapapeles' });
        break;
      default:
        break;
    }
    setShowShareModal(false);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando producto...</span>
        </Spinner>
        <p className="mt-2">Cargando detalles del producto...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h5>Error al cargar el producto</h5>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => navigate('/shop')}>
            Volver a la tienda
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <h5>Producto no encontrado</h5>
          <p>El producto que buscas no existe o no está disponible.</p>
          <Button variant="outline-warning" onClick={() => navigate('/shop')}>
            Volver a la tienda
          </Button>
        </Alert>
      </Container>
    );
  }

  const images = product.images || [{ url: product.thumbnail, alt: product.title, isPrimary: true }];

  return (
    <>
      <Container className="py-4">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item as={Link} to="/">Inicio</Breadcrumb.Item>
          <Breadcrumb.Item as={Link} to="/shop">Tienda</Breadcrumb.Item>
          <Breadcrumb.Item active>{product.category}</Breadcrumb.Item>
        </Breadcrumb>

        {/* Botón volver */}
        <Button 
          variant="outline-secondary" 
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft className="me-2" />
          Volver
        </Button>

        {/* Producto principal */}
        <Row className="mb-5">
          {/* Imágenes */}
          <Col lg={6} className="mb-4">
            <Card>
              <Card.Body className="p-2">
                {/* Imagen principal */}
                <div className="main-image-container mb-3">
                  <img
                    src={images[selectedImage]?.url || product.thumbnail}
                    alt={images[selectedImage]?.alt || product.title}
                    className="img-fluid rounded cursor-pointer"
                    onClick={() => setShowImageModal(true)}
                    style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                  />
                  <Button
                    variant="light"
                    className="position-absolute top-0 end-0 m-2"
                    onClick={() => setShowImageModal(true)}
                  >
                    <FaEye />
                  </Button>
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <Row className="g-2">
                    {images.map((image, index) => (
                      <Col key={index} xs={3}>
                        <img
                          src={image.url}
                          alt={image.alt}
                          className={`img-fluid rounded cursor-pointer border ${
                            selectedImage === index ? 'border-primary border-2' : 'border-light'
                          }`}
                          onClick={() => setSelectedImage(index)}
                          style={{ height: '80px', objectFit: 'cover' }}
                        />
                      </Col>
                    ))}
                  </Row>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Información del producto */}
          <Col lg={6}>
            <div className="product-info">
              {/* Header */}
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h1 className="h3 mb-2">{product.title}</h1>
                  <p className="text-muted mb-1">Código: {product.code}</p>
                  <p className="text-muted mb-0">Marca: {product.brand}</p>
                </div>
                <div className="text-end">
                  <Button variant="outline-secondary" size="sm" className="me-2">
                    <FaHeart />
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => setShowShareModal(true)}
                  >
                    <FaShare />
                  </Button>
                </div>
              </div>

              {/* Precio y stock */}
              <Card className="mb-4">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="text-primary mb-0">{formatPrice(product.price)}</h2>
                    {getStockBadge()}
                  </div>

                  {/* Mensaje */}
                  {message && (
                    <Alert 
                      variant={message.type === 'success' ? 'success' : message.type === 'warning' ? 'warning' : 'danger'} 
                      className="py-2"
                    >
                      {message.text}
                    </Alert>
                  )}

                  {/* Selector de cantidad */}
                  {product.stock > 0 && (
                    <div className="d-flex align-items-center mb-3">
                      <label className="me-3">Cantidad:</label>
                      <div className="d-flex align-items-center">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleQuantityChange(quantity - 1)}
                          disabled={quantity <= 1}
                        >
                          <FaMinus />
                        </Button>
                        <Form.Control
                          type="number"
                          value={quantity}
                          onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                          className="mx-2 text-center"
                          style={{ width: '80px' }}
                          min="1"
                          max={product.stock}
                        />
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleQuantityChange(quantity + 1)}
                          disabled={quantity >= product.stock}
                        >
                          <FaPlus />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="d-grid gap-2">
                    <Button
                      variant="primary"
                      size="lg"
                      disabled={product.stock === 0 || cartLoading}
                      onClick={handleAddToCart}
                    >
                      {cartLoading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Agregando...
                        </>
                      ) : product.stock > 0 ? (
                        <>
                          <FaShoppingCart className="me-2" />
                          Agregar al Carrito
                        </>
                      ) : (
                        'Sin Stock'
                      )}
                    </Button>
                    
                    <Button
                      variant="outline-success"
                      disabled={product.stock === 0}
                      onClick={() => {
                        handleAddToCart();
                        setTimeout(() => navigate('/cart'), 1000);
                      }}
                    >
                      Comprar Ahora
                    </Button>
                  </div>
                </Card.Body>
              </Card>

              {/* Beneficios */}
              <Card>
                <Card.Body>
                  <h6 className="mb-3">Beneficios de comprar con nosotros</h6>
                  <div className="row g-3">
                    <div className="col-6">
                      <div className="d-flex align-items-center">
                        <FaShippingFast className="text-primary me-2" />
                        <small>Envío gratis +$50.000</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="d-flex align-items-center">
                        <FaShieldAlt className="text-success me-2" />
                        <small>Garantía {product.warranty || 12} meses</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="d-flex align-items-center">
                        <FaUndo className="text-info me-2" />
                        <small>Devolución 30 días</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="d-flex align-items-center">
                        <FaCheck className="text-warning me-2" />
                        <small>Producto original</small>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>

        {/* Tabs de información */}
        <Card className="mb-5">
          <Card.Header>
            <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab}>
              <Nav.Item>
                <Nav.Link eventKey="description">Descripción</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="specifications">Especificaciones</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="reviews">Opiniones</Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          <Card.Body>
            <Tab.Content>
              <Tab.Pane active={activeTab === 'description'}>
                <p>{product.description}</p>
                {product.tags && product.tags.length > 0 && (
                  <div className="mt-3">
                    <h6>Tags:</h6>
                    {product.tags.map((tag, index) => (
                      <Badge key={index} bg="secondary" className="me-2 mb-2">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </Tab.Pane>
              
              <Tab.Pane active={activeTab === 'specifications'}>
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <Table striped bordered hover>
                    <tbody>
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <tr key={key}>
                          <td><strong>{key}</strong></td>
                          <td>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p className="text-muted">No hay especificaciones disponibles.</p>
                )}
              </Tab.Pane>
              
              <Tab.Pane active={activeTab === 'reviews'}>
                <div className="text-center py-4">
                  <p className="text-muted">Las opiniones están próximamente disponibles.</p>
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Card>

        {/* Productos relacionados */}
        {relatedProducts.length > 0 && (
          <div>
            <h3 className="mb-4">Productos Relacionados</h3>
            <Row>
              {relatedProducts.map(relatedProduct => (
                <Col key={relatedProduct.id} md={3} className="mb-4">
                  <ProductCard product={relatedProduct} />
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Container>

      {/* Modal de imagen */}
      <Modal show={showImageModal} onHide={() => setShowImageModal(false)} size="lg" centered>
        <Modal.Body className="p-0">
          <Carousel activeIndex={selectedImage} onSelect={setSelectedImage}>
            {images.map((image, index) => (
              <Carousel.Item key={index}>
                <img
                  src={image.url}
                  alt={image.alt}
                  className="d-block w-100"
                  style={{ height: '500px', objectFit: 'contain' }}
                />
              </Carousel.Item>
            ))}
          </Carousel>
        </Modal.Body>
      </Modal>

      {/* Modal de compartir */}
      <Modal show={showShareModal} onHide={() => setShowShareModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Compartir Producto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-grid gap-2">
            <Button variant="success" onClick={() => handleShare('whatsapp')}>
              <FaWhatsapp className="me-2" />
              WhatsApp
            </Button>
            <Button variant="primary" onClick={() => handleShare('facebook')}>
              <FaFacebook className="me-2" />
              Facebook
            </Button>
            <Button variant="info" onClick={() => handleShare('twitter')}>
              <FaTwitter className="me-2" />
              Twitter
            </Button>
            <Button variant="outline-secondary" onClick={() => handleShare('copy')}>
              <FaCopy className="me-2" />
              Copiar enlace
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <style jsx>{`
        .cursor-pointer {
          cursor: pointer;
        }
        
        .main-image-container {
          position: relative;
        }
        
        .product-info h1 {
          line-height: 1.2;
        }
        
        .nav-tabs .nav-link {
          color: #495057;
        }
        
        .nav-tabs .nav-link.active {
          color: #0d6efd;
          font-weight: 600;
        }
      `}</style>
    </>
  );
};

export default ProductDetail;