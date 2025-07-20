// ===== frontend/src/context/ThemeContext.js (archivo vacío) =====
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [systemPreference, setSystemPreference] = useState('light');

  // Detectar preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPreference(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Cargar tema guardado al inicializar
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  // Aplicar tema al DOM
  useEffect(() => {
    const effectiveTheme = theme === 'auto' ? systemPreference : theme;
    
    document.documentElement.setAttribute('data-bs-theme', effectiveTheme);
    document.body.className = `theme-${effectiveTheme}`;
    
    // Para Bootstrap 5
    if (effectiveTheme === 'dark') {
      document.body.classList.add('bg-dark', 'text-light');
    } else {
      document.body.classList.remove('bg-dark', 'text-light');
    }
  }, [theme, systemPreference]);

  // Función para cambiar tema
  const changeTheme = (newTheme) => {
    if (['light', 'dark', 'auto'].includes(newTheme)) {
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
    }
  };

  // Función para alternar entre light/dark
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    changeTheme(newTheme);
  };

  // Obtener tema efectivo (resuelve 'auto')
  const getEffectiveTheme = () => {
    return theme === 'auto' ? systemPreference : theme;
  };

  // Verificar si es tema oscuro
  const isDark = () => {
    return getEffectiveTheme() === 'dark';
  };

  const value = {
    theme,
    effectiveTheme: getEffectiveTheme(),
    systemPreference,
    changeTheme,
    toggleTheme,
    isDark
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de ThemeProvider');
  }
  return context;
};