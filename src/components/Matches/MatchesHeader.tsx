// src/components/Matches/MatchesHeader.tsx
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  Stack,
  IconButton,
  Tooltip, 
  type SelectChangeEvent
} from "@mui/material";
import { 
  FilterList, 
  Clear, 
  Sort,
  CalendarToday,
  Groups,
  Refresh
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';

// Types pour les filtres et le tri
type SortOption = 'date' | 'date-desc' | 'team-home' | 'team-away';
type StatusFilter = 'all' | 'recent' | 'upcoming' | 'live' | 'finished' | 'scheduled';

interface MatchFilters {
  teamId?: number;
  startDate?: Date;
  endDate?: Date;
  status?: StatusFilter;
}

interface MatchesHeaderProps {
  // Filtres
  filters: MatchFilters;
  onFiltersChange: (filters: MatchFilters) => void;
  onClearFilters: () => void;
  
  // Tri
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  
  // Équipes disponibles pour le filtre
  availableTeams?: Array<{ id: number; name: string; logo: string }>;
  
  // Statistiques
  totalMatches: number;
  filteredMatches: number;
  
  // Actions
  onRefresh?: () => void;
  loading?: boolean;
}

const MatchesHeader = ({
  filters,
  onFiltersChange,
  onClearFilters,
  sortBy,
  onSortChange,
  availableTeams = [],
  totalMatches,
  filteredMatches,
  onRefresh,
  loading = false
}: MatchesHeaderProps) => {

  // Gestion du changement de statut
  const handleStatusChange = (event: SelectChangeEvent<StatusFilter>) => {
    onFiltersChange({
      ...filters,
      status: event.target.value as StatusFilter
    });
  };

  // Gestion du changement d'équipe
  const handleTeamChange = (event: SelectChangeEvent<number>) => {
    const teamId = event.target.value as number;
    onFiltersChange({
      ...filters,
      teamId: teamId === 0 ? undefined : teamId
    });
  };

  // Gestion du changement de tri
  const handleSortChange = (event: SelectChangeEvent<SortOption>) => {
    onSortChange(event.target.value as SortOption);
  };

  // Gestion des dates
  const handleStartDateChange = (date: Date | null) => {
    onFiltersChange({
      ...filters,
      startDate: date || undefined
    });
  };

  const handleEndDateChange = (date: Date | null) => {
    onFiltersChange({
      ...filters,
      endDate: date || undefined
    });
  };

  // Compter les filtres actifs
  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
      <Box mb={3}>
        {/* Titre et statistiques */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Matchs
            {filteredMatches !== totalMatches && (
              <Chip 
                label={`${filteredMatches}/${totalMatches}`}
                size="small" 
                sx={{ ml: 1 }}
                color="primary"
              />
            )}
          </Typography>
          
          <Box display="flex" alignItems="center" gap={1}>
            {activeFiltersCount > 0 && (
              <Tooltip title="Effacer les filtres">
                <IconButton onClick={onClearFilters} size="small">
                  <Clear />
                </IconButton>
              </Tooltip>
            )}
            
            {onRefresh && (
              <Tooltip title="Actualiser">
                <IconButton 
                  onClick={onRefresh} 
                  disabled={loading}
                  size="small"
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Filtres */}
        <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
          {/* Filtre par statut */}
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={filters.status || 'all'}
              label="Statut"
              onChange={handleStatusChange}
              startAdornment={<FilterList sx={{ mr: 1, fontSize: 18 }} />}
            >
              <MenuItem value="all">Tous</MenuItem>
              <MenuItem value="upcoming">À venir</MenuItem>
              <MenuItem value="recent">Récents</MenuItem>
              <MenuItem value="live">En cours</MenuItem>
              <MenuItem value="finished">Terminés</MenuItem>
              <MenuItem value="scheduled">Programmés</MenuItem>
            </Select>
          </FormControl>

          {/* Filtre par équipe */}
          {availableTeams.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Équipe</InputLabel>
              <Select
                value={filters.teamId || 0}
                label="Équipe"
                onChange={handleTeamChange}
                startAdornment={<Groups sx={{ mr: 1, fontSize: 18 }} />}
              >
                <MenuItem value={0}>Toutes les équipes</MenuItem>
                {availableTeams.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <img 
                        src={team.logo} 
                        alt={team.name}
                        style={{ width: 20, height: 20 }}
                      />
                      {team.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Date de début */}
          <DatePicker
            label="Date début"
            value={filters.startDate || null}
            onChange={handleStartDateChange}
            slotProps={{
              textField: {
                size: 'small',
                sx: { minWidth: 140 },
                InputProps: {
                  startAdornment: <CalendarToday sx={{ mr: 1, fontSize: 18 }} />
                }
              }
            }}
          />

          {/* Date de fin */}
          <DatePicker
            label="Date fin"
            value={filters.endDate || null}
            onChange={handleEndDateChange}
            slotProps={{
              textField: {
                size: 'small',
                sx: { minWidth: 140 },
                InputProps: {
                  startAdornment: <CalendarToday sx={{ mr: 1, fontSize: 18 }} />
                }
              }
            }}
          />

          {/* Tri */}
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Trier par</InputLabel>
            <Select
              value={sortBy}
              label="Trier par"
              onChange={handleSortChange}
              startAdornment={<Sort sx={{ mr: 1, fontSize: 18 }} />}
            >
              <MenuItem value="date">Date (croissant)</MenuItem>
              <MenuItem value="date-desc">Date (décroissant)</MenuItem>
              <MenuItem value="team-home">Équipe domicile</MenuItem>
              <MenuItem value="team-away">Équipe extérieur</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Indicateur de filtres actifs */}
        {activeFiltersCount > 0 && (
          <Box mt={2}>
            <Chip 
              label={`${activeFiltersCount} filtre${activeFiltersCount > 1 ? 's' : ''} actif${activeFiltersCount > 1 ? 's' : ''}`}
              size="small"
              color="primary"
              variant="outlined"
              icon={<FilterList />}
              onDelete={onClearFilters}
            />
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default MatchesHeader;