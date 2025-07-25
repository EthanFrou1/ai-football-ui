// src/components/Matches/RecentMatches.tsx
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
import { useRecentMatches } from "../../hooks/useMatches";
import { useContext } from "react";
// import { LeagueContext } from "../../contexts/LeagueContext"; // À décommenter quand le context sera disponible

// Interface pour les props
interface RecentMatchesProps {
  leagueId?: number;
  season?: number;
  maxMatches?: number;
}

const RecentMatches = ({ 
  leagueId = 39, // Premier League par défaut
  season = 2023, 
  maxMatches = 5 
}: RecentMatchesProps) => {
  // Utilisation du context league si disponible
  // const { selectedLeague, currentSeason } = useContext(LeagueContext) || {};
  // const finalLeagueId = leagueId || selectedLeague?.id || 39;
  // const finalSeason = season || currentSeason || 2023;
  
  const finalLeagueId = leagueId;
  const finalSeason = season;

  const { matches, loading, error } = useRecentMatches(finalLeagueId, finalSeason);

  // Fonction pour formater la date des matchs récents
  const formatMatchDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Aujourd'hui";
    } else if (diffDays === 1) {
      return "Hier";
    } else if (diffDays <= 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  // Fonction pour formater le score
  const formatScore = (homeScore: number | null, awayScore: number | null): string => {
    if (homeScore === null || awayScore === null) {
      return "- : -";
    }
    return `${homeScore} : ${awayScore}`;
  };

  // Fonction pour obtenir la couleur du résultat
  const getResultColor = (homeScore: number | null, awayScore: number | null) => {
    if (homeScore === null || awayScore === null) return 'default';
    
    if (homeScore > awayScore) {
      return 'success'; // Victoire domicile
    } else if (homeScore < awayScore) {
      return 'error'; // Victoire extérieur
    } else {
      return 'warning'; // Match nul
    }
  };

  // États de chargement et d'erreur
  if (loading) {
    return (
      <Box mb={4}>
        <Typography variant="h6" mb={2}>Matchs récents</Typography>
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={40} />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box mb={4}>
        <Typography variant="h6" mb={2}>Matchs récents</Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          Erreur lors du chargement : {error}
        </Alert>
      </Box>
    );
  }

  if (matches.length === 0) {
    return (
      <Box mb={4}>
        <Typography variant="h6" mb={2}>Matchs récents</Typography>
        <Alert severity="info">
          Aucun match récent disponible.
        </Alert>
      </Box>
    );
  }

  // Limiter le nombre de matchs affichés
  const displayedMatches = matches.slice(0, maxMatches);

  return (
    <Box mb={4}>
      <Typography variant="h6" mb={2}>
        Matchs récents
        <Chip 
          label={matches.length} 
          size="small" 
          sx={{ ml: 1 }} 
          color="secondary"
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
              <Typography variant="caption" color="text.secondary">
                {formatMatchDate(match.timestamp)}
              </Typography>
            </Box>

            {/* Teams et Score */}
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

              {/* Score */}
              <Chip 
                label={formatScore(match.score.home, match.score.away)}
                color={getResultColor(match.score.home, match.score.away) as any}
                variant="outlined"
                sx={{ fontWeight: 'bold', minWidth: 60 }}
              />

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
              <Chip 
                label={match.statusLong} 
                size="small" 
                color="success"
                variant="outlined"
              />
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
          Et {matches.length - maxMatches} autres matchs récents...
        </Typography>
      )}
    </Box>
  );
};

export default RecentMatches;