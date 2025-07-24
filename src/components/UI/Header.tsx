import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Avatar,
  IconButton,
  Chip
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ArrowBack } from '@mui/icons-material';
import { useLeague } from '../../contexts/LeagueContext';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentLeague } = useLeague();

  const handleHome = () => {
    if (currentLeague) {
      navigate(`/league/${currentLeague.id}`);
    } else {
      navigate('/');
    }
  };

  const handleChangeLeague = () => {
    navigate('/');
  };

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/standings')) return 'standings';
    if (path.includes('/teams')) return 'teams';
    if (path.includes('/matches')) return 'matches';
    if (path.includes('/stats')) return 'stats';
    return '';
  };

  const navigateToSection = (section: string) => {
    if (currentLeague) {
      navigate(`/league/${currentLeague.id}/${section}`);
    }
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        background: currentLeague ? 
          `linear-gradient(90deg, ${currentLeague.color} 0%, ${currentLeague.color}dd 100%)` :
          'linear-gradient(90deg, #1976d2 0%, #1565c0 100%)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}
    >
      <Toolbar>
        {/* Logo + Nom de l'app */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
          <IconButton 
            onClick={handleHome}
            sx={{ color: 'white', mr: 1 }}
          >
            <Home />
          </IconButton>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              color: 'white'
            }}
          >
            AI Football
          </Typography>
        </Box>

        {/* Informations de la ligue courante */}
        {currentLeague && (
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
            <Avatar
              src={currentLeague.logo}
              alt={currentLeague.name}
              sx={{ width: 32, height: 32, mr: 2 }}
            />
            <Box>
              <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                {currentLeague.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                {currentLeague.description}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Espace flexible */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Navigation principale (si dans une ligue) */}
        {currentLeague && (
          <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
            {[
              { key: 'standings', label: 'Classement' },
              { key: 'teams', label: 'Équipes' },
              { key: 'matches', label: 'Matchs' },
              { key: 'stats', label: 'Stats' }
            ].map(({ key, label }) => (
              <Button
                key={key}
                onClick={() => navigateToSection(key)}
                sx={{
                  color: 'white',
                  fontWeight: getActiveTab() === key ? 700 : 400,
                  backgroundColor: getActiveTab() === key ? 'rgba(255,255,255,0.2)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                  borderRadius: 2,
                  px: 2
                }}
              >
                {label}
              </Button>
            ))}
          </Box>
        )}

        {/* Bouton changer de championnat */}
        <Button
          onClick={handleChangeLeague}
          variant="outlined"
          sx={{
            color: 'white',
            borderColor: 'rgba(255,255,255,0.5)',
            '&:hover': {
              borderColor: 'white',
              backgroundColor: 'rgba(255,255,255,0.1)',
            },
            borderRadius: 2
          }}
        >
          Changer de championnat
        </Button>
      </Toolbar>
    </AppBar>
  );
}