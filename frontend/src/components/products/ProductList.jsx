// frontend/src/components/products/ProductList.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Spinner, Form } from 'react-bootstrap';
import ProductCard from './ProductCard';
import ProductFilter from './ProductFilter';
import productService from '../../services/productService';
import './ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    minPrice: '',
    maxPrice: '',
    inStock: false,
    sortBy: 'name'
  });

  // Cargar productos
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productService.getAllProducts({
        search: filters.search || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        inStock: filters.inStock || undefined
      });
      
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros y ordenamiento
  const applyFiltersAndSort = () => {
    let filtered = [...products];

    // Filtro por búsqueda local adicional
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.code.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por rango de precio local
    if (filters.minPrice) {
      filtered = filtered.filter(product => product.price >= parseFloat(filters.minPrice));
    }
    
    if (filters.maxPrice) {
      filtered = filtered.filter(product => product.price <= parseFloat(filters.maxPrice));
    }

    // Filtro por stock
    if (filters.inStock) {
      filtered = filtered.filter(product => product.stock > 0);
    }

    // Ordenamiento
    switch (filters.sortBy) {
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'stock':
        filtered.sort((a, b) => b.stock - a.stock);
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  };

  // Manejar cambios en filtros
  const handleFilterChange = (newFilters) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      search: '',
      minPrice: '',
      maxPrice: '',
      inStock: false,
      sortBy: 'name'
    });
  };

  // Manejar búsqueda
  const handleSearch = async (searchTerm) => {
    try {
      setLoading(true);
      const response = await productService.searchProducts(searchTerm);
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error searching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Efectos
  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [filters, products]);

  // Componente de productos
  const renderProducts = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" className="me-2">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p>Cargando productos...</p>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="danger" className="text-center">
          <Alert.Heading>Error al cargar productos</Alert.Heading>
          <p>{error}</p>
          <button 
            className="btn btn-outline-danger"
            onClick={loadProducts}
          >
            Reintentar
          </button>
        </Alert>
      );
    }

    if (filteredProducts.length === 0) {
      return (
        <Alert variant="info" className="text-center">
          <Alert.Heading>No se encontraron productos</Alert.Heading>
          <p>No hay productos que coincidan con los filtros seleccionados.</p>
          <button 
            className="btn btn-outline-info"
            onClick={clearFilters}
          >
            Limpiar filtros
          </button>
        </Alert>
      );
    }

    return (
      <Row>
        {filteredProducts.map(product => (
          <Col key={product.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
            <ProductCard 
              product={product}
              onProductUpdate={loadProducts}
            />
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <Container fluid className="product-list-container">
      <Row>
        {/* Filtros laterales */}
        <Col lg={3} md={4} className="mb-4">
          <ProductFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            onSearch={handleSearch}
            productCount={filteredProducts.length}
            totalProducts={products.length}
          />
        </Col>

        {/* Lista de productos */}
        <Col lg={9} md={8}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Productos</h2>
            <div className="d-flex align-items-center gap-3">
              <Form.Select
                size="sm"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                style={{ width: 'auto' }}
              >
                <option value="name">Ordenar por nombre</option>
                <option value="price-low">Precio: menor a mayor</option>
                <option value="price-high">Precio: mayor a menor</option>
                <option value="stock">Por stock</option>
              </Form.Select>
              <span className="text-muted">
                {filteredProducts.length} de {products.length} productos
              </span>
            </div>
          </div>

          {renderProducts()}
        </Col>
      </Row>
    </Container>
  );
};

export default ProductList;