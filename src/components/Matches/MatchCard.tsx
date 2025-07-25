// src/components/Matches/MatchCard.tsx
import { 
  Card, 
  CardContent, 
  Typography, 
  Avatar, 
  Box, 
  Chip, 
  Stack, 
  Divider,
  CardActionArea,
  IconButton
} from "@mui/material";
import { InfoOutlined, AccessTime, LocationOn } from '@mui/icons-material';
import type { MatchData } from "../../services/api/matchesService";
import { Link } from "react-router-dom";

interface MatchCardProps {
  match: MatchData;
  showLeagueInfo?: boolean;
  showVenue?: boolean;
  showDetailsButton?: boolean;
  variant?: 'compact' | 'full';
  onClick?: (match: MatchData) => void;
}

const MatchCard = ({ 
  match, 
  showLeagueInfo = true,
  showVenue = true,
  showDetailsButton = false,
  variant = 'full',
  onClick 
}: MatchCardProps) => {

  // Fonction pour formater la date selon le statut
  const formatMatchDateTime = (timestamp: number, status: string): string => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    
    if (status === 'finished') {
      const diffTime = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "Aujourd'hui";
      if (diffDays === 1) return "Hier";
      if (diffDays <= 7) return `Il y a ${diffDays} jours`;
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    } else {
      const diffTime = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return `Aujourd'hui ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
      }
      if (diffDays === 1) {
        return `Demain ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
      }
      if (diffDays <= 7) {
        return `${date.toLocaleDateString('fr-FR', { weekday: 'long' })} ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
      }
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    }
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'error';
      case 'finished': return 'success';
      case 'scheduled': return 'primary';
      case 'postponed': return 'warning';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  // Fonction pour formater le score
  const formatScore = (homeScore: number | null, awayScore: number | null, status: string): string => {
    if (status === 'scheduled' || homeScore === null || awayScore === null) {
      return status === 'live' ? 'En cours' : 'vs';
    }
    return `${homeScore} - ${awayScore}`;
  };

  // Contenu principal du match
  const cardContent = (
    <CardContent sx={{ p: variant === 'compact' ? 2 : 3 }}>
      {/* En-tête avec ligue et statut */}
      {showLeagueInfo && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="caption" color="text.secondary">
            {match.league.name} • {match.league.round}
          </Typography>
          <Chip 
            label={match.statusLong} 
            size="small" 
            color={getStatusColor(match.status) as any}
            variant={match.status === 'live' ? 'filled' : 'outlined'}
          />
        </Box>
      )}

      {/* Teams et Score */}
      <Stack direction="row" alignItems="center" spacing={2} mb={variant === 'compact' ? 1 : 2}>
        {/* Équipe domicile */}
        <Box display="flex" alignItems="center" flex={1}>
          <Avatar
            src={match.homeTeam.logo}
            alt={match.homeTeam.name}
            sx={{ 
              width: variant === 'compact' ? 28 : 32, 
              height: variant === 'compact' ? 28 : 32, 
              mr: 1 
            }}
          />
          <Typography 
            variant={variant === 'compact' ? "body2" : "body1"} 
            fontWeight="medium"
            noWrap
          >
            {match.homeTeam.name}
          </Typography>
        </Box>

        {/* Score/Status */}
        <Box textAlign="center" minWidth={80}>
          {match.status === 'finished' ? (
            <Chip 
              label={formatScore(match.score.home, match.score.away, match.status)}
              color={getStatusColor(match.status) as any}
              variant="outlined"
              sx={{ fontWeight: 'bold' }}
            />
          ) : match.status === 'live' ? (
            <Chip 
              label={`${match.score.home || 0} - ${match.score.away || 0}`}
              color="error"
              sx={{ fontWeight: 'bold', animation: 'pulse 2s infinite' }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary" fontWeight="medium">
              {formatScore(match.score.home, match.score.away, match.status)}
            </Typography>
          )}
        </Box>

        {/* Équipe extérieur */}
        <Box display="flex" alignItems="center" flex={1} justifyContent="flex-end">
          <Typography 
            variant={variant === 'compact' ? "body2" : "body1"} 
            fontWeight="medium"
            noWrap
          >
            {match.awayTeam.name}
          </Typography>
          <Avatar
            src={match.awayTeam.logo}
            alt={match.awayTeam.name}
            sx={{ 
              width: variant === 'compact' ? 28 : 32, 
              height: variant === 'compact' ? 28 : 32, 
              ml: 1 
            }}
          />
        </Box>
      </Stack>

      {variant === 'full' && <Divider sx={{ my: 1 }} />}

      {/* Informations supplémentaires */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center"
        flexWrap="wrap"
        gap={1}
      >
        <Box display="flex" alignItems="center" gap={0.5}>
          <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {formatMatchDateTime(match.timestamp, match.status)}
          </Typography>
        </Box>

        {showVenue && match.venue.name && (
          <Box display="flex" alignItems="center" gap={0.5}>
            <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {match.venue.name}
            </Typography>
          </Box>
        )}

        {showDetailsButton && (
          <IconButton 
            component={Link} 
            to={`/match/${match.id}`}
            size="small"
            sx={{ ml: 'auto' }}
          >
            <InfoOutlined fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Temps écoulé pour les matchs en cours */}
      {match.status === 'live' && match.elapsed && (
        <Box mt={1}>
          <Chip 
            label={`${match.elapsed}'`} 
            size="small" 
            color="error" 
            variant="filled"
          />
        </Box>
      )}
    </CardContent>
  );

  // Si on a une fonction onClick, rendre le card cliquable
  if (onClick) {
    return (
      <Card sx={{ mb: 2, cursor: 'pointer' }}>
        <CardActionArea onClick={() => onClick(match)}>
          {cardContent}
        </CardActionArea>
      </Card>
    );
  }

  // Card normal
  return (
    <Card sx={{ mb: 2 }}>
      {cardContent}
    </Card>
  );
};

export default MatchCard;