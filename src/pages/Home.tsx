import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Groups as TeamsIcon,
  Timeline as StatsIcon,
  SportsFootball as MatchesIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import ScrollToTop from '../components/UI/ScrollToTop';

// Données des championnats avec des icônes via API
const championships = [
  {
    id: 'fr',
    leagueId: 61,
    name: 'France',
    code: 'FR',
    iconUrl: 'https://api.iconify.design/flag:fr-4x3.svg',
    color: '#0055A4',
    bgGradient: 'linear-gradient(135deg, #0055A4 0%, #EF4135 50%, #FFFFFF 100%)',
    bgColor: '#F8FAFF'
  },
  {
    id: 'gb',
    leagueId: 39,
    name: 'Angleterre',
    code: 'GB', 
    iconUrl: 'https://api.iconify.design/flag:gb-4x3.svg',
    color: '#C8102E',
    bgGradient: 'linear-gradient(135deg, #012169 0%, #FFFFFF 50%, #C8102E 100%)',
    bgColor: '#FFF8F8'
  },
  {
    id: 'es',
    leagueId: 140,
    name: 'Espagne',
    code: 'ES',
    iconUrl: 'https://api.iconify.design/flag:es-4x3.svg',
    color: '#C60B1E',
    bgGradient: 'linear-gradient(135deg, #C60B1E 0%, #FFC400 50%, #C60B1E 100%)',
    bgColor: '#FFF8F0'
  },
  {
    id: 'it',
    leagueId: 135,
    name: 'Italie',
    code: 'IT',
    iconUrl: 'https://api.iconify.design/flag:it-4x3.svg',
    color: '#009246',
    bgGradient: 'linear-gradient(135deg, #009246 0%, #FFFFFF 50%, #CE2B37 100%)',
    bgColor: '#F0FFF8'
  },
  {
    id: 'de',
    leagueId: 78,
    name: 'Allemagne',
    code: 'DE',
    iconUrl: 'https://api.iconify.design/flag:de-4x3.svg',
    color: '#DD0000',
    bgGradient: 'linear-gradient(135deg, #000000 0%, #DD0000 50%, #FFCE00 100%)',
    bgColor: '#FFF8F0'
  }
];

const features = [
  {
    icon: <TrophyIcon sx={{ fontSize: 48 }} />,
    title: 'Classements en temps réel',
    description: 'Suivez les classements complets avec positions, points, statistiques détaillées et formes récentes des équipes.',
    color: '#FFD700',
    bgGradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    cardBg: 'linear-gradient(135deg, #FFF9E6 0%, #FFFBF0 100%)',
    shadowColor: '#FFD700',
    link: '/leagues'
  },
  {
    icon: <TeamsIcon sx={{ fontSize: 48 }} />,
    title: 'Équipes complètes',
    description: 'Toutes les équipes avec leurs données enrichies : stats, classement, performances domicile/extérieur.',
    color: '#4CAF50',
    bgGradient: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
    cardBg: 'linear-gradient(135deg, #E8F5E8 0%, #F1F8F1 100%)',
    shadowColor: '#4CAF50',
    link: '/teams'
  },
  {
    icon: <MatchesIcon sx={{ fontSize: 48 }} />,
    title: 'Matchs et résultats',
    description: 'Calendrier des matchs, résultats récents et statistiques des rencontres.',
    color: '#2196F3',
    bgGradient: 'linear-gradient(135deg, #2196F3 0%, #1565C0 100%)',
    cardBg: 'linear-gradient(135deg, #E3F2FD 0%, #F0F8FF 100%)',
    shadowColor: '#2196F3',
    link: '/matches'
  },
  {
    icon: <StatsIcon sx={{ fontSize: 48 }} />,
    title: 'Statistiques avancées',
    description: 'Analyses poussées : meilleure attaque, défense, tendances, et performances détaillées.',
    color: '#FF9800',
    bgGradient: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
    cardBg: 'linear-gradient(135deg, #FFF3E0 0%, #FFF8F0 100%)',
    shadowColor: '#FF9800',
    link: '/matches'
  }
];

const statsData = [
  { label: 'Championnats', value: '5', icon: <TrophyIcon />, color: '#FFD700' },
  { label: 'Équipes', value: '100+', icon: <TeamsIcon />, color: '#4CAF50' },
  { label: 'Matchs/saison', value: '1000+', icon: <MatchesIcon />, color: '#2196F3' },
  { label: 'Données à jour', value: '24/7', icon: <TrendingIcon />, color: '#FF9800' }
];

export default function Home() {
  const theme = useTheme();

  return (
    <Layout>
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          py: 8,
          mb: 6,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box textAlign="center">
            <Typography variant="h2" component="h1" fontWeight="bold" mb={2}>
              AI Football ⚽
            </Typography>
            <Typography variant="h5" mb={4} sx={{ opacity: 0.9 }}>
              Tout ce dont vous avez besoin pour suivre le football moderne
            </Typography>
            
            {/* Stats Banner */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 4,
                mt: 4,
                py: 4,
                px: 6,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                borderRadius: 4,
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              {statsData.map((stat, index) => (
                <Box key={index} textAlign="center">
                  <Box 
                    sx={{ 
                      color: stat.color, 
                      mb: 1,
                      filter: 'brightness(1.3)',
                      '& svg': { fontSize: '2rem' }
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Fonctionnalités Section */}
        <Box 
          mb={8}
          sx={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: 4,
            p: 6,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}
        >
          <Typography variant="h3" textAlign="center" mb={2} fontWeight="bold">
            Fonctionnalités principales
          </Typography>
          <Typography 
            variant="h6" 
            textAlign="center" 
            mb={6} 
            color="text.secondary"
          >
            Tout ce dont vous avez besoin pour suivre le football moderne
          </Typography>

          <Grid container spacing={4} sx={{ width: '100%' }}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} key={index} sx={{ width: '100%' }}>
                <Box
                  sx={{
                    background: feature.cardBg,
                    borderRadius: 4,
                    p: 4,
                    mb: 2,
                    minHeight: '280px',
                    boxShadow: `0 8px 32px ${alpha(feature.shadowColor, 0.15)}`,
                    border: `2px solid ${alpha(feature.color, 0.2)}`,
                  }}
                >
                  <Card
                    component={Link}
                    to={feature.link}
                    sx={{
                      height: '100%',
                      width: '100%',
                      textDecoration: 'none',
                      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      cursor: 'pointer',
                      background: 'transparent',
                      boxShadow: 'none',
                      border: 'none',
                      borderRadius: 0,
                      overflow: 'visible',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        '& .feature-icon': {
                          transform: 'scale(1.1) rotate(5deg)',
                        }
                      }
                    }}
                  >
                    <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column', '&:last-child': { pb: 0 } }}>
                      <Box
                        className="feature-icon"
                        sx={{
                          width: 90,
                          height: 90,
                          borderRadius: '24px',
                          background: feature.bgGradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 3,
                          color: 'white',
                          transition: 'transform 0.3s ease',
                          boxShadow: `0 8px 24px ${alpha(feature.color, 0.4)}`
                        }}
                      >
                        {feature.icon}
                      </Box>
                      
                      <Typography variant="h5" fontWeight="bold" mb={2} color="text.primary">
                        {feature.title}
                      </Typography>
                      
                      <Typography variant="body1" color="text.secondary" lineHeight={1.7} mb={3} sx={{ flexGrow: 1 }}>
                        {feature.description}
                      </Typography>
                      
                      <Button
                        variant="outlined"
                        sx={{
                          borderColor: feature.color,
                          color: feature.color,
                          fontWeight: 'bold',
                          px: 3,
                          py: 1,
                          borderRadius: 2,
                          alignSelf: 'flex-start',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: feature.bgGradient,
                            color: 'white',
                            borderColor: feature.color,
                            transform: 'translateY(-2px)',
                            boxShadow: `0 6px 16px ${alpha(feature.color, 0.3)}`
                          }
                        }}
                      >
                        DÉCOUVRIR
                      </Button>
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 6, background: 'linear-gradient(90deg, transparent, #ddd, transparent)' }} />

        {/* Championnats Section */}
        <Box 
          mb={8}
          sx={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: 4,
            p: 6,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}
        >
          <Typography variant="h3" textAlign="center" mb={2} fontWeight="bold">
            Championnats disponibles
          </Typography>
          <Typography 
            variant="h6" 
            textAlign="center" 
            mb={6} 
            color="text.secondary"
          >
            Les plus grandes compétitions européennes à votre portée
          </Typography>

          <Grid container spacing={2} justifyContent="center" sx={{ width: '100%' }}>
            {championships.map((championship) => (
              <Grid item xs={2} sm={2} md={2} key={championship.id} sx={{ width: 'auto' }}>
                <Box
                  sx={{
                    background: championship.bgColor,
                    borderRadius: 4,
                    p: 2,
                    mb: 1,
                    minHeight: '140px',
                    boxShadow: `0 6px 24px ${alpha(championship.color, 0.12)}`,
                    border: `2px solid ${alpha(championship.color, 0.2)}`,
                  }}
                >
                  <Card
                    component={Link}
                    to={`/league/${championship.leagueId}/standings`}
                    sx={{
                      textDecoration: 'none',
                      height: '100%',
                      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      cursor: 'pointer',
                      background: 'transparent',
                      boxShadow: 'none',
                      border: 'none',
                      borderRadius: 0,
                      overflow: 'visible',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.05)',
                        '& .championship-flag': {
                          transform: 'scale(1.2)',
                        }
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 2, position: 'relative', zIndex: 1 }}>
                      <Box
                        className="championship-flag"
                        sx={{ 
                          mb: 2,
                          transition: 'transform 0.3s ease',
                          display: 'flex',
                          justifyContent: 'center'
                        }}
                      >
                        <img 
                          src={championship.iconUrl} 
                          alt={`Drapeau ${championship.name}`}
                          style={{
                            width: '60px',
                            height: '45px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        />
                      </Box>
                      
                      <Typography 
                        variant="h6" 
                        fontWeight="bold"
                        sx={{ 
                          color: championship.color,
                          fontSize: '1.2rem',
                          mb: 1,
                          textShadow: `0 1px 2px ${alpha(championship.color, 0.2)}`
                        }}
                      >
                        {championship.code}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        fontWeight="medium"
                      >
                        {championship.name}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
    <ScrollToTop />
    </Layout>
  );
}