// src/components/Teams/TeamsHeader.tsx
import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Typography,
  Chip,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Paper
} from '@mui/material';
import {
  Search,
  Clear,
  GridView,
  ViewList,
  Groups,
  FilterList
} from '@mui/icons-material';
import type { SortOption } from '../../services/api/teamsService';

export type ViewMode = 'grid' | 'list';

interface TeamsHeaderProps {
  // Données
  totalTeams: number;
  filteredCount: number;
  
  // Recherche
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  
  // Tri
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  
  // Vue
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  
  // États
  loading?: boolean;
}

const SORT_OPTIONS = [
  { value: 'rank-asc', label: 'Position (1er → Dernier)' },
  { value: 'rank-desc', label: 'Position (Dernier → 1er)' },
  { value: 'name-asc', label: 'Nom (A → Z)' },
  { value: 'name-desc', label: 'Nom (Z → A)' },
  { value: 'points-desc', label: 'Points (Plus → Moins)' },
  { value: 'points-asc', label: 'Points (Moins → Plus)' },
  { value: 'founded-desc', label: 'Fondation (Recent → Ancien)' },
  { value: 'founded-asc', label: 'Fondation (Ancien → Recent)' }
] as const;

export default function TeamsHeader({
  totalTeams,
  filteredCount,
  searchQuery,
  onSearchChange,
  onClearSearch,
  sortOption,
  onSortChange,
  viewMode,
  onViewModeChange,
  loading = false
}: TeamsHeaderProps) {
  
  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: ViewMode | null
  ) => {
    if (newMode) {
      onViewModeChange(newMode);
    }
  };

  const showSearchResults = searchQuery.trim().length > 0;
  const hasFilter = sortOption !== 'rank-asc';

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
      <Grid container spacing={3} alignItems="center">
        {/* Titre et stats */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Groups sx={{ color: 'primary.main', fontSize: 28, mr: 1.5 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Équipes
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={`${totalTeams} équipes`}
              size="small"
              color="primary"
              variant="outlined"
            />
            
            {showSearchResults && (
              <Chip
                label={`${filteredCount} trouvées`}
                size="small"
                color="success"
                variant="filled"
              />
            )}
            
            {hasFilter && (
              <Chip
                icon={<FilterList />}
                label="Filtrée"
                size="small"
                color="warning"
                variant="outlined"
              />
            )}
          </Box>
        </Grid>

        {/* Barre de recherche */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="Rechercher une équipe..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={onClearSearch}
                    edge="end"
                    sx={{ mr: -1 }}
                  >
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.default',
              }
            }}
          />
        </Grid>

        {/* Contrôles (Tri + Vue) */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            {/* Sélecteur de tri */}
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Trier par</InputLabel>
              <Select
                value={sortOption}
                label="Trier par"
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                disabled={loading}
              >
                {SORT_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Toggle Grid/List */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
              disabled={loading}
            >
              <ToggleButton value="grid" aria-label="Vue en grille">
                <GridView />
              </ToggleButton>
              <ToggleButton value="list" aria-label="Vue en liste">
                <ViewList />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Grid>
      </Grid>

      {/* Résultats de recherche */}
      {showSearchResults && (
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            {filteredCount > 0 ? (
              <>
                <strong>{filteredCount}</strong> équipe{filteredCount > 1 ? 's' : ''} trouvée{filteredCount > 1 ? 's' : ''} 
                pour "<strong>{searchQuery}</strong>"
              </>
            ) : (
              <>
                Aucune équipe trouvée pour "<strong>{searchQuery}</strong>"
              </>
            )}
            {filteredCount > 0 && (
              <Typography 
                component="span" 
                color="primary.main" 
                sx={{ ml: 1, cursor: 'pointer', textDecoration: 'underline' }}
                onClick={onClearSearch}
              >
                Effacer la recherche
              </Typography>
            )}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}