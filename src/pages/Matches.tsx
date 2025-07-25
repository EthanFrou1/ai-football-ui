// src/pages/Matches.tsx
import { 
  Box, 
  Typography, 
  Alert, 
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  Stack
} from "@mui/material";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMatches } from "../hooks/useMatches";
import MatchCard from "../components/Matches/MatchCard";
import MatchesHeader from "../components/Matches/MatchesHeader";
import type { MatchData } from "../services/api/matchesService";

// Interface pour les onglets
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`matches-tabpanel-${index}`}
      aria-labelledby={`matches-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function Matches() {
  const navigate = useNavigate();
  
  // Configuration - à adapter selon le context League
  const leagueId = 39; // Premier League
  const season = 2023;
  
  // Hook principal pour les matchs
  const {
    matches,
    recentMatches,
    upcomingMatches,
    allMatches,
    loading,
    error,
    filters,
    setFilters,
    clearFilters,
    sortBy,
    setSortBy,
    stats,
    refetch
  } = useMatches(leagueId, season);

  // État pour les onglets
  const [currentTab, setCurrentTab] = useState(0);

  // Gestion du changement d'onglet
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    // Réinitialiser certains filtres lors du changement d'onglet
    if (newValue !== 0) { // Si pas "Tous"
      setFilters({ ...filters, status: undefined });
    }
  };

  // Extraction des équipes uniques pour le filtre
  const availableTeams = useMemo(() => {
    const teamsMap = new Map();
    
    allMatches.forEach(match => {
      if (!teamsMap.has(match.homeTeam.id)) {
        teamsMap.set(match.homeTeam.id, {
          id: match.homeTeam.id,
          name: match.homeTeam.name,
          logo: match.homeTeam.logo
        });
      }
      if (!teamsMap.has(match.awayTeam.id)) {
        teamsMap.set(match.awayTeam.id, {
          id: match.awayTeam.id,
          name: match.awayTeam.name,
          logo: match.awayTeam.logo
        });
      }
    });

    return Array.from(teamsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [allMatches]);

  // Gestion du clic sur un match
  const handleMatchClick = (match: MatchData) => {
    navigate(`/match/${match.id}`);
  };

  // Données selon l'onglet sélectionné
  const getMatchesForTab = () => {
    switch (currentTab) {
      case 0: return matches; // Tous (avec filtres appliqués)
      case 1: return upcomingMatches; // À venir
      case 2: return recentMatches; // Récents
      default: return matches;
    }
  };

  const currentMatches = getMatchesForTab();

  // Gestion de l'état de chargement global
  if (loading && allMatches.length === 0) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Matchs
        </Typography>
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress size={60} />
        </Box>
      </Box>
    );
  }

  // Gestion d'erreur
  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Matchs
        </Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          Erreur lors du chargement des matchs : {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Matchs
      </Typography>

      {/* Onglets */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="Onglets matchs">
          <Tab 
            label={`Tous (${stats.total})`} 
            id="matches-tab-0"
            aria-controls="matches-tabpanel-0"
          />
          <Tab 
            label={`À venir (${stats.upcoming})`} 
            id="matches-tab-1"
            aria-controls="matches-tabpanel-1"
          />
          <Tab 
            label={`Récents (${stats.recent})`} 
            id="matches-tab-2"
            aria-controls="matches-tabpanel-2"
          />
        </Tabs>
      </Box>

      {/* Panneau "Tous" avec filtres complets */}
      <TabPanel value={currentTab} index={0}>
        <MatchesHeader
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={clearFilters}
          sortBy={sortBy}
          onSortChange={setSortBy}
          availableTeams={availableTeams}
          totalMatches={allMatches.length}
          filteredMatches={matches.length}
          onRefresh={refetch}
          loading={loading}
        />

        {matches.length === 0 ? (
          <Alert severity="info">
            Aucun match ne correspond aux filtres sélectionnés.
          </Alert>
        ) : (
          <Box>
            {matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                showLeagueInfo={true}
                showVenue={true}
                showDetailsButton={true}
                onClick={handleMatchClick}
              />
            ))}
          </Box>
        )}
      </TabPanel>

      {/* Panneau "À venir" */}
      <TabPanel value={currentTab} index={1}>
        <Box mb={2}>
          <Typography variant="h6" gutterBottom>
            Prochains matchs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {upcomingMatches.length} match{upcomingMatches.length > 1 ? 's' : ''} programmé{upcomingMatches.length > 1 ? 's' : ''}
          </Typography>
        </Box>

        {upcomingMatches.length === 0 ? (
          <Alert severity="info">
            Aucun match à venir pour le moment.
          </Alert>
        ) : (
          <Box>
            {upcomingMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                showLeagueInfo={true}
                showVenue={true}
                showDetailsButton={true}
                onClick={handleMatchClick}
              />
            ))}
          </Box>
        )}
      </TabPanel>

      {/* Panneau "Récents" */}
      <TabPanel value={currentTab} index={2}>
        <Box mb={2}>
          <Typography variant="h6" gutterBottom>
            Derniers résultats
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {recentMatches.length} match{recentMatches.length > 1 ? 's' : ''} récent{recentMatches.length > 1 ? 's' : ''}
          </Typography>
        </Box>

        {recentMatches.length === 0 ? (
          <Alert severity="info">
            Aucun match récent disponible.
          </Alert>
        ) : (
          <Box>
            {recentMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                showLeagueInfo={true}
                showVenue={true}
                showDetailsButton={true}
                onClick={handleMatchClick}
              />
            ))}
          </Box>
        )}
      </TabPanel>

      {/* Statistiques en bas de page */}
      {allMatches.length > 0 && (
        <Box mt={4}>
          <Divider sx={{ mb: 2 }} />
          <Stack direction="row" spacing={4} justifyContent="center">
            <Box textAlign="center">
              <Typography variant="h6" color="primary">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total matchs
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h6" color="success.main">
                {stats.finished}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Terminés
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h6" color="primary.main">
                {stats.upcoming}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                À venir
              </Typography>
            </Box>
            {stats.live > 0 && (
              <Box textAlign="center">
                <Typography variant="h6" color="error.main">
                  {stats.live}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  En cours
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>
      )}
    </Box>
  );
}