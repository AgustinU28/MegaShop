// frontend/src/components/common/Header.jsx
import React, { useState, useEffect } from 'react';
import { 
  Navbar, 
  Nav, 
  Container, 
  Badge, 
  Form, 
  Button, 
  Dropdown,
  NavDropdown,
  Offcanvas
} from 'react-bootstrap';
import { 
  FaShoppingCart, 
  FaHome, 
  FaStore, 
  FaUser, 
  FaSearch,
  FaHeart,
  FaBars,
  FaSignInAlt,
  FaUserPlus,
  FaBoxOpen,
  FaHeadset
} from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import cartService from '../../services/cartService';
import './Styles/Header.css';

const Header = () => {
  const [cartItemCount, setCartItemCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Simular usuario autenticado (reemplazar con lógica real de auth)
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Cargar contador del carrito
  useEffect(() => {
    const loadCartCount = async () => {
      try {
        const response = await cartService.getCurrentCart();
        setCartItemCount(response.data?.totalItems || 0);
      } catch (error) {
        console.error('Error loading cart count:', error);
      }
    };

    loadCartCount();

    // Escuchar cambios en el carrito
    const handleCartUpdate = () => {
      loadCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  // Manejar scroll para navbar sticky con efecto
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Manejar búsqueda
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowMobileMenu(false);
    }
  };

  // Manejar logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  // Verificar si la ruta está activa
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Top Bar */}
      <div className="top-bar bg-dark text-white py-1 d-none d-md-block">
        <Container>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <small className="me-3">
                📞 +54 11 1234-5678
              </small>
              <small>
                ✉️ info@urishop.com
              </small>
            </div>
            <div className="d-flex align-items-center">
              <small className="me-3">
                🚚 Envío gratis en compras +$50.000
              </small>
              <small>
                🎮 La mejor tecnología gamer
              </small>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Navbar */}
      <Navbar 
        bg="white" 
        variant="light" 
        expand="lg" 
        fixed="top" 
        className={`main-navbar shadow-sm ${isScrolled ? 'scrolled' : ''}`}
        style={{ top: isScrolled ? '0' : '32px' }}
      >
        <Container>
          {/* Brand */}
          <Navbar.Brand as={Link} to="/" className="brand-logo">
            <span className="brand-icon">🎮</span>
            <span className="brand-text">UriShop</span>
            <small className="brand-tagline d-none d-sm-inline">Gaming Store</small>
          </Navbar.Brand>

          {/* Search Bar - Desktop */}
          <div className="search-container d-none d-lg-flex mx-4 flex-grow-1">
            <Form onSubmit={handleSearch} className="d-flex w-100">
              <div className="search-input-group">
                <Form.Control
                  type="search"
                  placeholder="Buscar productos, marcas, modelos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <Button 
                  type="submit" 
                  variant="primary"
                  className="search-btn"
                  disabled={!searchQuery.trim()}
                >
                  <FaSearch />
                </Button>
              </div>
            </Form>
          </div>

          {/* Desktop Navigation */}
          <div className="d-none d-lg-flex align-items-center">
            <Nav className="me-4">
              <Nav.Link 
                as={Link} 
                to="/" 
                className={`nav-item ${isActiveRoute('/') ? 'active' : ''}`}
              >
                <FaHome className="me-1" />
                Inicio
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/shop" 
                className={`nav-item ${isActiveRoute('/shop') ? 'active' : ''}`}
              >
                <FaStore className="me-1" />
                Tienda
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/contact" 
                className={`nav-item ${isActiveRoute('/contact') ? 'active' : ''}`}
              >
                <FaHeadset className="me-1" />
                Contacto
              </Nav.Link>
            </Nav>

            {/* Action Buttons */}
            <div className="action-buttons d-flex align-items-center">
              {/* Wishlist */}
              <Button
                variant="outline-secondary"
                size="sm"
                className="action-btn me-2"
                as={Link}
                to="/wishlist"
                title="Lista de deseos"
              >
                <FaHeart />
                <Badge bg="danger" className="position-absolute top-0 start-100 translate-middle badge-sm">
                  3
                </Badge>
              </Button>

              {/* Cart */}
              <Button
                variant="outline-primary"
                size="sm"
                className="action-btn me-3"
                as={Link}
                to="/cart"
                title="Carrito de compras"
              >
                <FaShoppingCart />
                {cartItemCount > 0 && (
                  <Badge bg="primary" className="position-absolute top-0 start-100 translate-middle">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              {user ? (
                <NavDropdown
                  title={
                    <span>
                      <FaUser className="me-1" />
                      {user.firstName || user.name || 'Usuario'}
                    </span>
                  }
                  id="user-dropdown"
                  className="user-dropdown"
                >
                  <NavDropdown.Item as={Link} to="/profile">
                    <FaUser className="me-2" />
                    Mi Perfil
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/orders">
                    <FaBoxOpen className="me-2" />
                    Mis Pedidos
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/wishlist">
                    <FaHeart className="me-2" />
                    Lista de Deseos
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <FaSignInAlt className="me-2" />
                    Cerrar Sesión
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <div className="auth-buttons">
                  <Button
                    variant="outline-dark"
                    size="sm"
                    as={Link}
                    to="/login"
                    className="me-2"
                  >
                    <FaSignInAlt className="me-1" />
                    Ingresar
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    as={Link}
                    to="/register"
                  >
                    <FaUserPlus className="me-1" />
                    Registrarse
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="d-lg-none d-flex align-items-center">
            {/* Mobile Cart */}
            <Button
              variant="outline-primary"
              size="sm"
              className="me-2"
              as={Link}
              to="/cart"
            >
              <FaShoppingCart />
              {cartItemCount > 0 && (
                <Badge bg="primary" className="position-absolute top-0 start-100 translate-middle badge-sm">
                  {cartItemCount}
                </Badge>
              )}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="outline-dark"
              size="sm"
              onClick={() => setShowMobileMenu(true)}
            >
              <FaBars />
            </Button>
          </div>
        </Container>
      </Navbar>

      {/* Mobile Offcanvas Menu */}
      <Offcanvas 
        show={showMobileMenu} 
        onHide={() => setShowMobileMenu(false)} 
        placement="end"
        className="mobile-menu"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <span className="brand-icon">🎮</span>
            UriShop
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {/* Mobile Search */}
          <Form onSubmit={handleSearch} className="mb-4">
            <div className="d-flex">
              <Form.Control
                type="search"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="me-2"
              />
              <Button 
                type="submit" 
                variant="primary"
                disabled={!searchQuery.trim()}
              >
                <FaSearch />
              </Button>
            </div>
          </Form>

          {/* Mobile Navigation */}
          <Nav className="flex-column mb-4">
            <Nav.Link 
              as={Link} 
              to="/" 
              onClick={() => setShowMobileMenu(false)}
              className="mobile-nav-item"
            >
              <FaHome className="me-2" />
              Inicio
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/shop" 
              onClick={() => setShowMobileMenu(false)}
              className="mobile-nav-item"
            >
              <FaStore className="me-2" />
              Tienda
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/wishlist" 
              onClick={() => setShowMobileMenu(false)}
              className="mobile-nav-item"
            >
              <FaHeart className="me-2" />
              Lista de Deseos
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/contact" 
              onClick={() => setShowMobileMenu(false)}
              className="mobile-nav-item"
            >
              <FaHeadset className="me-2" />
              Contacto
            </Nav.Link>
          </Nav>

          {/* Mobile User Section */}
          {user ? (
            <div className="mobile-user-section">
              <div className="user-info mb-3 p-3 bg-light rounded">
                <h6 className="mb-1">
                  <FaUser className="me-2" />
                  {user.firstName || user.name || 'Usuario'}
                </h6>
                <small className="text-muted">{user.email}</small>
              </div>
              <Nav className="flex-column">
                <Nav.Link 
                  as={Link} 
                  to="/profile" 
                  onClick={() => setShowMobileMenu(false)}
                  className="mobile-nav-item"
                >
                  <FaUser className="me-2" />
                  Mi Perfil
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/orders" 
                  onClick={() => setShowMobileMenu(false)}
                  className="mobile-nav-item"
                >
                  <FaBoxOpen className="me-2" />
                  Mis Pedidos
                </Nav.Link>
                <Nav.Link 
                  onClick={() => {
                    handleLogout();
                    setShowMobileMenu(false);
                  }}
                  className="mobile-nav-item text-danger"
                >
                  <FaSignInAlt className="me-2" />
                  Cerrar Sesión
                </Nav.Link>
              </Nav>
            </div>
          ) : (
            <div className="mobile-auth-section">
              <Button
                variant="outline-dark"
                className="w-100 mb-2"
                as={Link}
                to="/login"
                onClick={() => setShowMobileMenu(false)}
              >
                <FaSignInAlt className="me-2" />
                Iniciar Sesión
              </Button>
              <Button
                variant="primary"
                className="w-100"
                as={Link}
                to="/register"
                onClick={() => setShowMobileMenu(false)}
              >
                <FaUserPlus className="me-2" />
                Registrarse
              </Button>
            </div>
          )}

          {/* Mobile Contact Info */}
          <div className="mobile-contact mt-4 pt-4 border-top">
            <small className="text-muted d-block mb-1">
              📞 +54 11 1234-5678
            </small>
            <small className="text-muted d-block mb-1">
              ✉️ info@urishop.com
            </small>
            <small className="text-muted d-block">
              🚚 Envío gratis en compras +$50.000
            </small>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Header;