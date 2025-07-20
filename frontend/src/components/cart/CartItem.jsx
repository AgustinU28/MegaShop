// frontend/src/components/cart/CartItem.jsx
import React, { useState } from 'react';
import { Row, Col, Button, Form, Alert } from 'react-bootstrap';
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Styles/CartItem.css';

const CartItem = ({ item, onUpdateQuantity, onRemove, disabled = false }) => {
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  // Manejar cambio de cantidad con botones
  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;
    
    // Verificar stock disponible
    if (item.product && newQuantity > item.product.stock) {
      alert(`Stock insuficiente. Máximo disponible: ${item.product.stock}`);
      return;
    }

    try {
      setIsUpdating(true);
      setLocalQuantity(newQuantity);
      await onUpdateQuantity(item.productId, newQuantity);
    } catch (error) {
      // Revertir cantidad local si hay error
      setLocalQuantity(item.quantity);
      console.error('Error updating quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Manejar cambio directo en input
  const handleInputChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setLocalQuantity(value);
  };

  // Manejar blur del input (cuando pierde foco)
  const handleInputBlur = async () => {
    if (localQuantity !== item.quantity && localQuantity >= 1) {
      // Verificar stock disponible
      if (item.product && localQuantity > item.product.stock) {
        alert(`Stock insuficiente. Máximo disponible: ${item.product.stock}`);
        setLocalQuantity(item.quantity);
        return;
      }

      try {
        setIsUpdating(true);
        await onUpdateQuantity(item.productId, localQuantity);
      } catch (error) {
        setLocalQuantity(item.quantity);
        console.error('Error updating quantity:', error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  // Manejar eliminación
  const handleRemove = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto del carrito?')) {
      try {
        await onRemove(item.productId);
      } catch (error) {
        console.error('Error removing item:', error);
      }
    }
  };

  // Verificar si el producto tiene información completa
  if (!item.product) {
    return (
      <Alert variant="warning" className="m-3">
        <Alert.Heading>Producto no disponible</Alert.Heading>
        <p>Este producto ya no está disponible en nuestro catálogo.</p>
        <Button variant="outline-warning" size="sm" onClick={handleRemove}>
          Eliminar del carrito
        </Button>
      </Alert>
    );
  }

  const product = item.product;
  const subtotal = item.subtotal || (product.price * localQuantity);
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock <= 5 && product.stock > 0;

  return (
    <div className={`cart-item p-3 ${disabled || isUpdating ? 'updating' : ''}`}>
      <Row className="align-items-center">
        {/* Imagen del producto */}
        <Col xs={12} sm={3} md={2}>
          <div className="product-image-container">
            <img
              src={product.thumbnail || '/placeholder-image.jpg'}
              alt={product.title}
              className="cart-item-image"
              onError={(e) => {
                e.target.src = '/placeholder-image.jpg';
              }}
            />
          </div>
        </Col>

        {/* Información del producto */}
        <Col xs={12} sm={9} md={4}>
          <div className="product-info">
            <Link 
              to={`/products/${product.id}`} 
              className="product-title text-decoration-none"
            >
              <h6 className="mb-1">{product.title}</h6>
            </Link>
            <p className="text-muted small mb-1">
              Código: {product.code}
            </p>
            <p className="text-muted small mb-0">
              {product.description && product.description.length > 80 
                ? `${product.description.substring(0, 80)}...` 
                : product.description}
            </p>
            
            {/* Estado del stock */}
            {isOutOfStock && (
              <Alert variant="danger" className="mt-2 mb-0 py-1">
                <small>Sin stock disponible</small>
              </Alert>
            )}
            {isLowStock && (
              <Alert variant="warning" className="mt-2 mb-0 py-1">
                <small>Últimas {product.stock} unidades</small>
              </Alert>
            )}
          </div>
        </Col>

        {/* Precio unitario */}
        <Col xs={6} sm={6} md={2} className="text-center">
          <div className="price-info">
            <span className="price">{formatPrice(product.price)}</span>
            <small className="text-muted d-block">c/u</small>
          </div>
        </Col>

        {/* Controles de cantidad */}
        <Col xs={6} sm={6} md={2}>
          <div className="quantity-controls">
            <div className="d-flex align-items-center justify-content-center">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => handleQuantityChange(localQuantity - 1)}
                disabled={disabled || isUpdating || localQuantity <= 1}
                className="quantity-btn"
              >
                <FaMinus size={10} />
              </Button>

              <Form.Control
                type="number"
                min="1"
                max={product.stock}
                value={localQuantity}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                disabled={disabled || isUpdating}
                className="quantity-input mx-2 text-center"
                size="sm"
              />

              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => handleQuantityChange(localQuantity + 1)}
                disabled={disabled || isUpdating || localQuantity >= product.stock}
                className="quantity-btn"
              >
                <FaPlus size={10} />
              </Button>
            </div>
            
            <small className="text-muted d-block text-center mt-1">
              Máx: {product.stock}
            </small>
          </div>
        </Col>

        {/* Subtotal */}
        <Col xs={8} sm={8} md={1} className="text-end">
          <div className="subtotal">
            <strong>{formatPrice(subtotal)}</strong>
          </div>
        </Col>

        {/* Botón eliminar */}
        <Col xs={4} sm={4} md={1} className="text-end">
          <Button
            variant="outline-danger"
            size="sm"
            onClick={handleRemove}
            disabled={disabled || isUpdating}
            className="remove-btn"
            title="Eliminar producto"
          >
            <FaTrash />
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default CartItem;