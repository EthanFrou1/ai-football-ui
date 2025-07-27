// src/components/UI/ScrollToTop.tsx
import React, { useState, useEffect } from 'react';
import { Fab, useTheme } from '@mui/material';
import { KeyboardArrowUp } from '@mui/icons-material';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const theme = useTheme();

  // Surveiller le scroll pour afficher/masquer le bouton
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  // Fonction pour remonter en haut
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Affichage conditionnel simple
  if (!isVisible) {
    return null;
  }

  return (
    <Fab
      onClick={scrollToTop}
      color="primary"
      size="medium"
      aria-label="Remonter en haut"
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24, // ← Remis à droite
        zIndex: 9999,
        boxShadow: '0 4px 16px rgba(25, 118, 210, 0.4)',
        transition: 'all 0.3s ease',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1)' : 'scale(0)',
        backgroundColor: theme.palette.primary.main,
        color: 'white',
        '&:hover': {
          backgroundColor: theme.palette.primary.dark,
          transform: 'scale(1.1)',
          boxShadow: '0 6px 20px rgba(25, 118, 210, 0.6)',
        },
        '&:active': {
          transform: 'scale(0.95)',
        }
      }}
    >
      <KeyboardArrowUp sx={{ fontSize: 28 }} />
    </Fab>
  );
}