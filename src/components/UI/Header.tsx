// src/components/UI/Header.tsx
import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Chip } from "@mui/material";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  Sports as SportsIcon,
  Home as HomeIcon,
  Groups as GroupsIcon,
  EmojiEvents as EmojiEventsIcon
} from '@mui/icons-material';

// Hook sécurisé pour utiliser le LeagueContext
function useSafeLeague() {
  try {
    // Import dynamique pour éviter l'erreur si le contexte n'est pas disponible
    const { useLeague } = require('../../contexts/LeagueContext');
    return useLeague();
  } catch {
    // Retourne des valeurs par défaut si le contexte n'est pas disponible
    return {
      currentLeague: null,
      isLoading: false
    };
  }
}

export default function Header() {
  const [isFixed, setIsFixed] = useState(false);
  const location = useLocation();
  const { leagueId } = useParams<{ leagueId: string }>();
  
  // Utilisation sécurisée du contexte
  const { currentLeague } = useSafeLeague();

  const isActive = (path: string) => location.pathname.includes(path);
  
  // Détecter si on est dans une ligue spécifique
  const isInLeague = Boolean(leagueId && currentLeague);

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

  // Couleur dynamique selon la ligue
  const headerColor = currentLeague?.color || 'rgb(25, 118, 210)';
  const headerColorWithAlpha = currentLeague?.color 
    ? `${currentLeague.color}E6` // Ajoute de la transparence
    : 'rgba(25, 118, 210, 0.95)';

  return (
    <AppBar 
      position={isFixed ? "fixed" : "static"} // Bascule entre static et fixed
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        transition: 'all 0.3s ease-in-out',
        boxShadow: isFixed ? '0 4px 16px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.1)',
        backdropFilter: isFixed ? 'blur(12px)' : 'none',
        backgroundColor: isFixed ? headerColorWithAlpha : headerColor,
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
        {/* Logo et titre avec badge de ligue */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
          <Typography variant="h6" component="div">
            <Link 
              to="/" 
              style={{ 
                textDecoration: 'none', 
                color: 'inherit',
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ⚽ AI Football
            </Link>
          </Typography>
          
          {/* Badge de la ligue courante */}
          {isInLeague && currentLeague && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
              {currentLeague.logo && (
                <Avatar src={currentLeague.logo} sx={{ width: 28, height: 28 }} />
              )}
              <Chip 
                label={currentLeague.name} 
                size="small" 
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.75rem'
                }}
              />
            </Box>
          )}
        </Box>

        {/* Navigation contextuelle */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {/* Accueil */}
          <Button
            color="inherit"
            component={Link}
            to="/"
            startIcon={<HomeIcon sx={{ fontSize: 18 }} />}
            sx={{ 
              fontWeight: isActive("/") && !isInLeague ? "bold" : "normal",
              transition: 'all 0.2s ease',
              backgroundColor: isActive("/") && !isInLeague ? 'rgba(255,255,255,0.15)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.15)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            Accueil
          </Button>

          {/* Navigation selon le contexte */}
          {isInLeague ? (
            <>
              {/* Navigation dans une ligue spécifique */}
              <Button
                color="inherit"
                component={Link}
                to={`/league/${leagueId}/standings`}
                startIcon={<EmojiEventsIcon sx={{ fontSize: 18 }} />}
                sx={{ 
                  fontWeight: isActive("standings") ? "bold" : "normal",
                  transition: 'all 0.2s ease',
                  backgroundColor: isActive("standings") ? 'rgba(255,255,255,0.15)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                Classement
              </Button>

              <Button
                color="inherit"
                component={Link}
                to={`/league/${leagueId}/teams`}
                startIcon={<GroupsIcon sx={{ fontSize: 18 }} />}
                sx={{ 
                  fontWeight: isActive("teams") ? "bold" : "normal",
                  transition: 'all 0.2s ease',
                  backgroundColor: isActive("teams") ? 'rgba(255,255,255,0.15)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                Équipes
              </Button>

              <Button
                color="inherit"
                component={Link}
                to={`/league/${leagueId}/matches`}
                startIcon={<SportsIcon sx={{ fontSize: 18 }} />}
                sx={{ 
                  fontWeight: isActive("matches") ? "bold" : "normal",
                  transition: 'all 0.2s ease',
                  backgroundColor: isActive("matches") ? 'rgba(255,255,255,0.15)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                Matchs
              </Button>
            </>
          ) : (
            <>
              {/* Navigation globale (quand pas dans une ligue) */}
              <Button
                color="inherit"
                component={Link}
                to="/leagues"
                sx={{ 
                  fontWeight: isActive("leagues") ? "bold" : "normal",
                  transition: 'all 0.2s ease',
                  backgroundColor: isActive("leagues") ? 'rgba(255,255,255,0.15)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                Championnats
              </Button>

              {/* Liens alternatifs pour l'ancienne navigation */}
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
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}