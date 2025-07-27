import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Container,
  Paper
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Sports } from '@mui/icons-material';
import Header from '../components/UI/Header';
import BreadcrumbNavigation from '../components/UI/BreadcrumbNavigation';

export default function LeagueSelector() {
  const leagues = [
    { 
      id: 61, 
      name: 'Ligue 1', 
      country: 'France',
      countryCode: '🇫🇷', 
      description: 'Championnat français',
      logo: '🇫🇷',
      color: '#003d82'
    },
    { 
      id: 39, 
      name: 'Premier League', 
      country: 'England',
      countryCode: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 
      description: 'Championnat anglais',
      logo: '🇬🇧',
      color: '#3d1a78'
    },
    { 
      id: 140, 
      name: 'La Liga', 
      country: 'Spain',
      countryCode: '🇪🇸', 
      description: 'Championnat espagnol',
      logo: '🇪🇸',
      color: '#ff6b35'
    },
    { 
      id: 135, 
      name: 'Serie A', 
      country: 'Italy',
      countryCode: '🇮🇹', 
      description: 'Championnat italien',
      logo: '🇮🇹',
      color: '#0066cc'
    },
    { 
      id: 78, 
      name: 'Bundesliga', 
      country: 'Germany',
      countryCode: '🇩🇪', 
      description: 'Championnat allemand',
      logo: '🇩🇪',
      color: '#d20515'
    },
    { 
      id: 2, 
      name: 'Champions League', 
      country: 'Europe',
      countryCode: '🏆', 
      description: 'Compétition européenne',
      logo: '🏆',
      color: '#00387b'
    }
  ];

  return (
    <>
    <Header />
    <BreadcrumbNavigation />
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
              Choisissez votre championnat
            </Typography>
          </Box>
          
          <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
            Suivez les résultats, classements et statistiques de votre compétition préférée
          </Typography>
        </Container>
      </Box>

      {/* Section Championnats */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4} justifyContent="center">
          {leagues.map((league) => (
            <Grid item xs={12} sm={6} md={4} key={league.id}>
              <Card
                component={Link}
                to={`/league/${league.id}`}
                state={{ 
                  leagueInfo: {
                    id: league.id,
                    name: league.name,
                    country: league.country,
                    countryCode: league.countryCode,
                    description: league.description,
                    color: league.color
                  }
                }}
                sx={{
                  textDecoration: 'none',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  {/* Logo du championnat */}
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      backgroundColor: league.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px auto',
                      fontSize: '2rem'
                    }}
                  >
                    {league.logo}
                  </Box>
                  
                  {/* Nom du championnat */}
                  <Typography 
                    variant="h5" 
                    fontWeight="bold" 
                    sx={{ mb: 1, color: league.color }}
                  >
                    {league.name}
                  </Typography>
                  
                  {/* Description */}
                  <Typography 
                    variant="body1" 
                    color="text.secondary" 
                    sx={{ mb: 2 }}
                  >
                    {league.description}
                  </Typography>
                  
                  {/* Pays */}
                  <Paper
                    sx={{
                      display: 'inline-block',
                      px: 2,
                      py: 0.5,
                      backgroundColor: `${league.color}15`,
                      color: league.color,
                      fontWeight: 'bold'
                    }}
                  >
                    {league.country}
                  </Paper>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
    </>
  );
}