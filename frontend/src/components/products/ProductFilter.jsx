// frontend/src/components/products/ProductFilter.jsx
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Button, 
  Badge, 
  Accordion,
  InputGroup,
  Collapse,
  Row,
  Col
} from 'react-bootstrap';
import { 
  FaSearch, 
  FaFilter, 
  FaTimes, 
  FaChevronDown, 
  FaChevronUp,
  FaTag,
  FaDollarSign,
  FaBoxes,
  FaList,
  FaStar,
  FaShippingFast
} from 'react-icons/fa';
import productService from '../../services/productService';

const ProductFilter = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  onSearch, 
  productCount = 0, 
  totalProducts = 0 
}) => {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [tags, setTags] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500000 });
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Estados locales para los filtros
  const [localFilters, setLocalFilters] = useState({
    search: '',
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    inStock: false,
    onSale: false,
    freeShipping: false,
    rating: '',
    tags: [],
    sortBy: 'name'
  });

  // Cargar opciones de filtros
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Sincronizar filtros locales con props
  useEffect(() => {
    setLocalFilters(prevFilters => ({
      ...prevFilters,
      ...filters
    }));
  }, [filters]);

  // Cargar opciones de categorías, marcas, etc.
  const loadFilterOptions = async () => {
    try {
      setLoading(true);
      
      // Obtener todos los productos para extraer opciones únicas
      const response = await productService.getAllProducts({ limit: 1000 });
      const products = response.data || [];
      
      // Extraer categorías únicas
      const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories.sort());
      
      // Extraer marcas únicas
      const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];
      setBrands(uniqueBrands.sort());
      
      // Extraer tags únicos
      const allTags = products.flatMap(p => p.tags || []);
      const uniqueTags = [...new Set(allTags)];
      setTags(uniqueTags.sort());
      
      // Calcular rango de precios
      const prices = products.map(p => p.price).filter(p => p > 0);
      if (prices.length > 0) {
        setPriceRange({
          min: Math.floor(Math.min(...prices)),
          max: Math.ceil(Math.max(...prices))
        });
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en filtros locales
  const handleLocalFilterChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Manejar búsqueda
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch && localFilters.search.trim()) {
      onSearch(localFilters.search.trim());
    }
  };

  // Manejar tags múltiples
  const handleTagChange = (tag) => {
    const currentTags = localFilters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    handleLocalFilterChange('tags', newTags);
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      inStock: false,
      onSale: false,
      freeShipping: false,
      rating: '',
      tags: [],
      sortBy: 'name'
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
  };

  // Contar filtros activos
  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.search) count++;
    if (localFilters.category) count++;
    if (localFilters.brand) count++;
    if (localFilters.minPrice) count++;
    if (localFilters.maxPrice) count++;
    if (localFilters.inStock) count++;
    if (localFilters.onSale) count++;
    if (localFilters.freeShipping) count++;
    if (localFilters.rating) count++;
    if (localFilters.tags && localFilters.tags.length > 0) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="product-filter">
      {/* Header del filtro */}
      <Card className="mb-3">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <FaFilter className="me-2" />
            <span className="fw-bold">Filtros</span>
            {activeFiltersCount > 0 && (
              <Badge bg="primary" className="ms-2">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleClearFilters}
            >
              <FaTimes className="me-1" />
              Limpiar
            </Button>
          )}
        </Card.Header>
        <Card.Body>
          <div className="mb-3">
            <small className="text-muted">
              Mostrando {productCount} de {totalProducts} productos
            </small>
          </div>
        </Card.Body>
      </Card>

      {/* Búsqueda */}
      <Card className="mb-3">
        <Card.Body>
          <Form onSubmit={handleSearchSubmit}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Buscar productos..."
                value={localFilters.search}
                onChange={(e) => handleLocalFilterChange('search', e.target.value)}
              />
              <Button type="submit" variant="primary">
                <FaSearch />
              </Button>
            </InputGroup>
          </Form>
        </Card.Body>
      </Card>

      {/* Filtros principales */}
      <Accordion defaultActiveKey={['0', '1', '2']} alwaysOpen>
        {/* Categorías */}
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <FaList className="me-2" />
            Categorías
          </Accordion.Header>
          <Accordion.Body>
            <Form.Select
              value={localFilters.category}
              onChange={(e) => handleLocalFilterChange('category', e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Form.Select>
          </Accordion.Body>
        </Accordion.Item>

        {/* Marcas */}
        <Accordion.Item eventKey="1">
          <Accordion.Header>
            <FaTag className="me-2" />
            Marcas
          </Accordion.Header>
          <Accordion.Body>
            <Form.Select
              value={localFilters.brand}
              onChange={(e) => handleLocalFilterChange('brand', e.target.value)}
            >
              <option value="">Todas las marcas</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </Form.Select>
          </Accordion.Body>
        </Accordion.Item>

        {/* Precio */}
        <Accordion.Item eventKey="2">
          <Accordion.Header>
            <FaDollarSign className="me-2" />
            Precio
          </Accordion.Header>
          <Accordion.Body>
            <Row className="g-2 mb-3">
              <Col>
                <Form.Label className="small">Desde</Form.Label>
                <Form.Control
                  type="number"
                  placeholder={`$${priceRange.min.toLocaleString()}`}
                  value={localFilters.minPrice}
                  onChange={(e) => handleLocalFilterChange('minPrice', e.target.value)}
                />
              </Col>
              <Col>
                <Form.Label className="small">Hasta</Form.Label>
                <Form.Control
                  type="number"
                  placeholder={`$${priceRange.max.toLocaleString()}`}
                  value={localFilters.maxPrice}
                  onChange={(e) => handleLocalFilterChange('maxPrice', e.target.value)}
                />
              </Col>
            </Row>
            
            {/* Rangos predefinidos */}
            <div className="d-grid gap-1">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  handleLocalFilterChange('minPrice', '0');
                  handleLocalFilterChange('maxPrice', '500000');
                }}
              >
                Hasta $500.000
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  handleLocalFilterChange('minPrice', '500000');
                  handleLocalFilterChange('maxPrice', '1000000');
                }}
              >
                $500.000 - $1.000.000
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  handleLocalFilterChange('minPrice', '1000000');
                  handleLocalFilterChange('maxPrice', '2000000');
                }}
              >
                $1.000.000 - $2.000.000
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  handleLocalFilterChange('minPrice', '2000000');
                  handleLocalFilterChange('maxPrice', '');
                }}
              >
                Más de $2.000.000
              </Button>
            </div>
          </Accordion.Body>
        </Accordion.Item>

        {/* Stock y disponibilidad */}
        <Accordion.Item eventKey="3">
          <Accordion.Header>
            <FaBoxes className="me-2" />
            Disponibilidad
          </Accordion.Header>
          <Accordion.Body>
            <Form.Check
              type="checkbox"
              label="Solo productos en stock"
              checked={localFilters.inStock}
              onChange={(e) => handleLocalFilterChange('inStock', e.target.checked)}
              className="mb-2"
            />
            <Form.Check
              type="checkbox"
              label="Productos destacados"
              checked={localFilters.featured}
              onChange={(e) => handleLocalFilterChange('featured', e.target.checked)}
              className="mb-2"
            />
            <Form.Check
              type="checkbox"
              label="Envío gratis (+$50.000)"
              checked={localFilters.freeShipping}
              onChange={(e) => handleLocalFilterChange('freeShipping', e.target.checked)}
            />
          </Accordion.Body>
        </Accordion.Item>

        {/* Calificación */}
        <Accordion.Item eventKey="4">
          <Accordion.Header>
            <FaStar className="me-2" />
            Calificación
          </Accordion.Header>
          <Accordion.Body>
            <div className="d-grid gap-2">
              {[5, 4, 3, 2, 1].map(rating => (
                <Form.Check
                  key={rating}
                  type="radio"
                  name="rating"
                  label={
                    <div className="d-flex align-items-center">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={i < rating ? 'text-warning' : 'text-muted'}
                          size={14}
                        />
                      ))}
                      <span className="ms-2">y más</span>
                    </div>
                  }
                  value={rating.toString()}
                  checked={localFilters.rating === rating.toString()}
                  onChange={(e) => handleLocalFilterChange('rating', e.target.value)}
                />
              ))}
              <Form.Check
                type="radio"
                name="rating"
                label="Cualquier calificación"
                value=""
                checked={localFilters.rating === ''}
                onChange={(e) => handleLocalFilterChange('rating', e.target.value)}
              />
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      {/* Filtros avanzados */}
      <Card className="mt-3">
        <Card.Header>
          <Button
            variant="link"
            className="text-decoration-none p-0 fw-bold w-100 text-start"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <div className="d-flex justify-content-between align-items-center">
              <span>Filtros Avanzados</span>
              {showAdvanced ? <FaChevronUp /> : <FaChevronDown />}
            </div>
          </Button>
        </Card.Header>
        <Collapse in={showAdvanced}>
          <Card.Body>
            {/* Tags */}
            {tags.length > 0 && (
              <div className="mb-3">
                <Form.Label className="fw-bold mb-2">Tags</Form.Label>
                <div className="d-flex flex-wrap gap-1">
                  {tags.slice(0, 10).map(tag => (
                    <Badge
                      key={tag}
                      bg={localFilters.tags?.includes(tag) ? 'primary' : 'outline-secondary'}
                      className="cursor-pointer user-select-none"
                      onClick={() => handleTagChange(tag)}
                      style={{ cursor: 'pointer' }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                {localFilters.tags && localFilters.tags.length > 0 && (
                  <div className="mt-2">
                    <small className="text-muted">
                      Tags seleccionados: {localFilters.tags.length}
                    </small>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-decoration-none p-0 ms-2"
                      onClick={() => handleLocalFilterChange('tags', [])}
                    >
                      Limpiar tags
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Ordenamiento */}
            <div className="mb-3">
              <Form.Label className="fw-bold">Ordenar por</Form.Label>
              <Form.Select
                value={localFilters.sortBy}
                onChange={(e) => handleLocalFilterChange('sortBy', e.target.value)}
              >
                <option value="name">Nombre (A-Z)</option>
                <option value="name-desc">Nombre (Z-A)</option>
                <option value="price-low">Precio: menor a mayor</option>
                <option value="price-high">Precio: mayor a menor</option>
                <option value="stock">Stock disponible</option>
                <option value="newest">Más recientes</option>
                <option value="featured">Destacados</option>
              </Form.Select>
            </div>

            {/* Información adicional */}
            <div className="border-top pt-3">
              <h6 className="mb-2">💡 Consejos de búsqueda:</h6>
              <ul className="small text-muted mb-0">
                <li>Usa palabras clave específicas</li>
                <li>Combina múltiples filtros para mejores resultados</li>
                <li>Los productos en stock se actualizan en tiempo real</li>
                <li>Envío gratis aplica para compras +$50.000</li>
              </ul>
            </div>
          </Card.Body>
        </Collapse>
      </Card>

      {/* Filtros activos */}
      {activeFiltersCount > 0 && (
        <Card className="mt-3">
          <Card.Header>
            <small className="fw-bold">Filtros Activos ({activeFiltersCount})</small>
          </Card.Header>
          <Card.Body>
            <div className="d-flex flex-wrap gap-1">
              {localFilters.search && (
                <Badge bg="primary" className="d-flex align-items-center">
                  Búsqueda: "{localFilters.search.substring(0, 20)}"
                  <FaTimes 
                    className="ms-1" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleLocalFilterChange('search', '')}
                  />
                </Badge>
              )}
              
              {localFilters.category && (
                <Badge bg="primary" className="d-flex align-items-center">
                  {localFilters.category}
                  <FaTimes 
                    className="ms-1" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleLocalFilterChange('category', '')}
                  />
                </Badge>
              )}
              
              {localFilters.brand && (
                <Badge bg="primary" className="d-flex align-items-center">
                  {localFilters.brand}
                  <FaTimes 
                    className="ms-1" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleLocalFilterChange('brand', '')}
                  />
                </Badge>
              )}
              
              {(localFilters.minPrice || localFilters.maxPrice) && (
                <Badge bg="primary" className="d-flex align-items-center">
                  ${localFilters.minPrice || '0'} - ${localFilters.maxPrice || '∞'}
                  <FaTimes 
                    className="ms-1" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      handleLocalFilterChange('minPrice', '');
                      handleLocalFilterChange('maxPrice', '');
                    }}
                  />
                </Badge>
              )}
              
              {localFilters.inStock && (
                <Badge bg="success" className="d-flex align-items-center">
                  En Stock
                  <FaTimes 
                    className="ms-1" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleLocalFilterChange('inStock', false)}
                  />
                </Badge>
              )}
              
              {localFilters.featured && (
                <Badge bg="warning" className="d-flex align-items-center">
                  Destacados
                  <FaTimes 
                    className="ms-1" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleLocalFilterChange('featured', false)}
                  />
                </Badge>
              )}
              
              {localFilters.freeShipping && (
                <Badge bg="info" className="d-flex align-items-center">
                  <FaShippingFast className="me-1" />
                  Envío Gratis
                  <FaTimes 
                    className="ms-1" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleLocalFilterChange('freeShipping', false)}
                  />
                </Badge>
              )}
              
              {localFilters.rating && (
                <Badge bg="warning" className="d-flex align-items-center">
                  {localFilters.rating}+ estrellas
                  <FaTimes 
                    className="ms-1" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleLocalFilterChange('rating', '')}
                  />
                </Badge>
              )}
              
              {localFilters.tags && localFilters.tags.map(tag => (
                <Badge key={tag} bg="secondary" className="d-flex align-items-center">
                  {tag}
                  <FaTimes 
                    className="ms-1" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleTagChange(tag)}
                  />
                </Badge>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      <style jsx>{`
        .cursor-pointer {
          cursor: pointer;
        }
        
        .badge {
          font-size: 0.75em;
        }
        
        .accordion-button:not(.collapsed) {
          background-color: #f8f9fa;
        }
        
        .form-check-label {
          cursor: pointer;
        }
        
        .btn-link {
          border: none !important;
          color: #495057 !important;
        }
        
        .btn-link:hover {
          color: #0d6efd !important;
        }
      `}</style>
    </div>
  );
};

export default ProductFilter;