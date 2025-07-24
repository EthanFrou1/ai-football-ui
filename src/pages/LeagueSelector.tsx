import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Avatar,
  Chip,
  Container
} from '@mui/material';

// Championnats majeurs
const MAJOR_LEAGUES = [
  {
    id: 61,
    name: "Ligue 1",
    country: "France",
    countryCode: "🇫🇷",
    logo: "https://media.api-sports.io/football/leagues/61.png",
    color: "#003d82",
    description: "Championnat français"
  },
  {
    id: 39,
    name: "Premier League",
    country: "England", 
    countryCode: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    logo: "https://media.api-sports.io/football/leagues/39.png",
    color: "#3d1a78",
    description: "Championnat anglais"
  },
  {
    id: 140,
    name: "La Liga",
    country: "Spain",
    countryCode: "🇪🇸", 
    logo: "https://media.api-sports.io/football/leagues/140.png",
    color: "#ff6b35",
    description: "Championnat espagnol"
  },
  {
    id: 135,
    name: "Serie A",
    country: "Italy",
    countryCode: "🇮🇹",
    logo: "https://media.api-sports.io/football/leagues/135.png",
    color: "#0066cc",
    description: "Championnat italien"
  },
  {
    id: 78,
    name: "Bundesliga",
    country: "Germany",
    countryCode: "🇩🇪",
    logo: "https://media.api-sports.io/football/leagues/78.png",
    color: "#d20515",
    description: "Championnat allemand"
  },
  {
    id: 2,
    name: "Champions League",
    country: "Europe",
    countryCode: "🏆",
    logo: "https://media.api-sports.io/football/leagues/2.png",
    color: "#00387b",
    description: "Compétition européenne"
  }
];

export default function LeagueSelector() {
  const navigate = useNavigate();

  const handleLeagueSelect = (league: typeof MAJOR_LEAGUES[0]) => {
    // Naviguer vers le dashboard de la ligue
    navigate(`/league/${league.id}`, { 
      state: { leagueInfo: league }
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        pt: 4,
        pb: 6
      }}
    >
      <Container maxWidth="lg">
        {/* En-tête */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h2" 
            sx={{ 
              color: 'white', 
              fontWeight: 700,
              mb: 2,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            ⚽ Choisissez votre championnat
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 300
            }}
          >
            Suivez les résultats, classements et statistiques de votre compétition préférée
          </Typography>
        </Box>

        {/* Grille des championnats */}
        <Grid container spacing={4}>
          {MAJOR_LEAGUES.map((league) => (
            <Grid item xs={12} sm={6} md={4} key={league.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: 'white',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 24px rgba(0,0,0,0.15)`,
                  },
                  '&:active': {
                    transform: 'translateY(-4px)',
                  },
                  border: `3px solid transparent`,
                  '&:hover': {
                    borderColor: league.color,
                  }
                }}
                onClick={() => handleLeagueSelect(league)}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  {/* Logo + Drapeau */}
                  <Box sx={{ position: 'relative', mb: 3 }}>
                    <Avatar
                      src={league.logo}
                      alt={league.name}
                      sx={{
                        width: 80,
                        height: 80,
                        margin: '0 auto',
                        border: `3px solid ${league.color}`,
                        boxShadow: `0 4px 12px ${league.color}33`
                      }}
                    />
                    <Typography
                      sx={{
                        position: 'absolute',
                        top: -10,
                        right: '50%',
                        transform: 'translateX(50%)',
                        fontSize: '2rem'
                      }}
                    >
                      {league.countryCode}
                    </Typography>
                  </Box>

                  {/* Nom du championnat */}
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 700,
                      color: league.color,
                      mb: 1
                    }}
                  >
                    {league.name}
                  </Typography>

                  {/* Description */}
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {league.description}
                  </Typography>

                  {/* Badge */}
                  <Chip
                    label={league.country}
                    sx={{
                      backgroundColor: `${league.color}15`,
                      color: league.color,
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: `${league.color}25`,
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.9rem'
            }}
          >
            ✨ Données en temps réel via API Football
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}