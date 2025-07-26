// src/components/Matches/UpcomingMatches.tsx
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Avatar, 
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Divider
} from "@mui/material";
import { useUpcomingMatches } from "../../hooks/useMatches";
// import { useContext } from "react";
// import { LeagueContext } from "../../contexts/LeagueContext"; // À décommenter quand le context sera disponible

// Interface pour les props
interface UpcomingMatchesProps {
  leagueId?: number;
  season?: number;
  maxMatches?: number;
}

const UpcomingMatches = ({ 
  leagueId = 39, // Premier League par défaut
  season = 2023, 
  maxMatches = 5 
}: UpcomingMatchesProps) => {
  // Utilisation du context league si disponible
  // const { selectedLeague, currentSeason } = useContext(LeagueContext) || {};
  // const finalLeagueId = leagueId || selectedLeague?.id || 39;
  // const finalSeason = season || currentSeason || 2023;
  
  const finalLeagueId = leagueId;
  const finalSeason = season;

  const { matches, loading, error } = useUpcomingMatches(finalLeagueId, finalSeason);

  // Fonction pour formater la date
  const formatMatchDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else if (diffDays === 1) {
      return `Demain à ${date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else if (diffDays <= 7) {
      return `${date.toLocaleDateString('fr-FR', { 
        weekday: 'long' 
      })} à ${date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'postponed':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // États de chargement et d'erreur
  if (loading) {
    return (
      <Box mb={4}>
        <Typography variant="h6" mb={2}>Matchs à venir</Typography>
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={40} />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box mb={4}>
        <Typography variant="h6" mb={2}>Matchs à venir</Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          Erreur lors du chargement : {error}
        </Alert>
      </Box>
    );
  }

  if (matches.length === 0) {
    return (
      <Box mb={4}>
        <Typography variant="h6" mb={2}>Matchs à venir</Typography>
        <Alert severity="info">
          Aucun match à venir pour le moment.
        </Alert>
      </Box>
    );
  }

  // Limiter le nombre de matchs affichés
  const displayedMatches = matches.slice(0, maxMatches);

  return (
    <Box mb={4}>
      <Typography variant="h6" mb={2}>
        Matchs à venir
        <Chip 
          label={matches.length} 
          size="small" 
          sx={{ ml: 1 }} 
          color="primary"
        />
      </Typography>
      
      {displayedMatches.map((match) => (
        <Card key={match.id} sx={{ mb: 2 }}>
          <CardContent>
            {/* En-tête avec la ligue et le round */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="caption" color="text.secondary">
                {match.league.name} • {match.league.round}
              </Typography>
              <Chip 
                label={match.statusLong} 
                size="small" 
                color={getStatusColor(match.status) as any}
              />
            </Box>

            {/* Teams */}
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              {/* Équipe domicile */}
              <Box display="flex" alignItems="center" flex={1}>
                <Avatar
                  src={match.homeTeam.logo}
                  alt={match.homeTeam.name}
                  sx={{ width: 32, height: 32, mr: 1 }}
                />
                <Typography variant="body1" fontWeight="medium">
                  {match.homeTeam.name}
                </Typography>
              </Box>

              {/* VS */}
              <Typography variant="body2" color="text.secondary" px={1}>
                vs
              </Typography>

              {/* Équipe extérieur */}
              <Box display="flex" alignItems="center" flex={1} justifyContent="flex-end">
                <Typography variant="body1" fontWeight="medium">
                  {match.awayTeam.name}
                </Typography>
                <Avatar
                  src={match.awayTeam.logo}
                  alt={match.awayTeam.name}
                  sx={{ width: 32, height: 32, ml: 1 }}
                />
              </Box>
            </Stack>

            <Divider sx={{ my: 1 }} />

            {/* Informations du match */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                📅 {formatMatchDate(match.timestamp)}
              </Typography>
              {match.venue.name && (
                <Typography variant="body2" color="text.secondary">
                  📍 {match.venue.name}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      ))}

      {matches.length > maxMatches && (
        <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
          Et {matches.length - maxMatches} autres matchs à venir...
        </Typography>
      )}
    </Box>
  );
};

export default UpcomingMatches;