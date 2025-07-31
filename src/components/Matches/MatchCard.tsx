// src/components/Matches/MatchCard.tsx - AVEC NAVIGATION
import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  Chip,
  Divider,
  Grid,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  PlayArrow as PlayIcon,
  CheckCircle as FinishedIcon,
  Schedule as ScheduledIcon,
  Cancel as CancelledIcon,
  Pause as PostponedIcon,
  FiberManualRecord as FiberManualRecordIcon,
} from '@mui/icons-material';

// Import depuis le service corrigé
import type { MatchData } from '../../services/api/matchesService';

interface MatchCardProps {
  match: MatchData;
  onClick?: (match: MatchData) => void;
  isLive?: boolean;
  compact?: boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({ 
  match, 
  onClick, 
  isLive = false,
  compact = false 
}) => {
  // Formater la date et l'heure (compatible avec les deux formats)
  const getMatchDate = () => {
    // Support des deux formats : timestamp ou date string
    if (match.timestamp) {
      return new Date(match.timestamp * 1000);
    } else if (match.date) {
      return new Date(match.date);
    }
    return new Date();
  };

  const matchDate = getMatchDate();
  const isToday = matchDate.toDateString() === new Date().toDateString();
  const timeString = matchDate.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  const dateString = isToday ? 'Aujourd\'hui' : matchDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  });

  // Configuration du statut
  const getStatusConfig = () => {
    switch (match.status) {
      case 'live':
        return {
          icon: <FiberManualRecordIcon sx={{ fontSize: 12, animation: 'pulse 2s infinite' }} />,
          color: 'error' as const,
          label: match.elapsed ? `${match.elapsed}'` : 'LIVE',
          bgColor: '#ff1744',
        };
      case 'finished':
        return {
          icon: <FinishedIcon />,
          color: 'success' as const,
          label: 'FT',
          bgColor: '#4caf50',
        };
      case 'scheduled':
        return {
          icon: <ScheduledIcon />,
          color: 'primary' as const,
          label: timeString,
          bgColor: '#1976d2',
        };
      case 'postponed':
        return {
          icon: <PostponedIcon />,
          color: 'warning' as const,
          label: 'Reporté',
          bgColor: '#ff9800',
        };
      case 'cancelled':
        return {
          icon: <CancelledIcon />,
          color: 'error' as const,
          label: 'Annulé',
          bgColor: '#f44336',
        };
      default:
        return {
          icon: <ScheduledIcon />,
          color: 'default' as const,
          label: 'Programmé',
          bgColor: '#757575',
        };
    }
  };

  const statusConfig = getStatusConfig();

  // Affichage du score
  const getScoreDisplay = () => {
    if (match.score.home !== null && match.score.away !== null) {
      return `${match.score.home}-${match.score.away}`;
    }
    return 'vs';
  };

  // Tronquer les noms si trop longs
  const truncateName = (name: string, maxLength: number = 15) => {
    return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
  };

  // Gérer le clic sur la card
  const handleClick = () => {
    if (onClick) {
      console.log(`🎯 Clic sur match ${match.id}: ${match.homeTeam.name} vs ${match.awayTeam.name}`);
      onClick(match);
    }
  };

  return (
    <Card 
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': onClick ? {
          boxShadow: 6,
          transform: 'translateY(-2px)',
          backgroundColor: 'rgba(59, 130, 246, 0.02)'
        } : {},
        mb: 1.5,
        border: isLive || match.status === 'live' ? '2px solid' : '1px solid',
        borderColor: isLive || match.status === 'live' ? '#ff1744' : 'divider',
        position: 'relative',
        ...(isLive || match.status === 'live' ? {
          boxShadow: '0 0 20px rgba(255, 23, 68, 0.3)',
        } : {})
      }}
      onClick={handleClick}
    >
      {/* Indicateur live pulsant */}
      {(isLive || match.status === 'live') && (
        <Box
          sx={{
            position: 'absolute',
            top: -6,
            right: -6,
            width: 12,
            height: 12,
            backgroundColor: '#ff1744',
            borderRadius: '50%',
            animation: 'pulse 2s infinite',
            zIndex: 1,
            boxShadow: '0 0 0 0 rgba(255, 23, 68, 0.7)',
            '&::before': {
              content: '""',
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              backgroundColor: '#ff1744',
              animation: 'ping 2s infinite',
            }
          }}
        />
      )}

      <CardContent sx={{ p: compact ? 2 : 3 }}>
        {/* En-tête avec statut et date */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2 
        }}>
          <Chip
            icon={statusConfig.icon}
            label={statusConfig.label}
            color={statusConfig.color}
            size="small"
            sx={{ 
              fontWeight: 'bold',
              ...(match.status === 'live' && {
                animation: 'pulse 2s infinite',
              })
            }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {dateString}
          </Typography>
        </Box>

        {/* Section principale - Layout en Grid pour compatibilité */}
        <Grid container spacing={2} alignItems="center">
          {/* Équipe domicile */}
          <Grid item xs={4}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 1
            }}>
              <Avatar
                src={match.homeTeam.logo}
                alt={match.homeTeam.name}
                sx={{ 
                  width: compact ? 32 : 48, 
                  height: compact ? 32 : 48
                }}
              />
              <Typography 
                variant={compact ? "caption" : "body2"} 
                sx={{ 
                  fontWeight: 'bold',
                  lineHeight: 1.2,
                  fontSize: compact ? '0.7rem' : '0.875rem'
                }}
              >
                {truncateName(match.homeTeam.name, compact ? 12 : 15)}
              </Typography>
            </Box>
          </Grid>

          {/* Score central */}
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant={compact ? "h6" : "h4"} 
                sx={{ 
                  fontWeight: 'bold',
                  color: match.status === 'live' ? 'error.main' : 'text.primary',
                  mb: match.status === 'live' ? 0.5 : 0
                }}
              >
                {getScoreDisplay()}
              </Typography>
              {match.status === 'live' && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 0.5
                }}>
                  <Box sx={{ 
                    width: 6, 
                    height: 6, 
                    bgcolor: 'error.main', 
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                  }} />
                  <Typography variant="caption" sx={{ 
                    color: 'error.main', 
                    fontWeight: 'bold',
                    fontSize: '0.7rem'
                  }}>
                    EN DIRECT
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Équipe extérieur */}
          <Grid item xs={4}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 1
            }}>
              <Avatar
                src={match.awayTeam.logo}
                alt={match.awayTeam.name}
                sx={{ 
                  width: compact ? 32 : 48, 
                  height: compact ? 32 : 48
                }}
              />
              <Typography 
                variant={compact ? "caption" : "body2"} 
                sx={{ 
                  fontWeight: 'bold',
                  lineHeight: 1.2,
                  fontSize: compact ? '0.7rem' : '0.875rem'
                }}
              >
                {truncateName(match.awayTeam.name, compact ? 12 : 15)}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {!compact && (
          <>
            <Divider sx={{ my: 1.5 }} />

            {/* Informations supplémentaires */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              {/* Round/Journée */}
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {match.league?.round || 'Journée inconnue'}
              </Typography>

              {/* Venue */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {match.venue?.city || 'Ville inconnue'}
                </Typography>
              </Box>
            </Box>

            {/* Informations de temps pour les matchs programmés */}
            {match.status === 'scheduled' && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                mt: 1 
              }}>
                <TimeIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {timeString}
                </Typography>
              </Box>
            )}
          </>
        )}
      </CardContent>

      {/* Styles pour les animations */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </Card>
  );
};