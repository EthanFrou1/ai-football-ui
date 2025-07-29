// src/components/Matches/LeagueSection.tsx
import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  Badge
} from '@mui/material';
import { Sports as SportsIcon } from '@mui/icons-material';
import { MatchCard } from './MatchCard';
import type { MatchData } from '../../services/api/matchesService';
import type { League } from '../../contexts/LeagueContext';

interface LeagueSectionProps {
  leagueName: string;
  leagueId: number;
  matches: MatchData[];
  currentLeague?: League | null;
  onMatchClick: (matchId: number) => void;
}

export const LeagueSection: React.FC<LeagueSectionProps> = ({
  leagueName,
  leagueId,
  matches,
  currentLeague,
  onMatchClick
}) => {
  const isCurrentLeague = currentLeague?.id === leagueId;

  return (
    <Box sx={{ mb: 4 }}>
      {/* En-tête de la section */}
      <Paper 
        elevation={isCurrentLeague ? 3 : 1}
        sx={{ 
          p: 2, 
          mb: 2, 
          backgroundColor: isCurrentLeague ? currentLeague?.color + '10' : 'background.paper',
          border: isCurrentLeague ? `2px solid ${currentLeague?.color}` : '1px solid rgba(0,0,0,0.12)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            sx={{ 
              width: 40, 
              height: 40,
              backgroundColor: currentLeague?.color || '#3b82f6'
            }}
          >
            {isCurrentLeague ? currentLeague?.countryCode : '🏆'}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold', 
                color: isCurrentLeague ? currentLeague?.color : 'text.primary' 
              }}
            >
              {leagueName}
              {isCurrentLeague && (
                <Chip 
                  label="Votre championnat" 
                  size="small" 
                  color="primary" 
                  sx={{ ml: 1, fontSize: '0.7rem' }}
                />
              )}
            </Typography>
          </Box>
          <Badge badgeContent={matches.length} color="primary">
            <SportsIcon />
          </Badge>
        </Box>
      </Paper>

      {/* Liste des matchs */}
      <Box>
        {matches.map(match => (
          <MatchCard
            key={match.id}
            match={match}
            onClick={() => onMatchClick(match.id)}
            isLive={match.status === 'live'}
          />
        ))}
      </Box>
    </Box>
  );
};