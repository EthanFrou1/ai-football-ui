import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Avatar,
  Container,
  Breadcrumbs,
  Link,
  IconButton,
  Chip
} from '@mui/material';
import { ArrowBack, EmojiEvents, Groups, SportsFootball, BarChart } from '@mui/icons-material';

export default function LeagueDashboard() {
  const { leagueId } = useParams<{ leagueId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Récupérer les infos de la ligue depuis le state ou API
  const leagueInfo = location.state?.leagueInfo;

  // Sections principales du dashboard
  const sections = [
    {
      id: 'standings',
      title: 'Classement',
      description: 'Voir le classement complet',
      icon: <EmojiEvents sx={{ fontSize: 40, color: '#ffd700' }} />,
      path: `/league/${leagueId}/standings`,
      color: '#ffd700',
      gradient: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)'
    },
    {
      id: 'teams',
      title: 'Équipes',
      description: 'Toutes les équipes du championnat',
      icon: <Groups sx={{ fontSize: 40, color: '#4f46e5' }} />,
      path: `/league/${leagueId}/teams`,
      color: '#4f46e5',
      gradient: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
    },
    {
      id: 'matches',
      title: 'Matchs',
      description: 'Calendrier et résultats',
      icon: <SportsFootball sx={{ fontSize: 40, color: '#059669' }} />,
      path: `/league/${leagueId}/matches`,
      color: '#059669',
      gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
    },
    {
      id: 'stats',
      title: 'Statistiques',
      description: 'Stats et performances',
      icon: <BarChart sx={{ fontSize: 40, color: '#dc2626' }} />,
      path: `/league/${leagueId}/stats`,
      color: '#dc2626',
      gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'
    }
  ];

  const handleSectionClick = (section: typeof sections[0]) => {
    navigate(section.path, {
      state: { leagueInfo }
    });
  };

  const handleBack = () => {
    navigate('/');
  };

  if (!leagueInfo) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5">Chargement...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Header avec retour */}
      <Box 
        sx={{ 
          background: leagueInfo.color || '#1976d2',
          color: 'white',
          py: 3,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            opacity: 0.1
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <IconButton onClick={handleBack} sx={{ color: 'white' }}>
                <ArrowBack />
              </IconButton>
            </Grid>
            
            <Grid item>
              <Avatar
                src={leagueInfo.logo}
                alt={leagueInfo.name}
                sx={{ width: 60, height: 60, border: '3px solid white' }}
              />
            </Grid>
            
            <Grid item xs>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {leagueInfo.name}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {leagueInfo.countryCode} {leagueInfo.description}
              </Typography>
              <Chip 
                label="Saison 2024-25" 
                size="small"
                sx={{ 
                  mt: 1,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white'
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Contenu principal */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Fil d'Ariane */}
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link 
            underline="hover" 
            color="inherit" 
            onClick={handleBack}
            sx={{ cursor: 'pointer' }}
          >
            Championnats
          </Link>
          <Typography color="text.primary">{leagueInfo.name}</Typography>
        </Breadcrumbs>

        {/* Titre */}
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
          Que voulez-vous consulter ?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Explorez toutes les données de {leagueInfo.name}
        </Typography>

        {/* Grille des sections */}
        <Grid container spacing={3}>
          {sections.map((section) => (
            <Grid item xs={12} sm={6} md={3} key={section.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 25px ${section.color}40`,
                  },
                  border: '2px solid transparent',
                  '&:hover': {
                    borderColor: section.color,
                  }
                }}
                onClick={() => handleSectionClick(section)}
              >
                <CardContent sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                  {/* Icône avec background coloré */}
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: section.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      boxShadow: `0 4px 12px ${section.color}40`
                    }}
                  >
                    {section.icon}
                  </Box>

                  {/* Titre */}
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      mb: 1,
                      color: section.color
                    }}
                  >
                    {section.title}
                  </Typography>

                  {/* Description */}
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                  >
                    {section.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Section infos rapides */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Aperçu rapide
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                    20
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Équipes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                    38
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Journées
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                    380
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Matchs total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}