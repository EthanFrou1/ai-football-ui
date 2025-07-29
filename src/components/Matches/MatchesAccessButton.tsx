// src/components/Matches/MatchesAccessButton.tsx
import React from 'react';
import { Button, Box, Chip, Paper, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { 
  Sports as SportsIcon,
  FiberManualRecord as FiberManualRecordIcon 
} from '@mui/icons-material';
// Hook sécurisé pour utiliser le LeagueContext
function useSafeLeague() {
  try {
    const { useLeague } = require('../../contexts/LeagueContext');
    return useLeague();
  } catch {
    return {
      currentLeague: null,
      isLoading: false
    };
  }
}

interface MatchesAccessButtonProps {
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  showLiveBadge?: boolean;
  liveBadgeCount?: number;
}

export const MatchesAccessButton: React.FC<MatchesAccessButtonProps> = ({
  variant = 'contained',
  size = 'medium',
  fullWidth = false,
  showLiveBadge = true,
  liveBadgeCount = 2
}) => {
  const { currentLeague } = useSafeLeague();

  if (!currentLeague) return null;

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <Button
        component={Link}
        to={`/league/${currentLeague.id}/matches`}
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        startIcon={<SportsIcon />}
        sx={{
          backgroundColor: variant === 'contained' ? currentLeague.color : 'transparent',
          borderColor: variant === 'outlined' ? currentLeague.color : 'transparent',
          color: variant === 'contained' ? 'white' : currentLeague.color,
          fontWeight: 'bold',
          textTransform: 'none',
          borderRadius: 2,
          py: 1.5,
          px: 3,
          '&:hover': {
            backgroundColor: variant === 'contained' 
              ? `${currentLeague.color}CC` 
              : `${currentLeague.color}10`,
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          },
          transition: 'all 0.2s ease'
        }}
      >
        Voir les matchs {currentLeague.name}
      </Button>
      
      {/* Badge Live (optionnel) */}
      {showLiveBadge && liveBadgeCount > 0 && (
        <Chip
          icon={<FiberManualRecordIcon sx={{ fontSize: 10, animation: 'pulse 2s infinite' }} />}
          label={`${liveBadgeCount} LIVE`}
          size="small"
          sx={{
            position: 'absolute',
            top: -8,
            right: -8,
            backgroundColor: '#ef4444',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.7rem',
            height: 20,
            '& .MuiChip-label': { px: 1 },
            '& .MuiChip-icon': { color: 'white !important', marginLeft: '4px !important' },
            animation: 'pulse 2s infinite'
          }}
        />
      )}
    </Box>
  );
};

// Version Card pour une intégration plus riche dans les classements
export const MatchesAccessCard: React.FC = () => {
  const { currentLeague } = useSafeLeague();

  if (!currentLeague) return null;

  return (
    <Paper 
      elevation={2}
      sx={{ 
        p: 3, 
        background: `linear-gradient(135deg, ${currentLeague.color}15 0%, ${currentLeague.color}05 100%)`,
        border: `1px solid ${currentLeague.color}30`,
        borderRadius: 2
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: currentLeague.color, mb: 0.5 }}>
            🏆 Matchs du championnat
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Découvrez tous les matchs en cours et à venir
          </Typography>
        </Box>
        <MatchesAccessButton 
          variant="contained" 
          showLiveBadge={true}
          liveBadgeCount={2}
        />
      </Box>
    </Paper>
  );
};

// Version compacte pour les espaces restreints
export const CompactMatchesButton: React.FC = () => {
  const { currentLeague } = useSafeLeague();

  if (!currentLeague) return null;

  return (
    <Button
      component={Link}
      to={`/league/${currentLeague.id}/matches`}
      variant="outlined"
      size="small"
      startIcon={<SportsIcon />}
      sx={{
        borderColor: currentLeague.color,
        color: currentLeague.color,
        fontWeight: 600,
        textTransform: 'none',
        '&:hover': {
          backgroundColor: `${currentLeague.color}10`,
          borderColor: currentLeague.color
        }
      }}
    >
      Matchs
    </Button>
  );
};