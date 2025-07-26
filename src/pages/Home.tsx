import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Container,
  Avatar,
  Paper
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  Sports,
  EmojiEvents,
  Group,
  Timeline,
  TrendingUp,
  Speed,
  Update,
  Search
} from '@mui/icons-material';

export default function Home() {
  const features = [
    {
      icon: <EmojiEvents sx={{ fontSize: 40, color: '#FFD700' }} />,
      title: 'Classements en temps réel',
      description: 'Suivez les classements complets avec positions, points, statistiques détaillées et formes récentes des équipes.',
      link: '/'
    },
    {
      icon: <Group sx={{ fontSize: 40, color: '#4CAF50' }} />,
      title: 'Équipes complètes',
      description: 'Toutes les équipes avec leurs données enrichies : stats, classement, performances domicile/extérieur.',
      link: '/'
    },
    {
      icon: <Timeline sx={{ fontSize: 40, color: '#2196F3' }} />,
      title: 'Matchs et résultats',
      description: 'Calendrier des matchs, résultats récents et statistiques des rencontres.',
      link: '/'
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: '#FF9800' }} />,
      title: 'Statistiques avancées',
      description: 'Analyses poussées : meilleure attaque, défense, tendances, et performances détaillées.',
      link: '/'
    }
  ];

  const advantages = [
    {
      icon: <Speed sx={{ color: '#4CAF50' }} />,
      title: 'Rapide et fluide',
      description: 'Cache intelligent pour une navigation instantanée'
    },
    {
      icon: <Update sx={{ color: '#2196F3' }} />,
      title: 'Données à jour',
      description: 'API Football pour des informations fraîches'
    },
    {
      icon: <Search sx={{ color: '#FF9800' }} />,
      title: 'Recherche avancée',
      description: 'Filtres et tri pour trouver rapidement ce que vous cherchez'
    }
  ];

  const leagues = [
    { name: 'Ligue 1', country: 'France', logo: '🇫🇷', color: '#1976d2', id: 61 },
    { name: 'Premier League', country: 'Angleterre', logo: '🇬🇧', color: '#673ab7', id: 39 },
    { name: 'La Liga', country: 'Espagne', logo: '🇪🇸', color: '#ff5722', id: 140 },
    { name: 'Serie A', country: 'Italie', logo: '🇮🇹', color: '#4caf50', id: 135 },
    { name: 'Bundesliga', country: 'Allemagne', logo: '🇩🇪', color: '#f44336', id: 78 },
    { name: 'Champions League', country: 'Europe', logo: '🏆', color: '#ffc107', id: 2 }
  ];

  return (
    <Box>
      {/* Section Hero */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Box display="flex" justifyContent="center" alignItems="center" mb={3}>
            <Sports sx={{ fontSize: 60, mr: 2 }} />
            <Typography variant="h2" fontWeight="bold">
              AI Football
            </Typography>
          </Box>
          
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Votre plateforme complète pour suivre les championnats de football
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Classements en temps réel, statistiques détaillées, données d'équipes enrichies 
            et analyses poussées pour tous les grands championnats européens.
          </Typography>
          
          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/leagues"
              sx={{
                backgroundColor: 'white',
                color: '#667eea',
                fontWeight: 'bold',
                px: 4,
                '&:hover': {
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              Choisir un championnat
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Section Fonctionnalités principales */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" textAlign="center" fontWeight="bold" mb={2}>
          Fonctionnalités principales
        </Typography>
        
        <Typography variant="body1" textAlign="center" color="text.secondary" mb={6}>
          Tout ce dont vous avez besoin pour suivre le football moderne
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}
              >
                <CardContent sx={{ pb: 1 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    {feature.icon}
                    <Typography variant="h6" fontWeight="bold" ml={2}>
                      {feature.title}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    {feature.description}
                  </Typography>
                </CardContent>
                
                <CardActions>
                  <Button 
                    component={Link} 
                    to="/leagues"
                    sx={{ ml: 1 }}
                  >
                    Découvrir
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Section Championnats disponibles */}
      <Box sx={{ backgroundColor: '#f8f9fa', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" textAlign="center" fontWeight="bold" mb={2}>
            Championnats disponibles
          </Typography>
          
          <Typography variant="body1" textAlign="center" color="text.secondary" mb={6}>
            Les plus grandes compétitions européennes à votre portée
          </Typography>

          <Grid container spacing={3} justifyContent="center">
            {leagues.map((league, index) => (
              <Grid item xs={6} sm={4} md={2} key={index}>
                <Paper
                  component={Link}
                  to={`/league/${league.id}`}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: 3
                    }
                  }}
                >
                  <Typography variant="h4" mb={1}>
                    {league.logo}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight="bold" color={league.color}>
                    {league.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {league.country}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Section Avantages */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" textAlign="center" fontWeight="bold" mb={6}>
          Pourquoi AI Football ?
        </Typography>

        <Grid container spacing={4}>
          {advantages.map((advantage, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Box textAlign="center">
                <Avatar 
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    mx: 'auto', 
                    mb: 2,
                    backgroundColor: 'transparent'
                  }}
                >
                  {advantage.icon}
                </Avatar>
                
                <Typography variant="h6" fontWeight="bold" mb={1}>
                  {advantage.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  {advantage.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Section statistiques */}
      <Box sx={{ backgroundColor: '#1976d2', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} textAlign="center">
            <Grid item xs={6} md={3}>
              <Typography variant="h3" fontWeight="bold">
                6
              </Typography>
              <Typography variant="body1">
                Championnats
              </Typography>
            </Grid>
            
            <Grid item xs={6} md={3}>
              <Typography variant="h3" fontWeight="bold">
                100+
              </Typography>
              <Typography variant="body1">
                Équipes
              </Typography>
            </Grid>
            
            <Grid item xs={6} md={3}>
              <Typography variant="h3" fontWeight="bold">
                1000+
              </Typography>
              <Typography variant="body1">
                Matchs/saison
              </Typography>
            </Grid>
            
            <Grid item xs={6} md={3}>
              <Typography variant="h3" fontWeight="bold">
                24/7
              </Typography>
              <Typography variant="body1">
                Données à jour
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Call to action final */}
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight="bold" mb={2}>
          Prêt à commencer ?
        </Typography>
        
        <Typography variant="body1" color="text.secondary" mb={4}>
          Choisissez votre championnat préféré et plongez dans l'univers du football
        </Typography>
        
        <Button
          variant="contained"
          size="large"
          component={Link}
          to="/leagues"
          sx={{ px: 6, py: 2, fontSize: '1.1rem' }}
        >
          Commencer maintenant
        </Button>
      </Container>
    </Box>
  );
}