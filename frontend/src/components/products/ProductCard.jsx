// frontend/src/components/products/ProductCard.jsx
import React, { useState } from 'react';
import { Card, Button, Badge, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaEye } from 'react-icons/fa';
import cartService from '../../services/cartService';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product, onProductUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [imageError, setImageError] = useState(false);
  const { dispatch } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  const handleAddToCart = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const response = await cartService.addToCurrentCart(product.id, 1);
      
      // Actualizar contexto del carrito
      dispatch({
        type: 'ADD_ITEM',
        payload: response.data
      });

      setMessage({ type: 'success', text: 'Producto agregado al carrito' });
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMessage(null), 3000);
      
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = () => {
    navigate(`/products/${product.id}`);
  };

  const getStockBadge = () => {
    if (product.stock === 0) {
      return <Badge bg="danger">Sin Stock</Badge>;
    } else if (product.stock <= 5) {
      return <Badge bg="warning">Últimas {product.stock} unidades</Badge>;
    } else {
      return <Badge bg="success">Stock: {product.stock}</Badge>;
    }
  };

  // Función para manejar error de imagen
  const handleImageError = (e) => {
    if (!imageError) {
      setImageError(true);
      // Intentar con una imagen de placeholder más confiable
      e.target.src = `https://picsum.photos/300/200?random=${product.id}`;
    } else {
      // Si la segunda imagen también falla, usar una imagen local o estática
      e.target.src = `data:image/svg+xml;base64,${btoa(`
        <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f8f9fa"/>
          <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#6c757d" text-anchor="middle" dy=".3em">
            ${product.title.substring(0, 20)}
          </text>
        </svg>
      `)}`;
    }
  };

  return (
    <Card className="h-100 shadow-sm product-card">
      {/* Badge destacado */}
      {product.featured && (
        <div className="position-absolute top-0 start-0 m-2" style={{ zIndex: 1 }}>
          <Badge bg="primary">Destacado</Badge>
        </div>
      )}

      {/* Imagen del producto */}
      <div className="position-relative product-image-container">
        <Card.Img 
          variant="top" 
          src={product.thumbnail} 
          style={{ height: '200px', objectFit: 'cover', cursor: 'pointer' }}
          onError={handleImageError}
          onClick={handleViewDetails}
          loading="lazy"
          alt={product.title}
        />
        
        {/* Overlay con botón de ver detalles */}
        <div className="position-absolute top-50 start-50 translate-middle opacity-0 product-overlay">
          <Button 
            variant="light"
            size="sm"
            onClick={handleViewDetails}
            className="shadow"
          >
            <FaEye className="me-1" /> Ver Detalles
          </Button>
        </div>
      </div>

      <Card.Body className="d-flex flex-column">
        {/* Título y descripción */}
        <div className="flex-grow-1">
          <Card.Title 
            className="h6 mb-2" 
            style={{ fontSize: '1rem', cursor: 'pointer' }}
            onClick={handleViewDetails}
          >
            {product.title}
          </Card.Title>
          <Card.Text className="text-muted small mb-3" style={{ fontSize: '0.875rem' }}>
            {product.description && product.description.length > 80 
              ? `${product.description.substring(0, 80)}...` 
              : product.description}
          </Card.Text>
        </div>

        {/* Información del producto */}
        <div className="mb-3">
          {/* Categoría y marca */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <small className="text-muted">{product.brand}</small>
            <Badge bg="secondary" className="small">{product.category}</Badge>
          </div>
          
          {/* Stock badge */}
          <div className="mb-2">
            {getStockBadge()}
          </div>
        </div>

        {/* Mensaje temporal */}
        {message && (
          <Alert 
            variant={message.type === 'success' ? 'success' : 'danger'} 
            className="small py-1 mb-2"
          >
            {message.text}
          </Alert>
        )}

        {/* Precio y acciones */}
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="text-primary mb-0">{formatPrice(product.price)}</h5>
            <small className="text-muted">Código: {product.code}</small>
          </div>
          
          <div className="d-grid gap-2">
            <Button 
              variant="primary" 
              size="sm"
              disabled={product.stock === 0 || loading}
              onClick={handleAddToCart}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Agregando...
                </>
              ) : (
                <>
                  <FaShoppingCart className="me-2" />
                  {product.stock > 0 ? 'Agregar al Carrito' : 'Sin Stock'}
                </>
              )}
            </Button>
            
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={handleViewDetails}
            >
              <FaEye className="me-1" />
              Ver Detalles
            </Button>
          </div>
        </div>
      </Card.Body>

      <style jsx>{`
        .product-card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
        
        .product-image-container:hover .product-overlay {
          opacity: 1 !important;
        }
        
        .product-overlay {
          transition: opacity 0.2s ease-in-out;
        }
        
        .product-card .card-title:hover {
          color: #0d6efd !important;
          text-decoration: underline;
        }
      `}</style>
    </Card>
  );
};

export default ProductCard;