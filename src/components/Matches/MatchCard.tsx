// src/components/Matches/MatchCard.tsx
import React from 'react';
import {
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Typography,
  Box
} from '@mui/material';
import {
  FiberManualRecord as FiberManualRecordIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Sports as SportsIcon
} from '@mui/icons-material';
import type { MatchData } from '../../services/api/matchesService';

interface LiveMatch extends MatchData {
  elapsed?: number;
}

interface MatchCardProps {
  match: MatchData | LiveMatch;
  onClick: () => void;
  isLive?: boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({ 
  match, 
  onClick, 
  isLive = false 
}) => {
  const getStatusColor = (status: MatchData['status']) => {
    switch (status) {
      case 'live': return '#ef4444';
      case 'finished': return '#22c55e';
      case 'scheduled': return '#3b82f6';
      case 'postponed': return '#f59e0b';
      case 'cancelled': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: MatchData['status']) => {
    switch (status) {
      case 'live': return <FiberManualRecordIcon sx={{ fontSize: 12, animation: 'pulse 2s infinite' }} />;
      case 'finished': return <CheckCircleIcon sx={{ fontSize: 16 }} />;
      case 'scheduled': return <AccessTimeIcon sx={{ fontSize: 16 }} />;
      default: return <SportsIcon sx={{ fontSize: 16 }} />;
    }
  };

  const getStatusText = (status: MatchData['status'], elapsed?: number) => {
    switch (status) {
      case 'live': 
        const liveMatch = match as LiveMatch;
        return `${elapsed || liveMatch.elapsed || 0}'`;
      case 'finished': return 'FT';
      case 'scheduled': return new Date(match.date).toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      case 'postponed': return 'REPORTÉ';
      case 'cancelled': return 'ANNULÉ';
      default: return status.toUpperCase();
    }
  };

  const getScoreDisplay = () => {
    if (match.score.home !== null && match.score.away !== null) {
      return `${match.score.home}-${match.score.away}`;
    }
    return 'vs';
  };

  const truncateName = (name: string, maxLength: number) => {
    return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
  };

  return (
    <Card 
      sx={{ 
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-4px)',
          backgroundColor: 'rgba(59, 130, 246, 0.02)'
        },
        mb: 1.5,
        border: isLive ? `2px solid ${getStatusColor(match.status)}` : '1px solid rgba(0,0,0,0.12)',
        position: 'relative',
        overflow: 'visible'
      }}
      onClick={onClick}
    >
      {/* Indicateur live pulsant */}
      {isLive && (
        <Box
          sx={{
            position: 'absolute',
            top: -8,
            right: -8,
            width: 16,
            height: 16,
            backgroundColor: '#ef4444',
            borderRadius: '50%',
            animation: 'pulse 2s infinite',
            zIndex: 1,
            '&::after': {
              content: '""',
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              animation: 'ping 2s infinite'
            }
          }}
        />
      )}

      <CardContent sx={{ py: 2, px: 3, '&:last-child': { pb: 2 } }}>
        <Grid container alignItems="center" spacing={2}>
          {/* Équipes et score */}
          <Grid item xs={8} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar 
                src={match.homeTeam.logo} 
                sx={{ width: 32, height: 32 }}
                alt={match.homeTeam.name}
              />
              <Box sx={{ minWidth: { xs: '70px', sm: '100px' } }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    lineHeight: 1.2
                  }}
                >
                  {truncateName(match.homeTeam.name, window.innerWidth < 600 ? 10 : 15)}
                </Typography>
              </Box>
              
              <Chip
                label={getScoreDisplay()}
                variant={match.status === 'live' ? 'filled' : 'outlined'}
                color={match.status === 'live' ? 'error' : 'default'}
                sx={{ 
                  fontWeight: 'bold', 
                  minWidth: '60px',
                  backgroundColor: match.status === 'live' ? 'rgba(239, 68, 68, 0.1)' : 'transparent'
                }}
              />
              
              <Box sx={{ minWidth: { xs: '70px', sm: '100px' }, textAlign: 'right' }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    lineHeight: 1.2
                  }}
                >
                  {truncateName(match.awayTeam.name, window.innerWidth < 600 ? 10 : 15)}
                </Typography>
              </Box>
              <Avatar 
                src={match.awayTeam.logo} 
                sx={{ width: 32, height: 32 }}
                alt={match.awayTeam.name}
              />
            </Box>
          </Grid>

          {/* Stade et round */}
          <Grid item xs={0} sm={4} sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                📍 {match.venue.name ? truncateName(match.venue.name, 18) : 'Lieu TBD'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {match.league.round}
              </Typography>
            </Box>
          </Grid>

          {/* Status */}
          <Grid item xs={4} sm={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
              <Chip
                icon={getStatusIcon(match.status)}
                label={getStatusText(match.status, (match as LiveMatch).elapsed)}
                size="small"
                sx={{
                  backgroundColor: getStatusColor(match.status),
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  '& .MuiChip-icon': { color: 'white' }
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};