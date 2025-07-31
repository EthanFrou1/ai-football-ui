// src/pages/MatchDetails.tsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Grid,
  Avatar,
  Chip,
  Card,
  CardContent,
  Divider,
  Button,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
  Stack,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Stadium as StadiumIcon,
  Schedule as ScheduleIcon,
  SportsSoccer as SoccerIcon,
  Person as PersonIcon,
  Timeline as TimelineIcon,
  BarChart as StatsIcon,
  SwapHoriz as SubstitutionIcon,
  Warning as CardIcon,
  EmojiEvents as GoalIcon,
  LocationOn as LocationIcon,
  AccessTime as AccessTimeIcon,
  FiberManualRecord as LiveIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSafeLeague } from '../contexts/LeagueContext';

// Types pour les détails du match
interface MatchDetails {
  id: number;
  date: string;
  timestamp: number;
  status: 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';
  statusLong: string;
  elapsed: number | null;
  referee: string | null;
  homeTeam: {
    id: number;
    name: string;
    logo: string;
    formation?: string;
  };
  awayTeam: {
    id: number;
    name: string;
    logo: string;
    formation?: string;
  };
  score: {
    home: number | null;
    away: number | null;
    halftime?: {
      home: number | null;
      away: number | null;
    };
  };
  venue: {
    name: string | null;
    city: string | null;
  };
  league: {
    id: number;
    name: string;
    round: string;
  };
  events?: MatchEvent[];
  statistics?: MatchStatistics[];
}

interface MatchEvent {
  time: {
    elapsed: number;
    extra?: number;
  };
  team: {
    id: number;
    name: string;
    logo: string;
  };
  player: {
    id: number;
    name: string;
  };
  assist?: {
    id: number;
    name: string;
  };
  type: 'Goal' | 'Card' | 'subst' | 'Var';
  detail: string;
}

interface MatchStatistics {
  team: {
    id: number;
    name: string;
    logo: string;
  };
  statistics: {
    type: string;
    value: string | number | null;
  }[];
}

function MatchDetails(): React.ReactElement {
  const { matchId, id } = useParams();
  const navigate = useNavigate();
  const { selectedLeague } = useSafeLeague();
  
  const finalMatchId = matchId || id;
  
  // États
  const [matchDetails, setMatchDetails] = useState<MatchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  // Fetch des détails du match
  useEffect(() => {
    if (!finalMatchId) {
      setError('ID de match manquant');
      setLoading(false);
      return;
    }

    fetchMatchDetails();
  }, [finalMatchId]);

  // Auto-refresh pour les matchs live
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      fetchMatchDetails(false); // Refresh sans loader
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [isLive]);

  const fetchMatchDetails = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/api/matches/${finalMatchId}`);
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: Match non trouvé`);
      }

      const data = await response.json();
      
      if (!data.response || data.response.length === 0) {
        throw new Error('Match non trouvé');
      }

      const matchData = data.response[0];
      
      // Transformer les données API en format interne
      const transformedMatch: MatchDetails = {
        id: matchData.fixture.id,
        date: matchData.fixture.date,
        timestamp: matchData.fixture.timestamp,
        status: mapApiStatus(matchData.fixture.status.short),
        statusLong: matchData.fixture.status.long,
        elapsed: matchData.fixture.status.elapsed,
        referee: matchData.fixture.referee,
        homeTeam: {
          id: matchData.teams.home.id,
          name: matchData.teams.home.name,
          logo: matchData.teams.home.logo,
        },
        awayTeam: {
          id: matchData.teams.away.id,
          name: matchData.teams.away.name,
          logo: matchData.teams.away.logo,
        },
        score: {
          home: matchData.goals.home,
          away: matchData.goals.away,
          halftime: matchData.score?.halftime || { home: null, away: null },
        },
        venue: {
          name: matchData.fixture.venue?.name,
          city: matchData.fixture.venue?.city,
        },
        league: {
          id: matchData.league.id,
          name: matchData.league.name,
          round: matchData.league.round,
        },
        events: [], // À implémenter avec un second appel API si nécessaire
        statistics: [], // À implémenter avec un second appel API si nécessaire
      };

      setMatchDetails(transformedMatch);
      setIsLive(transformedMatch.status === 'live');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('❌ Erreur lors du chargement des détails du match:', err);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  // Mapper les statuts API
  const mapApiStatus = (apiStatus: string): MatchDetails['status'] => {
    const statusMap: Record<string, MatchDetails['status']> = {
      'NS': 'scheduled',
      'LIVE': 'live',
      '1H': 'live',
      'HT': 'live',
      '2H': 'live',
      'ET': 'live',
      'P': 'live',
      'FT': 'finished',
      'AET': 'finished',
      'PEN': 'finished',
      'PST': 'postponed',
      'CANC': 'cancelled',
    };
    return statusMap[apiStatus] || 'scheduled';
  };

  // Obtenir la couleur du statut
  const getStatusConfig = () => {
    if (!matchDetails) return { color: 'default', label: 'Inconnu' };

    switch (matchDetails.status) {
      case 'live':
        return {
          color: 'error' as const,
          label: matchDetails.elapsed ? `${matchDetails.elapsed}'` : 'LIVE',
          icon: <LiveIcon sx={{ fontSize: 16, animation: 'pulse 2s infinite' }} />
        };
      case 'finished':
        return {
          color: 'success' as const,
          label: 'Terminé',
          icon: <SoccerIcon sx={{ fontSize: 16 }} />
        };
      case 'scheduled':
        return {
          color: 'primary' as const,
          label: new Date(matchDetails.timestamp * 1000).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          icon: <ScheduleIcon sx={{ fontSize: 16 }} />
        };
      case 'postponed':
        return {
          color: 'warning' as const,
          label: 'Reporté',
          icon: <AccessTimeIcon sx={{ fontSize: 16 }} />
        };
      case 'cancelled':
        return {
          color: 'error' as const,
          label: 'Annulé',
          icon: <Warning sx={{ fontSize: 16 }} />
        };
      default:
        return {
          color: 'default' as const,
          label: matchDetails.statusLong,
          icon: <SoccerIcon sx={{ fontSize: 16 }} />
        };
    }
  };

  // Composant pour afficher le score
  const ScoreDisplay = () => {
    if (!matchDetails) return null;

    const isScheduled = matchDetails.status === 'scheduled';
    
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        {isScheduled ? (
          <Typography variant="h3" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
            VS
          </Typography>
        ) : (
          <Box>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 'bold',
                color: matchDetails.status === 'live' ? 'error.main' : 'text.primary',
                mb: 1
              }}
            >
              {matchDetails.score.home ?? 0} - {matchDetails.score.away ?? 0}
            </Typography>
            
            {matchDetails.score.halftime && (matchDetails.score.halftime.home !== null) && (
              <Typography variant="body2" color="text.secondary">
                Mi-temps: {matchDetails.score.halftime.home} - {matchDetails.score.halftime.away}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    );
  };

  // Composant pour une équipe
  const TeamDisplay = ({ team, isHome }: { team: MatchDetails['homeTeam'], isHome: boolean }) => (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      textAlign: 'center',
      gap: 2
    }}>
      <Avatar
        src={team.logo}
        alt={team.name}
        sx={{ 
          width: 80, 
          height: 80,
          boxShadow: 3
        }}
      />
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 'bold',
          lineHeight: 1.2
        }}
      >
        {team.name}
      </Typography>
      {team.formation && (
        <Chip 
          label={`Formation: ${team.formation}`}
          size="small"
          variant="outlined"
        />
      )}
    </Box>
  );

  // Rendu des informations du match
  const MatchInfo = () => {
    if (!matchDetails) return null;

    const matchDate = new Date(matchDetails.timestamp * 1000);

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimelineIcon />
            Informations du match
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <List dense>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <ScheduleIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Date et heure"
                    secondary={matchDate.toLocaleString('fr-FR')}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <SoccerIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Compétition"
                    secondary={`${matchDetails.league.name} - ${matchDetails.league.round}`}
                  />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <List dense>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <StadiumIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Stade"
                    secondary={matchDetails.venue.name || 'Stade non défini'}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <LocationIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Ville"
                    secondary={matchDetails.venue.city || 'Ville non définie'}
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
          
          {matchDetails.referee && (
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="action" />
                <Typography variant="body2" color="text.secondary">
                  Arbitre: {matchDetails.referee}
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  // Gestion du retour
  const handleGoBack = () => {
    if (selectedLeague) {
      navigate(`/league/${selectedLeague.id}/matches`);
    } else {
      navigate('/matches');
    }
  };

  // Rendu principal
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={() => fetchMatchDetails()}>
              Réessayer
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  if (!matchDetails) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Match non trouvé
        </Alert>
      </Container>
    );
  }

  const statusConfig = getStatusConfig();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header avec bouton retour */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          sx={{ mb: 2 }}
        >
          Retour aux matchs
        </Button>
        
        <Paper sx={{ p: 3 }}>
          {/* Statut du match */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Chip
              icon={statusConfig.icon}
              label={statusConfig.label}
              color={statusConfig.color}
              size="medium"
              sx={{ 
                fontWeight: 'bold',
                fontSize: '1rem',
                px: 2,
                py: 1
              }}
            />
          </Box>

          {/* Section principale avec équipes et score */}
          <Grid container spacing={4} alignItems="center">
            {/* Équipe domicile */}
            <Grid item xs={12} md={4}>
              <TeamDisplay team={matchDetails.homeTeam} isHome={true} />
            </Grid>

            {/* Score central */}
            <Grid item xs={12} md={4}>
              <ScoreDisplay />
              {matchDetails.status === 'live' && (
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="body2" color="error.main" sx={{ fontWeight: 'bold' }}>
                    🔴 MATCH EN DIRECT
                  </Typography>
                </Box>
              )}
            </Grid>

            {/* Équipe extérieur */}
            <Grid item xs={12} md={4}>
              <TeamDisplay team={matchDetails.awayTeam} isHome={false} />
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Informations détaillées */}
      <MatchInfo />

      {/* Section des événements (à implémenter) */}
      {matchDetails.events && matchDetails.events.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimelineIcon />
              Événements du match
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fonctionnalité à venir...
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Section des statistiques (à implémenter) */}
      {matchDetails.statistics && matchDetails.statistics.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StatsIcon />
              Statistiques
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fonctionnalité à venir...
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Message si match à venir */}
      {matchDetails.status === 'scheduled' && (
        <Alert severity="info" sx={{ mt: 3 }}>
          Ce match n'a pas encore commencé. Plus de détails seront disponibles une fois le match débuté.
        </Alert>
      )}

      {/* Auto-refresh indicator pour les matchs live */}
      {isLive && (
        <Box sx={{ 
          position: 'fixed', 
          bottom: 20, 
          right: 20, 
          bgcolor: 'error.main', 
          color: 'white',
          px: 2,
          py: 1,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          boxShadow: 3
        }}>
          <LiveIcon sx={{ fontSize: 16, animation: 'pulse 2s infinite' }} />
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
            Actualisation auto
          </Typography>
        </Box>
      )}

      {/* Animation CSS pour le pulse */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </Container>
  );
}

export default MatchDetails;