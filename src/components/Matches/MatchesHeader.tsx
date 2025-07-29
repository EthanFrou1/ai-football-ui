// src/components/Matches/MatchesHeader.tsx
import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import type { League } from '../../contexts/LeagueContext';

interface MatchesHeaderProps {
  currentLeague?: League | null;
  lastRefresh: Date;
  onRefresh: () => void;
  loading: boolean;
}

export const MatchesHeader: React.FC<MatchesHeaderProps> = ({
  currentLeague,
  lastRefresh,
  onRefresh,
  loading
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        {currentLeague?.logo && (
          <Avatar src={currentLeague.logo} sx={{ width: 50, height: 50 }} />
        )}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            🏆 Matchs {currentLeague?.name || 'Football'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {currentLeague?.description || 'Suivez tous les matchs en temps réel'}
          </Typography>
        </Box>
        <Tooltip title="Actualiser">
          <IconButton 
            onClick={onRefresh}
            disabled={loading}
            sx={{ 
              backgroundColor: 'primary.main', 
              color: 'white',
              '&:hover': { backgroundColor: 'primary.dark' }
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Dernière actualisation */}
      <Typography variant="caption" color="text.secondary">
        Dernière actualisation: {lastRefresh.toLocaleTimeString('fr-FR')}
      </Typography>
    </Box>
  );
};