// frontend/src/components/common/Spinner.jsx
import React from 'react';
import { Spinner as BootstrapSpinner } from 'react-bootstrap';
import './Styles/Spinner.css';

const Spinner = ({ 
  variant = 'primary', 
  size = 'md', 
  type = 'border',
  text = 'Cargando...',
  centered = false,
  overlay = false,
  fullScreen = false,
  show = true,
  className = '',
  style = {},
  ...props 
}) => {
  // No renderizar si show es false
  if (!show) return null;

  // Determinar el tamaño del spinner
  const getSpinnerSize = () => {
    switch (size) {
      case 'sm':
        return 'sm';
      case 'lg':
        return 'lg';
      case 'xl':
        return 'xl';
      default:
        return undefined;
    }
  };

  // Crear el spinner básico
  const spinnerElement = (
    <BootstrapSpinner
      animation={type}
      variant={variant}
      size={getSpinnerSize()}
      className={`custom-spinner ${className}`}
      style={style}
      role="status"
      aria-hidden="true"
      {...props}
    />
  );

  // Spinner con texto
  const spinnerWithText = (
    <div className={`spinner-container ${centered ? 'text-center' : ''}`}>
      {spinnerElement}
      {text && (
        <div className="spinner-text mt-2">
          <span className="text-muted">{text}</span>
        </div>
      )}
    </div>
  );

  // Spinner centrado
  if (centered && !overlay && !fullScreen) {
    return (
      <div className="d-flex justify-content-center align-items-center p-4">
        {spinnerWithText}
      </div>
    );
  }

  // Spinner en overlay
  if (overlay) {
    return (
      <div className="spinner-overlay">
        <div className="spinner-overlay-content">
          {spinnerWithText}
        </div>
      </div>
    );
  }

  // Spinner en pantalla completa
  if (fullScreen) {
    return (
      <div className="spinner-fullscreen">
        <div className="spinner-fullscreen-content">
          {spinnerWithText}
        </div>
      </div>
    );
  }

  // Spinner simple
  return text ? spinnerWithText : spinnerElement;
};

// Componentes especializados

// Spinner para botones
export const ButtonSpinner = ({ size = 'sm', className = '', ...props }) => (
  <BootstrapSpinner
    animation="border"
    size={size}
    className={`button-spinner ${className}`}
    role="status"
    aria-hidden="true"
    {...props}
  />
);

// Spinner para páginas completas
export const PageSpinner = ({ text = 'Cargando página...', ...props }) => (
  <Spinner
    size="lg"
    centered
    fullScreen
    text={text}
    {...props}
  />
);

// Spinner para secciones
export const SectionSpinner = ({ text = 'Cargando...', height = '200px', ...props }) => (
  <div className="section-spinner" style={{ minHeight: height }}>
    <Spinner
      centered
      text={text}
      {...props}
    />
  </div>
);

// Spinner para cartas/tarjetas
export const CardSpinner = ({ text = 'Cargando...', ...props }) => (
  <div className="card-spinner p-4">
    <Spinner
      size="sm"
      centered
      text={text}
      {...props}
    />
  </div>
);

// Spinner para overlays de contenido
export const ContentSpinner = ({ text = 'Procesando...', ...props }) => (
  <Spinner
    overlay
    text={text}
    {...props}
  />
);

// Spinner gaming personalizado
export const GamingSpinner = ({ text = 'Cargando experiencia gaming...', ...props }) => (
  <div className="gaming-spinner-container">
    <div className="gaming-spinner">
      <div className="gaming-controller">
        🎮
      </div>
      <BootstrapSpinner animation="border" variant="primary" />
    </div>
    {text && (
      <div className="gaming-spinner-text mt-3">
        <span className="text-primary fw-bold">{text}</span>
      </div>
    )}
  </div>
);

// Spinner para datos en tiempo real
export const LiveDataSpinner = ({ text = 'Actualizando datos...', ...props }) => (
  <div className="live-data-spinner">
    <div className="pulse-dot"></div>
    <BootstrapSpinner animation="grow" size="sm" variant="success" />
    {text && <small className="ms-2 text-muted">{text}</small>}
  </div>
);

// Spinner para subida de archivos
export const UploadSpinner = ({ progress = 0, text = 'Subiendo archivo...', ...props }) => (
  <div className="upload-spinner">
    <div className="d-flex align-items-center">
      <BootstrapSpinner animation="border" size="sm" variant="info" />
      <div className="ms-3 flex-grow-1">
        <div className="upload-text">{text}</div>
        {progress > 0 && (
          <div className="progress mt-1" style={{ height: '4px' }}>
            <div 
              className="progress-bar bg-info" 
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  </div>
);

// Spinner con puntos animados
export const DotsSpinner = ({ text = 'Cargando', color = 'primary', ...props }) => (
  <div className="dots-spinner">
    <span className={`text-${color}`}>{text}</span>
    <div className="dots-animation">
      <span className={`dot bg-${color}`}></span>
      <span className={`dot bg-${color}`}></span>
      <span className={`dot bg-${color}`}></span>
    </div>
  </div>
);

// Spinner skeleton para contenido
export const SkeletonSpinner = ({ lines = 3, height = '20px', className = '', ...props }) => (
  <div className={`skeleton-spinner ${className}`}>
    {Array.from({ length: lines }, (_, index) => (
      <div 
        key={index}
        className="skeleton-line"
        style={{ 
          height,
          width: index === lines - 1 ? '60%' : '100%'
        }}
      />
    ))}
  </div>
);

// HOC para envolver componentes con spinner
export const withSpinner = (WrappedComponent) => {
  return ({ loading, spinnerProps = {}, ...props }) => {
    if (loading) {
      return <Spinner centered {...spinnerProps} />;
    }
    return <WrappedComponent {...props} />;
  };
};

// Hook personalizado para manejar estados de carga
export const useSpinner = (initialState = false) => {
  const [loading, setLoading] = React.useState(initialState);
  
  const showSpinner = React.useCallback(() => setLoading(true), []);
  const hideSpinner = React.useCallback(() => setLoading(false), []);
  const toggleSpinner = React.useCallback(() => setLoading(prev => !prev), []);
  
  return {
    loading,
    showSpinner,
    hideSpinner,
    toggleSpinner,
    setLoading
  };
};

export default Spinner;