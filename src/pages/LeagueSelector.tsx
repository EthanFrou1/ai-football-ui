import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Container,
  Paper,
  alpha,
  LinearProgress,
  Skeleton,
  Chip
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Sports, TrendingUp, Groups, EmojiEvents } from '@mui/icons-material';
import Header from '../components/UI/Header';
import BreadcrumbNavigation from '../components/UI/BreadcrumbNavigation';

// Types pour les données de l'API
interface LeagueData {
  id: number;
  name: string;
  country: string;
  countryCode: string;
  description: string;
  logo: string;
  color: string;
  gradient: string;
  backgroundColor: string;
  teams: number;
  totalRounds: number;
  currentRound: number;
  season: string;
}

// Configuration des championnats avec styles et logos API
const leagueConfigs = {
  61: { // Ligue 1
    color: '#1e3a8a',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    backgroundColor: '#eff6ff',
    countryCode: 'FR',
    description: 'Championnat français'
  },
  39: { // Premier League
    color: '#581c87',
    gradient: 'linear-gradient(135deg, #581c87 0%, #8b5cf6 100%)',
    backgroundColor: '#faf5ff',
    countryCode: 'EN',
    description: 'Championnat anglais'
  },
  140: { // La Liga
    color: '#f18e00',
    gradient: 'linear-gradient(135deg, #f18e00 0%, rgb(238 142 3 / 80%) 100%)',
    backgroundColor: '#fef2f2',
    countryCode: 'ES',
    description: 'Championnat espagnol'
  },
  135: { // Serie A
    color: '#059669',
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    backgroundColor: '#ecfdf5',
    countryCode: 'IT',
    description: 'Championnat italien'
  },
  78: { // Bundesliga
    color: '#b91c1c',
    gradient: 'linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)',
    backgroundColor: '#fef2f2',
    countryCode: 'DE',
    description: 'Championnat allemand'
  }
};

// Fonction pour obtenir le nom correct du championnat
const getLeagueName = (leagueId: number): string => {
  const names: { [key: number]: string } = {
    61: 'Ligue 1',
    39: 'Premier League', 
    140: 'La Liga',
    135: 'Serie A',
    78: 'Bundesliga'
  };
  return names[leagueId] || `Championnat ${leagueId}`;
};

// Hook personnalisé pour récupérer les données des championnats
const useLeaguesData = () => {
  const [leagues, setLeagues] = useState<LeagueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaguesData = async () => {
      try {
        setLoading(true);
        const leagueIds = Object.keys(leagueConfigs).map(Number);
        const season = 2023; // Saison disponible avec le plan gratuit
        
        const leaguesData = await Promise.all(
          leagueIds.map(async (leagueId) => {
            try {
              // 1. Récupération des standings (contient nom de ligue + équipes + classement)
              const standingsResponse = await fetch(`http://localhost:8000/standings/${leagueId}?season=${season}`);
              if (!standingsResponse.ok) {
                throw new Error(`HTTP error! status: ${standingsResponse.status}`);
              }
              const standingsData = await standingsResponse.json();
              
              // 2. Récupération des matchs pour calculer la progression
              const matchesResponse = await fetch(`http://localhost:8000/matches?league=${leagueId}&season=${season}&status=FT`);
              if (!matchesResponse.ok) {
                throw new Error(`HTTP error! status: ${matchesResponse.status}`);
              }
              const matchesData = await matchesResponse.json();
              
              // Extraction des données du classement
              const leagueInfo = standingsData.league;
              const standings = standingsData.standings || [];
              const totalTeams = standings.length;
              
              // Calcul de la progression basé sur les matchs terminés
              const finishedMatches = matchesData.response || [];
              
              // Pour calculer les journées, on utilise le nombre d'équipes
              // Championnat aller-retour = (n-1) * 2 journées
              const totalRounds = totalTeams > 0 ? (totalTeams - 1) * 2 : 38;
              
              // Calcul plus précis : nombre de matchs par journée = totalTeams / 2
              const matchesPerRound = totalTeams > 0 ? totalTeams / 2 : 10;
              
              // Journée actuelle basée sur le nombre de matchs terminés
              const currentRound = matchesPerRound > 0 
                ? Math.min(Math.floor(finishedMatches.length / matchesPerRound), totalRounds)
                : 0;
              
              const config = leagueConfigs[leagueId as keyof typeof leagueConfigs];
              
              return {
                id: leagueId,
                name: leagueInfo.name || getLeagueName(leagueId),
                country: leagueInfo.country || 'Inconnu',
                countryCode: config.countryCode,
                description: config.description,
                logo: leagueInfo.logo || `https://media.api-sports.io/football/leagues/${leagueId}.png`,
                color: config.color,
                gradient: config.gradient,
                backgroundColor: config.backgroundColor,
                teams: totalTeams,
                totalRounds: totalRounds,
                currentRound: currentRound,
                season: `${season}-${season + 1}`
              };
            } catch (err) {
              console.error(`Erreur pour la ligue ${leagueId}:`, err);
              // Fallback avec données par défaut si API fail
              const config = leagueConfigs[leagueId as keyof typeof leagueConfigs];
              
              // Données spécifiques par championnat pour le fallback
              let fallbackTeams = 20;
              let fallbackRounds = 38;
              
              if (leagueId === 61) { // Ligue 1
                fallbackTeams = 18;
                fallbackRounds = 34;
              } else if (leagueId === 78) { // Bundesliga
                fallbackTeams = 18;
                fallbackRounds = 34;
              }
              
              return {
                id: leagueId,
                name: getLeagueName(leagueId),
                country: 'Europe',
                countryCode: config.countryCode,
                description: config.description,
                logo: `https://media.api-sports.io/football/leagues/${leagueId}.png`,
                color: config.color,
                gradient: config.gradient,
                backgroundColor: config.backgroundColor,
                teams: fallbackTeams,
                totalRounds: fallbackRounds,
                currentRound: fallbackRounds, // Saison terminée en 2023
                season: `${season}-${season + 1}`
              };
            }
          })
        );
        
        setLeagues(leaguesData);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Erreur lors du chargement des championnats');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaguesData();
  }, []);

  return { leagues, loading, error };
};

// Calcul du pourcentage de progression
const getProgressPercentage = (currentRound: number, totalRounds: number) => {
  return Math.min((currentRound / totalRounds) * 100, 100);
};

// Statut de la saison basé sur le pourcentage de progression
const getSeasonStatus = (currentRound: number, totalRounds: number) => {
  const percentage = getProgressPercentage(currentRound, totalRounds);
  if (percentage >= 100) return 'Saison terminée';
  if (percentage >= 75) return 'Sprint final';
  if (percentage >= 50) return 'Mi-saison';
  if (percentage >= 25) return 'Premier tiers';
  return 'Début de saison';
};

// Composant Skeleton pour le chargement
const LeagueCardSkeleton = () => (
  <Card 
    sx={{ 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      border: 'none',
      borderRadius: '24px'
    }}
  >
    <CardContent sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Skeleton variant="circular" width={72} height={72} />
        <Skeleton variant="rectangular" width={50} height={28} sx={{ borderRadius: 2 }} />
      </Box>
      <Skeleton variant="text" sx={{ fontSize: '2rem', mb: 1 }} />
      <Skeleton variant="text" sx={{ mb: 3 }} />
      <Skeleton variant="text" sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" height={8} sx={{ mb: 2, borderRadius: 4 }} />
      <Skeleton variant="text" sx={{ mb: 3 }} />
      <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 2 }} />
    </CardContent>
  </Card>
);

export default function LeagueSelector() {
  const { leagues, loading, error } = useLeaguesData();

  if (error) {
    return (
      <>
        <Header />
        <BreadcrumbNavigation />
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vérifiez que votre backend est démarré sur le port 8000
          </Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <Header />
      <BreadcrumbNavigation />
      <Box sx={{ bgcolor: '#fafbfc' }}>
        {/* Section Hero moderne */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
            color: 'white',
            py: { xs: 6, md: 8 },
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Éléments décoratifs */}
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              blur: '60px'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -100,
              left: -100,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              blur: '80px'
            }}
          />
          
          <Container maxWidth="lg" sx={{ position: 'relative', textAlign: 'center' }}>
            <Box sx={{ mb: 4 }}>
              <EmojiEvents 
                sx={{ 
                  fontSize: 80, 
                  mb: 2,
                  color: '#fbbf24',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                }} 
              />
              <Typography 
                variant="h1"
                fontWeight="800"
                sx={{
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  mb: 2,
                  background: 'linear-gradient(45deg, #ffffff 30%, #e0e7ff 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}
              >
                Explorez les Championnats
              </Typography>
              
              <Typography 
                variant="h5" 
                sx={{ 
                  opacity: 0.95,
                  fontSize: { xs: '1.1rem', md: '1.4rem' },
                  maxWidth: '600px',
                  mx: 'auto',
                  fontWeight: 400,
                  lineHeight: 1.6
                }}
              >
                Plongez dans l'univers des plus grandes compétitions européennes
              </Typography>
            </Box>
          </Container>
        </Box>

        {/* Section Championnats avec design moderne */}
        <Container maxWidth="xl" sx={{ py: 6, px: 0 }}>
          <Grid container spacing={5} justifyContent="center" sx={{ gap: '5px' }}>
            {loading ? (
              // Skeletons pendant le chargement
              Array.from({ length: 5 }).map((_, index) => (
                <Grid item xs={12} sm={6} lg={4} key={index}>
                  <LeagueCardSkeleton />
                </Grid>
              ))
            ) : (
              leagues.map((league) => {
                const progressPercentage = getProgressPercentage(league.currentRound, league.totalRounds);
                const seasonStatus = getSeasonStatus(league.currentRound, league.totalRounds);
                
                return (
                  <Grid item xs={12} sm={6} lg={4} key={league.id}>
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
                        borderRadius: '24px',
                        background: `linear-gradient(135deg, ${league.backgroundColor} 0%, ${alpha(league.color, 0.05)} 100%)`,
                        border: `2px solid ${alpha(league.color, 0.1)}`,
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: `0 20px 40px ${alpha(league.color, 0.2)}`,
                          border: `2px solid ${alpha(league.color, 0.3)}`,
                          '& .league-icon': {
                            transform: 'scale(1.1) rotate(8deg)',
                          }
                        }
                      }}
                      elevation={0}
                    >
                      <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column' }}>
                        {/* Header avec logo et badge pays moderne */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                          <Box
                            className="league-icon"
                            sx={{
                              width: 72,
                              height: 72,
                              borderRadius: '20px',
                              background: `linear-gradient(135deg, ${league.color} 0%, ${alpha(league.color, 0.8)} 100%)`,
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '2rem',
                              transition: 'transform 0.4s ease',
                              boxShadow: `0 8px 25px ${alpha(league.color, 0.3)}`,
                              position: 'relative',
                              overflow: 'hidden',
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                inset: 0,
                                borderRadius: '20px',
                                background: `linear-gradient(135deg, transparent 0%, ${alpha('#ffffff', 0.2)} 100%)`,
                                pointerEvents: 'none'
                              }
                            }}
                          >
                            <img 
                              src={league.logo} 
                              alt={league.name}
                              style={{
                                width: '48px',
                                height: '48px',
                                objectFit: 'contain'
                              }}
                              onError={(e) => {
                                // Fallback si l'image ne charge pas
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.innerHTML += 
                                  league.countryCode === 'FR' ? '⚽' :
                                  league.countryCode === 'EN' ? '👑' :
                                  league.countryCode === 'ES' ? '🔥' :
                                  league.countryCode === 'IT' ? '🇮🇹' :
                                  league.countryCode === 'DE' ? '🦅' : '⚽';
                              }}
                            />
                          </Box>

                          <Chip
                            label={league.countryCode}
                            sx={{
                              backgroundColor: alpha(league.color, 0.15),
                              color: league.color,
                              fontWeight: 'bold',
                              fontSize: '0.8rem',
                              height: 32,
                              borderRadius: '16px',
                              border: `1px solid ${alpha(league.color, 0.2)}`,
                              '& .MuiChip-label': {
                                px: 2
                              }
                            }}
                          />
                        </Box>
                        
                        {/* Nom du championnat avec style moderne */}
                        <Typography 
                          variant="h4" 
                          fontWeight="700" 
                          sx={{ 
                            mb: 1, 
                            color: league.color,
                            fontSize: '1.75rem',
                            lineHeight: 1.2
                          }}
                        >
                          {league.name}
                        </Typography>
                        
                        {/* Description élégante */}
                        <Typography 
                          variant="body1" 
                          color="text.secondary" 
                          sx={{ 
                            mb: 3,
                            fontSize: '1rem',
                            fontWeight: 500
                          }}
                        >
                          {league.description}
                        </Typography>

                        {/* Barre de progression moderne */}
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              fontWeight="600"
                              sx={{ fontSize: '0.9rem' }}
                            >
                              {seasonStatus}
                            </Typography>
                            <Typography 
                              variant="body1" 
                              color={league.color} 
                              fontWeight="700"
                              sx={{ fontSize: '1rem' }}
                            >
                              J{league.currentRound}/{league.totalRounds}
                            </Typography>
                          </Box>
                          
                          <LinearProgress
                            variant="determinate"
                            value={progressPercentage}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: alpha(league.color, 0.1),
                              '& .MuiLinearProgress-bar': {
                                background: league.gradient,
                                borderRadius: 4,
                              }
                            }}
                          />
                          
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            sx={{ 
                              mt: 1, 
                              display: 'block', 
                              textAlign: 'center',
                              fontWeight: 600,
                              fontSize: '0.8rem'
                            }}
                          >
                            {Math.round(progressPercentage)}% terminé
                          </Typography>
                        </Box>
                        
                        {/* Footer avec statistiques */}
                        <Box 
                          sx={{ 
                            mt: 'auto',
                            p: 2,
                            borderRadius: '12px',
                            backgroundColor: alpha(league.color, 0.05),
                            border: `1px solid ${alpha(league.color, 0.1)}`
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Groups sx={{ color: league.color, fontSize: 20 }} />
                              <Typography variant="body2" color="text.secondary" fontWeight="600">
                                {league.teams} équipes
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" fontWeight="600">
                              {league.season}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })
            )}
          </Grid>

          {/* Call to action moderne */}
          {!loading && (
            <Box sx={{ textAlign: 'center', mt: 8 }}>
              <Paper
                sx={{
                  p: 6,
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  border: '1px solid rgba(148, 163, 184, 0.1)'
                }}
              >
                <EmojiEvents sx={{ fontSize: 48, color: '#f59e0b', mb: 2 }} />
                <Typography variant="h5" fontWeight="700" color="text.primary" sx={{ mb: 2 }}>
                  Découvrez votre passion
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
                  Explorez les statistiques détaillées, suivez vos équipes favorites et vivez l'émotion des plus grands championnats européens.
                </Typography>
              </Paper>
            </Box>
          )}
        </Container>
      </Box>
    </>
  );
}