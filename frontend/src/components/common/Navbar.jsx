// frontend/src/components/common/Navbar.jsx
import React, { useState } from 'react';
import { 
  Navbar as BootstrapNavbar, 
  Nav, 
  Container, 
  Badge, 
  NavDropdown,
  Button 
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaShoppingCart, 
  FaUser, 
  FaSignInAlt, 
  FaUserPlus, 
  FaSignOutAlt,
  FaCog,
  FaListAlt,
  FaTachometerAlt
} from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [expanded, setExpanded] = useState(false);
  const { cart } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // Calcular total de items en el carrito
  const getTotalItems = () => {
    if (!cart?.data?.items) return 0;
    return cart.data.items.reduce((total, item) => total + item.quantity, 0);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setExpanded(false);
  };

  const closeNavbar = () => setExpanded(false);

  return (
    <BootstrapNavbar 
      expand="lg" 
      className="navbar-dark bg-primary shadow-sm"
      expanded={expanded}
      onToggle={setExpanded}
    >
      <Container>
        {/* Brand */}
        <BootstrapNavbar.Brand 
          as={Link} 
          to="/" 
          className="fw-bold fs-4"
          onClick={closeNavbar}
        >
          🎮 UriShop
        </BootstrapNavbar.Brand>

        <BootstrapNavbar.Toggle aria-controls="navbar-nav" />
        
        <BootstrapNavbar.Collapse id="navbar-nav">
          {/* Navigation Links */}
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              onClick={closeNavbar}
              className="fw-semibold"
            >
              Inicio
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/shop" 
              onClick={closeNavbar}
              className="fw-semibold"
            >
              Tienda
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/about" 
              onClick={closeNavbar}
              className="fw-semibold"
            >
              Nosotros
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/contact" 
              onClick={closeNavbar}
              className="fw-semibold"
            >
              Contacto
            </Nav.Link>
          </Nav>

          {/* Right Side Navigation */}
          <Nav className="ms-auto align-items-lg-center">
            {/* Cart Link */}
            <Nav.Link 
              as={Link} 
              to="/cart" 
              className="position-relative me-3"
              onClick={closeNavbar}
            >
              <FaShoppingCart size={20} />
              {getTotalItems() > 0 && (
                <Badge 
                  bg="danger" 
                  pill 
                  className="position-absolute top-0 start-100 translate-middle"
                  style={{ fontSize: '0.7rem' }}
                >
                  {getTotalItems()}
                </Badge>
              )}
              <span className="d-lg-none ms-2">
                Carrito ({getTotalItems()})
              </span>
            </Nav.Link>

            {/* Authentication Section */}
            {isAuthenticated ? (
              <>
                {/* User Dropdown */}
                <NavDropdown
                  title={
                    <span>
                      <FaUser className="me-1" />
                      <span className="d-none d-lg-inline">
                        {user?.name || 'Usuario'}
                      </span>
                    </span>
                  }
                  id="user-nav-dropdown"
                  align="end"
                >
                  <NavDropdown.Header>
                    <div className="fw-bold">{user?.name}</div>
                    <small className="text-muted">{user?.email}</small>
                  </NavDropdown.Header>
                  
                  <NavDropdown.Divider />
                  
                  <NavDropdown.Item 
                    as={Link} 
                    to="/orders"
                    onClick={closeNavbar}
                  >
                    <FaListAlt className="me-2" />
                    Mis Órdenes
                  </NavDropdown.Item>
                  
                  <NavDropdown.Item 
                    as={Link} 
                    to="/profile"
                    onClick={closeNavbar}
                  >
                    <FaCog className="me-2" />
                    Mi Perfil
                  </NavDropdown.Item>

                  {/* Admin Link */}
                  {user?.role === 'admin' && (
                    <>
                      <NavDropdown.Divider />
                      <NavDropdown.Item 
                        as={Link} 
                        to="/admin"
                        onClick={closeNavbar}
                      >
                        <FaTachometerAlt className="me-2" />
                        Panel Admin
                      </NavDropdown.Item>
                    </>
                  )}
                  
                  <NavDropdown.Divider />
                  
                  <NavDropdown.Item onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" />
                    Cerrar Sesión
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                {/* Login & Register Buttons */}
                <div className="d-flex flex-column flex-lg-row gap-2">
                  <Button
                    as={Link}
                    to="/login"
                    variant="outline-light"
                    size="sm"
                    className="d-flex align-items-center justify-content-center"
                    onClick={closeNavbar}
                  >
                    <FaSignInAlt className="me-1" />
                    Iniciar Sesión
                  </Button>
                  
                  <Button
                    as={Link}
                    to="/register"
                    variant="light"
                    size="sm"
                    className="d-flex align-items-center justify-content-center"
                    onClick={closeNavbar}
                  >
                    <FaUserPlus className="me-1" />
                    Registrarse
                  </Button>
                </div>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;