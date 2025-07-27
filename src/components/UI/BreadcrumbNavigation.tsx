import React from 'react';
import { 
  Breadcrumbs, 
  Typography, 
  Link as MuiLink, 
  Box,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  EmojiEvents as TrophyIcon,
  Groups as TeamsIcon,
  SportsFootball as MatchesIcon
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

// Mapping des routes vers les informations de navigation
const routeMapping = {
  '/': {
    title: 'Accueil',
    icon: <HomeIcon sx={{ fontSize: 16 }} />,
    color: '#1976d2'
  },
  '/leagues': {
    title: 'Championnats',
    icon: <TrophyIcon sx={{ fontSize: 16 }} />,
    color: '#FFD700'
  },
  '/teams': {
    title: 'Équipes',
    icon: <TeamsIcon sx={{ fontSize: 16 }} />,
    color: '#4CAF50'
  },
  '/matches': {
    title: 'Matchs',
    icon: <MatchesIcon sx={{ fontSize: 16 }} />,
    color: '#2196F3'
  },
  '/league/:id/standings': {
    title: 'Classement',
    icon: <TrophyIcon sx={{ fontSize: 16 }} />,
    color: '#FFD700'
  }
};

// Mapping des ligues par ID
const leagueNames = {
  '61': 'Ligue 1 🇫🇷',
  '39': 'Premier League 🇬🇧', 
  '140': 'La Liga 🇪🇸',
  '135': 'Serie A 🇮🇹',
  '78': 'Bundesliga 🇩🇪'
};

interface BreadcrumbItem {
  title: string;
  path: string;
  icon?: React.ReactNode;
  color?: string;
  isActive?: boolean;
}

export default function BreadcrumbNavigation() {
  const location = useLocation();
  const theme = useTheme();

  // Fonction pour générer les breadcrumbs basés sur la route actuelle
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Toujours ajouter l'accueil
    breadcrumbs.push({
      title: 'Accueil',
      path: '/',
      icon: <HomeIcon sx={{ fontSize: 16 }} />,
      color: '#1976d2'
    });

    // Traitement spécial pour les routes de ligue
    if (pathSegments.length >= 3 && pathSegments[0] === 'league' && pathSegments[2] === 'standings') {
      const leagueId = pathSegments[1];
      
      breadcrumbs.push({
        title: 'Championnats',
        path: '/leagues',
        icon: <TrophyIcon sx={{ fontSize: 16 }} />,
        color: '#FFD700'
      });

      breadcrumbs.push({
        title: leagueNames[leagueId] || `Ligue ${leagueId}`,
        path: `/league/${leagueId}/standings`,
        icon: <TrophyIcon sx={{ fontSize: 16 }} />,
        color: '#FFD700',
        isActive: true
      });

      return breadcrumbs;
    }

    // Traitement pour les autres routes
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      const routeInfo = routeMapping[currentPath];
      if (routeInfo) {
        breadcrumbs.push({
          title: routeInfo.title,
          path: currentPath,
          icon: routeInfo.icon,
          color: routeInfo.color,
          isActive: isLast
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <Box 
      sx={{ 
        py: 2, 
        px: 3,
        backgroundColor: alpha(theme.palette.primary.main, 0.02),
        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        backdropFilter: 'blur(8px)'
      }}
    >
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" sx={{ color: 'text.secondary' }} />}
        aria-label="breadcrumb"
        sx={{
          '& .MuiBreadcrumbs-separator': {
            mx: 1
          }
        }}
      >
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          if (isLast || item.isActive) {
            return (
              <Chip
                key={item.path}
                icon={item.icon}
                label={item.title}
                variant="filled"
                size="small"
                sx={{
                  backgroundColor: item.color,
                  color: 'white',
                  fontWeight: 'bold',
                  '& .MuiChip-icon': {
                    color: 'white'
                  },
                  boxShadow: `0 2px 8px ${alpha(item.color || theme.palette.primary.main, 0.3)}`
                }}
              />
            );
          }

          return (
            <MuiLink
              key={item.path}
              component={Link}
              to={item.path}
              underline="none"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: 'text.primary',
                fontSize: '0.875rem',
                fontWeight: 500,
                padding: '4px 8px',
                borderRadius: 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: alpha(item.color || theme.palette.primary.main, 0.1),
                  color: item.color || theme.palette.primary.main,
                  transform: 'translateY(-1px)'
                }
              }}
            >
              {item.icon}
              {item.title}
            </MuiLink>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
}