// src/components/Teams/PlayerCard.tsx
import React from 'react';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Avatar,
  Box,
  Chip,
  Button
} from '@mui/material';
import { Star, Visibility } from '@mui/icons-material';

interface Player {
  id: number;
  name: string;
  age?: number;
  nationality?: string;
  height?: string;
  weight?: string;
  photo?: string;
  injured?: boolean;
  position?: string;
  appearances?: number;
  goals?: number;
  assists?: number;
  rating?: number;
  minutes?: number;
}

interface PlayerCardProps {
  player: Player;
  rank?: number;
  onClick: () => void;
}

export function PlayerCard({ player, rank, onClick }: PlayerCardProps) {
  return (
    <Card 
      sx={{ 
        mb: 2, 
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          bgcolor: 'primary.50'
        }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={3} alignItems="center">
          {/* Photo et rang */}
          <Grid item xs={12} sm={3} md={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {rank && (
                <Box 
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    bgcolor: rank <= 3 ? '#FFD700' : 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.2rem'
                  }}
                >
                  {rank}
                </Box>
              )}
              <Avatar
                src={player.photo}
                alt={player.name}
                sx={{ width: 60, height: 60 }}
              />
            </Box>
          </Grid>

          {/* Infos joueur */}
          <Grid item xs={12} sm={4} md={3}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {player.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {player.age && (
                <Chip label={`${player.age} ans`} size="small" variant="outlined" />
              )}
              {player.nationality && (
                <Chip label={player.nationality} size="small" color="primary" variant="outlined" />
              )}
              {player.position && (
                <Chip label={player.position} size="small" color="secondary" />
              )}
            </Box>
            {player.injured && (
              <Chip label="🤕 Blessé" color="error" size="small" sx={{ mt: 1 }} />
            )}
          </Grid>

          {/* Statistiques principales */}
          <Grid item xs={12} sm={5} md={4}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" color="success.main" fontWeight="bold">
                    {player.goals || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Buts
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" color="info.main" fontWeight="bold">
                    {player.assists || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Passes
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" color="primary.main" fontWeight="bold">
                    {player.appearances || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Matchs
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* Note et actions */}
          <Grid item xs={12} sm={12} md={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {player.rating && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star color="warning" />
                  <Typography variant="h6" fontWeight="bold">
                    {typeof player.rating === 'string' ? parseFloat(player.rating).toFixed(1) : player.rating.toFixed(1)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    /10
                  </Typography>
                </Box>
              )}
              
              <Button
                variant="outlined"
                startIcon={<Visibility />}
                size="small"
                sx={{ ml: 'auto' }}
              >
                Détails
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}