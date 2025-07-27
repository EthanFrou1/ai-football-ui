// src/components/Layout/Layout.tsx
import React, { useState, useEffect } from 'react';
import { Box, Toolbar } from '@mui/material';
import Header from '../UI/Header';
import ScrollToTop from '../UI/ScrollToTop';

interface LayoutProps {
  children: React.ReactNode;
  showBreadcrumb?: boolean;
  breadcrumbComponent?: React.ReactNode;
}

export default function Layout({ children, showBreadcrumb = false, breadcrumbComponent }: LayoutProps) {
  const [isFixed, setIsFixed] = useState(false);

  // Même logique que le Header et ScrollToTop
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsFixed(scrollPosition > 0); // Fixed dès qu'on scroll
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header (position dynamique) */}
      <Header />
      
      {/* Toolbar pour compenser le header fixed SEULEMENT quand il est fixed */}
      {isFixed && <Toolbar />}
      
      {/* Breadcrumb optionnel */}
      {showBreadcrumb && breadcrumbComponent}
      
      {/* Contenu principal */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          position: 'relative',
          zIndex: 1
        }}
      >
        {children}
      </Box>
      
      {/* Bouton de retour en haut */}
      <ScrollToTop />
    </Box>
  );
}