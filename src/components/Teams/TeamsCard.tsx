// src/components/Teams/TeamCard.tsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Chip,
  Badge,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  EmojiEvents,
  TrendingDown,
  Info,
  ArrowForward
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import type { TeamWithStandingData } from '../../services/api/teamsService';

interface TeamCardProps {
  team: TeamWithStandingData;
  leagueId: number;
  showRanking?: boolean;
  compact?: boolean;
  onClick?: (team: TeamWithStandingData) => void;
}

export default function TeamCard({
  team,
  leagueId,
  showRanking = true,
  compact = false,
  onClick
}: TeamCardProps) {
  
  // Couleurs selon la position
  const getRankColor = (rank?: number) => {
    if (!rank) return 'text.secondary';
    if (rank <= 4) return 'success.main'; // Champions League
    if (rank <= 6) return 'warning.main'; // Europa League
    if (rank >= 18) return 'error.main'; // Relégation
    return 'text.primary';
  };

  // Badge de qualification
  const getQualificationBadge = (rank?: number) => {
    if (!rank) return null;
    
    if (rank === 1) {
      return (
        <Tooltip title="Champion">
          <EmojiEvents sx={{ color: '#ffd700', fontSize: 20 }} />
        </Tooltip>
      );
    }
    
    if (rank >= 18) {
      return (
        <Tooltip title="Zone de relégation">
          <TrendingDown sx={{ color: 'error.main', fontSize: 20 }} />
        </Tooltip>
      );
    }
    
    return null;
  };

  // Fonction pour parser la forme récente
  const parseForm = (form?: string) => {
    if (!form) return null;
    
    return form.replace(/\./g, '').split('').slice(-5).map((result, index) => {
      let color: 'success' | 'error' | 'warning' | 'default' = 'default';
      let label = result;
      
      switch (result) {
        case 'W':
          color = 'success';
          label = 'V';
          break;
        case 'L':
          color = 'error';
          label = 'D';
          break;
        case 'D':
          color = 'warning';
          label = 'N';
          break;
      }
      
      return (
        <Chip
          key={index}
          label={label}
          size="small"
          color={color}
          sx={{ 
            width: 20, 
            height: 20, 
            fontSize: '0.7rem',
            fontWeight: 600,
            mr: 0.3,
            textOverflow: 'clip'
          }}
        />
      );
    });
  };

  const cardContent = (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'all 0.2s ease-in-out',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
          '& .team-name': {
            color: 'primary.main'
          }
        }
      }}
      onClick={() => onClick?.(team)}
    >
      <CardContent sx={{ p: compact ? 2 : 3, textAlign: 'center', height: '100%' }}>
        {/* Badge de position */}
        {showRanking && team.rank && (
          <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
            <Chip
              label={team.rank}
              size="small"
              sx={{
                bgcolor: getRankColor(team.rank),
                color: 'white',
                fontWeight: 700,
                minWidth: 32
              }}
            />
          </Box>
        )}

        {/* Badge de qualification */}
        {getQualificationBadge(team.rank) && (
          <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
            {getQualificationBadge(team.rank)}
          </Box>
        )}

        {/* Logo équipe */}
        <Avatar
          src={team.logo}
          alt={team.name}
          sx={{ 
            width: compact ? 48 : 64, 
            height: compact ? 48 : 64, 
            margin: '0 auto',
            mb: 2,
            borderRadius: 1 // Moins arrondi comme demandé
          }}
        />

        {/* Nom équipe */}
        <Typography 
          variant={compact ? "body1" : "h6"} 
          className="team-name"
          sx={{ 
            fontWeight: 600,
            mb: 1,
            transition: 'color 0.2s ease',
            lineHeight: 1.2,
            minHeight: compact ? 'auto' : '2.4em' // Hauteur consistante
          }}
        >
          {team.name}
        </Typography>

        {/* Pays */}
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mb: showRanking ? 1.5 : 1 }}
        >
          {team.country}
        </Typography>

        {/* Stats si disponibles */}
        {showRanking && team.points !== undefined && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              {team.points} pts
            </Typography>
            
            {team.goalsDiff !== undefined && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: team.goalsDiff > 0 ? 'success.main' : 
                         team.goalsDiff < 0 ? 'error.main' : 'text.secondary',
                  fontWeight: 600
                }}
              >
                {team.goalsDiff > 0 ? '+' : ''}{team.goalsDiff}
              </Typography>
            )}
          </Box>
        )}

        {/* Forme récente */}
        {team.form && !compact && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            {parseForm(team.form)}
          </Box>
        )}

        {/* Action */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 'auto' }}>
          <IconButton size="small" color="primary">
            <ArrowForward />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

  // Wrap avec Link si pas de onClick personnalisé
  if (!onClick) {
    return (
      <Link 
        to={`/league/${leagueId}/team/${team.id}`} 
        style={{ textDecoration: 'none' }}
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}