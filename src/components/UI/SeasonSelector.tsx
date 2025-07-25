/**
 * Composant sélecteur de saison SIMPLE - Plan gratuit uniquement
 */

import React from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Box,
  Typography
} from '@mui/material';

interface SeasonSelectorProps {
  selectedSeason: number;
  onSeasonChange: (season: number) => void;
  fullWidth?: boolean;
}

export default function SeasonSelector({
  selectedSeason,
  onSeasonChange,
  fullWidth = false
}: SeasonSelectorProps) {
  
  // Saisons disponibles pour le plan gratuit (2021-2023)
  const availableSeasons = [
    { year: 2023, label: '2023-24' },
    { year: 2022, label: '2022-23' },
    { year: 2021, label: '2021-22' }
  ];

  return (
    <Box>
      <FormControl variant="outlined" size="medium" fullWidth={fullWidth}>
        <InputLabel>Saison</InputLabel>
        <Select
          value={selectedSeason}
          onChange={(e) => onSeasonChange(e.target.value as number)}
          label="Saison"
        >
          {availableSeasons.map((season) => (
            <MenuItem key={season.year} value={season.year}>
              {season.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}