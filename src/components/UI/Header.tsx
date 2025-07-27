// src/components/UI/Header.tsx
import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const [isFixed, setIsFixed] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Surveiller le scroll - même logique que le bouton ScrollToTop
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsFixed(scrollPosition > 0); // Fixed dès qu'on scroll (même 1px)
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <AppBar 
      position={isFixed ? "fixed" : "static"} // Bascule entre static et fixed
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        transition: 'all 0.3s ease-in-out',
        boxShadow: isFixed ? '0 4px 16px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.1)',
        backdropFilter: isFixed ? 'blur(12px)' : 'none',
        backgroundColor: isFixed 
          ? 'rgba(25, 118, 210, 0.95)' 
          : 'rgb(25, 118, 210)',
        // Animation quand il devient fixed
        ...(isFixed && {
          animation: 'slideDown 0.3s ease-out',
          '@keyframes slideDown': {
            from: {
              transform: 'translateY(-100%)',
              opacity: 0,
            },
            to: {
              transform: 'translateY(0)',
              opacity: 1,
            },
          },
        }),
      }}
    >
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link 
            to="/" 
            style={{ 
              textDecoration: 'none', 
              color: 'inherit',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
          >
            ⚽ AI Football
          </Link>
        </Typography>

        <Box>
          <Button
            color="inherit"
            component={Link}
            to="/"
            sx={{ 
              fontWeight: isActive("/") ? "bold" : "normal",
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.15)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            Accueil
          </Button>

          <Button
            color="inherit"
            component={Link}
            to="/matches"
            sx={{ 
              fontWeight: isActive("/matches") ? "bold" : "normal",
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.15)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            Matchs
          </Button>
          
          <Button
            color="inherit"
            component={Link}
            to="/teams"
            sx={{ 
              fontWeight: isActive("/teams") ? "bold" : "normal",
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.15)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            Équipes
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}