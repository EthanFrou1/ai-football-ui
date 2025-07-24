/**
 * Composant sélecteur de saison intelligent
 */

import React, { useState, useEffect } from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Box,
  Chip,
  Typography,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { CalendarToday, Info, Stars, Schedule } from '@mui/icons-material';
import { seasonsService } from '../../services/api/seasonsService';
import type { Season } from '../../services/api/seasonsService';

interface SeasonSelectorProps {
  selectedSeason: number;
  onSeasonChange: (season: number) => void;
  variant?: 'standard' | 'outlined' | 'filled';
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  disabled?: boolean;
}

export default function SeasonSelector({
  selectedSeason,
  onSeasonChange,
  variant = 'outlined',
  size = 'medium',
  fullWidth = false,
  disabled = false
}: SeasonSelectorProps) {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiPlan, setApiPlan] = useState<string>('free');

  useEffect(() => {
    loadSeasons();
  }, []);

  const loadSeasons = async () => {
    try {
      setLoading(true);
      const [availableSeasons, plan] = await Promise.all([
        seasonsService.getAvailableSeasons(),
        seasonsService.getApiPlan()
      ]);
      
      setSeasons(availableSeasons);
      setApiPlan(plan.type);
      
      // Si aucune saison sélectionnée, prendre la recommandée
      if (!selectedSeason) {
        const recommended = await seasonsService.getRecommendedSeason();
        onSeasonChange(recommended.year);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des saisons:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeasonIcon = (season: Season) => {
    if (season.current) return <Stars sx={{ fontSize: 16, color: '#ffd700' }} />;
    return <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />;
  };

  const getSeasonChip = (season: Season) => {
    if (season.current) {
      return <Chip label="Actuelle" size="small" color="primary" sx={{ ml: 1 }} />;
    }
    if (!season.available) {
      return <Chip label="Indisponible" size="small" color="error" variant="outlined" sx={{ ml: 1 }} />;
    }
    return null;
  };

  const getPlanBadge = () => {
    const planConfig = {
      free: { label: 'Gratuit', color: '#2196f3', seasons: '2021-2023' },
      basic: { label: 'Basic', color: '#ff9800', seasons: '2018-2023' },
      premium: { label: 'Premium', color: '#4caf50', seasons: '2008+' }
    };

    const config = planConfig[apiPlan as keyof typeof planConfig] || planConfig.free;

    return (
      <Tooltip title={`Plan ${config.label} • Saisons disponibles: ${config.seasons}`}>
        <Chip
          label={config.label}
          size="small"
          sx={{
            bgcolor: `${config.color}15`,
            color: config.color,
            borderColor: config.color,
            border: '1px solid',
            mb: 1
          }}
          icon={<Info sx={{ fontSize: 14 }} />}
        />
      </Tooltip>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={20} />
        <Typography variant="body2" color="text.secondary">
          Chargement des saisons...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Badge du plan API */}
      <Box sx={{ mb: 1 }}>
        {getPlanBadge()}
      </Box>

      {/* Sélecteur de saison */}
      <FormControl variant={variant} size={size} fullWidth={fullWidth} disabled={disabled}>
        <InputLabel id="season-selector-label">Saison</InputLabel>
        <Select
          labelId="season-selector-label"
          value={selectedSeason}
          onChange={(e) => onSeasonChange(e.target.value as number)}
          label="Saison"
          startAdornment={<Schedule sx={{ mr: 1, color: 'text.secondary' }} />}
        >
          {seasons.map((season) => (
            <MenuItem 
              key={season.year} 
              value={season.year}
              disabled={!season.available}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: season.current ? 'primary.light' : 'transparent',
                '&.Mui-selected': {
                  bgcolor: season.current ? 'primary.main' : 'primary.light',
                  color: season.current ? 'white' : 'inherit'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                {getSeasonIcon(season)}
                <Box sx={{ ml: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: season.current ? 600 : 400 }}>
                    {season.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {seasonsService.getSeasonContext(season.year).description}
                  </Typography>
                </Box>
                {getSeasonChip(season)}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Informations additionnelles */}
      {selectedSeason && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Période: {seasonsService.getSeasonLabel(selectedSeason)} 
            {seasons.find(s => s.year === selectedSeason)?.current && ' (En cours)'}
          </Typography>
        </Box>
      )}
    </Box>
  );
}