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
  FaShippingFast,
  FaShieldAlt,
  FaUndo,
  FaEye
} from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import productService from '../../services/productService';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
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

        console.log('Cargando producto con ID:', id);
        
        // Cargar producto desde tu API de MongoDB
        const response = await productService.getProductById(id);
        console.log('Producto cargado:', response);
        
        if (response.success && response.data) {
          setProduct(response.data);
        } else {
          throw new Error('Producto no encontrado');
        }
        
      } catch (err) {
        console.error('Error loading product:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

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
      console.error('Error adding to cart:', err);
      setMessage({ 
        type: 'error', 
        text: err.message || 'Error al agregar al carrito'
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

  // Renderizar estrellas
  const renderStars = (rating) => {
    if (!rating) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-warning" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStar key="half" className="text-warning" style={{ opacity: 0.5 }} />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaStar key={`empty-${i}`} className="text-muted" />);
    }

    return stars;
  };

  // Estados de carga y error
  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" role="status" size="lg">
            <span className="visually-hidden">Cargando producto...</span>
          </Spinner>
          <p className="mt-3">Cargando producto...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <h4>Error al cargar el producto</h4>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => navigate('/shop')}>
            <FaArrowLeft className="me-2" />
            Volver a la tienda
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-5">
        <Alert variant="warning" className="text-center">
          <h4>Producto no encontrado</h4>
          <p>El producto que buscas no existe o ha sido eliminado.</p>
          <Button variant="outline-warning" onClick={() => navigate('/shop')}>
            <FaArrowLeft className="me-2" />
            Volver a la tienda
          </Button>
        </Alert>
      </Container>
    );
  }

  // Manejar imágenes del producto
  const images = product.images && product.images.length > 0 
    ? product.images.map(img => ({
        url: typeof img === 'string' ? img : img.url || img,
        alt: `${product.title} - imagen`
      }))
    : [{ url: product.thumbnail, alt: product.title }];

  return (
    <Container className="py-4">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
          Inicio
        </Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/shop" }}>
          Tienda
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{product.title}</Breadcrumb.Item>
      </Breadcrumb>

      <Row>
        {/* Galería de imágenes */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-3">
              {/* Imagen principal */}
              <div className="mb-3 position-relative">
                <img
                  src={images[selectedImage]?.url || product.thumbnail}
                  alt={images[selectedImage]?.alt || product.title}
                  className="img-fluid rounded"
                  style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                />
                <Button
                  variant="light"
                  className="position-absolute top-0 end-0 m-2"
                  size="sm"
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
                        style={{ height: '80px', objectFit: 'cover', cursor: 'pointer' }}
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
                {product.averageRating && product.totalReviews > 0 && (
                  <div className="d-flex align-items-center mt-2">
                    <div className="me-2">
                      {renderStars(product.averageRating)}
                    </div>
                    <span className="text-muted">
                      ({product.totalReviews} opiniones)
                    </span>
                  </div>
                )}
              </div>
              <div className="text-end">
                <Button variant="outline-secondary" size="sm" className="me-2">
                  <FaHeart />
                </Button>
                <Button variant="outline-secondary" size="sm">
                  <FaShare />
                </Button>
              </div>
            </div>

            {/* Precio y stock */}
            <Card className="mb-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2 className="text-primary mb-0 h2">{formatPrice(product.price)}</h2>
                  {getStockBadge()}
                </div>

                {/* Mensaje */}
                {message && (
                  <Alert 
                    variant={
                      message.type === 'success' ? 'success' : 
                      message.type === 'warning' ? 'warning' : 'danger'
                    }
                    dismissible 
                    onClose={() => setMessage(null)}
                    className="mb-3"
                  >
                    {message.text}
                  </Alert>
                )}

                {/* Selector de cantidad */}
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
                    <span className="mx-3 fw-bold">{quantity}</span>
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

                {/* Botón agregar al carrito */}
                <Button
                  variant="primary"
                  size="lg"
                  className="w-100 mb-3"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <FaShoppingCart className="me-2" />
                  {product.stock === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
                </Button>

                {/* Información adicional */}
                <div className="small text-muted">
                  <div className="d-flex align-items-center mb-2">
                    <FaShippingFast className="me-2" />
                    Envío gratis en compras superiores a $50.000
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <FaShieldAlt className="me-2" />
                    Garantía oficial de 12 meses
                  </div>
                  <div className="d-flex align-items-center">
                    <FaUndo className="me-2" />
                    Devolución gratuita en 30 días
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Tabs de información */}
      <Card className="mt-4">
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
              {product.specifications && product.specifications.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <tbody>
                      {product.specifications.map((spec, index) => (
                        <tr key={index}>
                          <td className="fw-bold" style={{ width: '30%' }}>{spec.name}</td>
                          <td>{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No hay especificaciones disponibles.</p>
              )}
            </Tab.Pane>
            
            <Tab.Pane active={activeTab === 'reviews'}>
              <div className="text-center py-4">
                <FaStar size={48} className="text-muted mb-3" />
                <h5>Próximamente</h5>
                <p className="text-muted">Las opiniones de clientes estarán disponibles pronto.</p>
              </div>
            </Tab.Pane>
          </Tab.Content>
        </Card.Body>
      </Card>

      {/* Botón volver */}
      <div className="mt-4">
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate('/shop')}
        >
          <FaArrowLeft className="me-2" />
          Volver a la tienda
        </Button>
      </div>
    </Container>
  );
};

export default ProductDetail;