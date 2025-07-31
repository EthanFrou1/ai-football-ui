// src/pages/Matches.tsx - AVEC NAVIGATION VERS DÉTAILS
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  Alert,
  Snackbar,
  Grid,
  Collapse,
  IconButton,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  SportsSoccer as SoccerIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  LiveTv as LiveIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSafeLeague } from '../contexts/LeagueContext';
import { MatchCard } from '../components/Matches/MatchCard';
import { 
  fetchLiveMatches, 
  fetchUpcomingMatches, 
  fetchRecentMatches,
  type MatchData 
} from '../services/api/matchesService';

// Types pour les onglets
type TabValue = 'live' | 'upcoming' | 'recent';

// Interface pour les sections de championnats
interface LeagueSection {
  leagueId: number;
  leagueName: string;
  matches: MatchData[];
}

// ============= COMPOSANT PRINCIPAL =============
function Matches() {
  const navigate = useNavigate();
  
  // Context de ligue (peut être undefined si route directe /matches)
  const leagueContext = useSafeLeague();
  const selectedLeague = leagueContext.selectedLeague;
  
  // États principaux
  const [tabValue, setTabValue] = useState<TabValue>('live');
  const [allMatches, setAllMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // États pour l'interface
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ============= NAVIGATION VERS DÉTAILS =============
  const handleMatchClick = (match: MatchData) => {
    console.log(`🎯 Navigation vers match ${match.id}`);
    
    if (selectedLeague) {
      // Mode ligue spécifique → URL avec ligue
      navigate(`/league/${selectedLeague.id}/match/${match.id}`);
    } else {
      // Mode global → URL simple
      navigate(`/match/${match.id}`);
    }
  };

  // Auto-refresh pour les matchs live (toutes les 30 secondes)
  useEffect(() => {
    if (tabValue !== 'live') return;

    const interval = setInterval(() => {
      handleRefresh(false); // Refresh silencieux
    }, 30000);

    return () => clearInterval(interval);
  }, [tabValue]);

  // Charger les données selon l'onglet sélectionné - VERSION DEBUGGÉE
  const fetchMatchesData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError(null);

    try {
      let matches: MatchData[] = [];

      console.log('🔍 Debug fetchMatchesData:', {
        tabValue,
        selectedLeague: selectedLeague ? {
          id: selectedLeague.id,
          name: selectedLeague.name,
          idType: typeof selectedLeague.id
        } : null
      });

      if (selectedLeague) {
        // Mode ligue spécifique - VÉRIFICATIONS AJOUTÉES
        console.log(`🔍 Mode ligue spécifique: ${selectedLeague.name} (ID: ${selectedLeague.id})`);
        
        // Vérifier que l'ID est bien un nombre
        if (typeof selectedLeague.id !== 'number') {
          throw new Error(`ID de ligue invalide: ${typeof selectedLeague.id} - ${selectedLeague.id}`);
        }
        
        switch (tabValue) {
          case 'live':
            console.log('🔴 Appel fetchLiveMatches avec leagueId:', selectedLeague.id);
            matches = await fetchLiveMatches(selectedLeague.id);
            break;
          case 'upcoming':
            console.log('⏰ Appel fetchUpcomingMatches avec:', selectedLeague.id, 2023);
            matches = await fetchUpcomingMatches(selectedLeague.id, 2023);
            break;
          case 'recent':
            console.log('📅 Appel fetchRecentMatches avec:', selectedLeague.id, 2023);
            matches = await fetchRecentMatches(selectedLeague.id, 2023);
            break;
        }
      } else {
        // Mode global (toutes les ligues principales)
        console.log(`🌍 Mode global - onglet: ${tabValue}`);
        
        switch (tabValue) {
          case 'live':
            console.log('🔴 Appel fetchLiveMatches sans leagueId');
            matches = await fetchLiveMatches(); // Pas de paramètre
            break;
          case 'upcoming':
            console.log('⏰ Appel fetchUpcomingMatches pour ligues multiples');
            // Récupérer les matchs à venir des principales ligues
            const upcomingPromises = [61, 39, 78, 140, 135].map(leagueId => {
              console.log(`  - Ligue ${leagueId}`);
              return fetchUpcomingMatches(leagueId, 2023).catch(error => {
                console.warn(`⚠️ Erreur ligue ${leagueId}:`, error);
                return [];
              });
            });
            const upcomingResults = await Promise.all(upcomingPromises);
            matches = upcomingResults.flat();
            break;
          case 'recent':
            console.log('📅 Appel fetchRecentMatches pour ligues multiples');
            // Récupérer les matchs récents des principales ligues
            const recentPromises = [61, 39, 78, 140, 135].map(leagueId => {
              console.log(`  - Ligue ${leagueId}`);
              return fetchRecentMatches(leagueId, 2023).catch(error => {
                console.warn(`⚠️ Erreur ligue ${leagueId}:`, error);
                return [];
              });
            });
            const recentResults = await Promise.all(recentPromises);
            matches = recentResults.flat();
            break;
        }
      }

      console.log(`✅ Total matchs chargés: ${matches.length}`);
      setAllMatches(matches);
      setLastUpdate(new Date());

      // Auto-expand les sections avec des matchs live
      if (tabValue === 'live') {
        const liveLeagues = new Set(
          matches
            .filter(match => match.status === 'live')
            .map(match => match.league.id)
        );
        setExpandedSections(liveLeagues);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('❌ Erreur détaillée:', {
        error: err,
        message: errorMessage,
        tabValue,
        selectedLeague
      });
      setError(errorMessage);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  // Charger les données au changement d'onglet
  useEffect(() => {
    fetchMatchesData();
  }, [tabValue, selectedLeague]);

  // Organiser les matchs par ligue
  const leagueSections = useMemo(() => {
    const sectionsMap = new Map<number, LeagueSection>();

    allMatches.forEach(match => {
      if (!sectionsMap.has(match.league.id)) {
        sectionsMap.set(match.league.id, {
          leagueId: match.league.id,
          leagueName: match.league.name,
          matches: [],
        });
      }
      sectionsMap.get(match.league.id)!.matches.push(match);
    });

    // Convertir en array et trier par nombre de matchs (décroissant)
    return Array.from(sectionsMap.values()).sort((a, b) => b.matches.length - a.matches.length);
  }, [allMatches]);

  // Gérer le refresh
  const handleRefresh = async (showSnackbar = true) => {
    setIsRefreshing(true);
    await fetchMatchesData(false);
    setIsRefreshing(false);
    
    if (showSnackbar) {
      setSnackbarOpen(true);
    }
  };

  // Gérer l'expansion/collapse des sections
  const toggleSection = (leagueId: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(leagueId)) {
      newExpanded.delete(leagueId);
    } else {
      newExpanded.add(leagueId);
    }
    setExpandedSections(newExpanded);
  };

  // Calculer les statistiques pour les badges
  const getTabStats = (tabType: TabValue) => {
    switch (tabType) {
      case 'live':
        return allMatches.filter(match => match.status === 'live').length;
      case 'upcoming':
        return allMatches.filter(match => match.status === 'scheduled').length;
      case 'recent':
        return allMatches.filter(match => match.status === 'finished').length;
      default:
        return 0;
    }
  };

  // Rendu de l'en-tête
  const renderHeader = () => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Box>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
          {selectedLeague ? `Matchs - ${selectedLeague.name}` : 'Matchs Football'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Dernière mise à jour : {lastUpdate.toLocaleTimeString()}
          {tabValue === 'live' && ' • Actualisation automatique'}
        </Typography>
      </Box>
      
      <Button
        variant="outlined"
        startIcon={isRefreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
        onClick={() => handleRefresh()}
        disabled={isRefreshing}
        sx={{ minWidth: 120 }}
      >
        {isRefreshing ? 'Actualisation...' : 'Actualiser'}
      </Button>
    </Box>
  );

  // Rendu des onglets
  const renderTabs = () => (
    <Paper sx={{ mb: 3 }}>
      <Tabs 
        value={tabValue} 
        onChange={(_, newValue) => setTabValue(newValue)}
        variant="fullWidth"
        sx={{ 
          '& .MuiTab-root': { 
            fontWeight: 'bold',
            textTransform: 'none',
          }
        }}
      >
        <Tab 
          value="live" 
          icon={<LiveIcon />}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Live
              {tabValue === 'live' && getTabStats('live') > 0 && (
                <Chip 
                  label={getTabStats('live')} 
                  size="small" 
                  color="error"
                  sx={{ height: 20, fontSize: '0.75rem' }}
                />
              )}
            </Box>
          }
        />
        <Tab 
          value="upcoming" 
          icon={<ScheduleIcon />}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              À venir
              {tabValue === 'upcoming' && getTabStats('upcoming') > 0 && (
                <Chip 
                  label={getTabStats('upcoming')} 
                  size="small" 
                  color="primary"
                  sx={{ height: 20, fontSize: '0.75rem' }}
                />
              )}
            </Box>
          }
        />
        <Tab 
          value="recent" 
          icon={<CheckCircleIcon />}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Terminés
              {tabValue === 'recent' && getTabStats('recent') > 0 && (
                <Chip 
                  label={getTabStats('recent')} 
                  size="small" 
                  color="success"
                  sx={{ height: 20, fontSize: '0.75rem' }}
                />
              )}
            </Box>
          }
        />
      </Tabs>
    </Paper>
  );

  // Rendu d'une section de ligue
  const renderLeagueSection = (section: LeagueSection) => {
    const isExpanded = expandedSections.has(section.leagueId);
    const liveCount = section.matches.filter(match => match.status === 'live').length;

    return (
      <Paper key={section.leagueId} sx={{ mb: 2 }}>
        {/* En-tête de section */}
        <Box
          sx={{
            p: 2,
            bgcolor: isExpanded ? 'primary.main' : 'grey.100',
            color: isExpanded ? 'white' : 'text.primary',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            '&:hover': {
              bgcolor: isExpanded ? 'primary.dark' : 'grey.200',
            },
          }}
          onClick={() => toggleSection(section.leagueId)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <SoccerIcon />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {section.leagueName}
            </Typography>
            <Chip 
              label={`${section.matches.length} match${section.matches.length > 1 ? 's' : ''}`}
              size="small"
              sx={{ 
                bgcolor: isExpanded ? 'rgba(255,255,255,0.2)' : 'primary.main',
                color: isExpanded ? 'white' : 'white',
              }}
            />
            {liveCount > 0 && (
              <Chip 
                label={`${liveCount} live`}
                size="small"
                color="error"
                sx={{ color: 'white' }}
              />
            )}
          </Box>
          
          <IconButton size="small" sx={{ color: 'inherit' }}>
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        {/* Contenu de la section */}
        <Collapse in={isExpanded}>
          <Box sx={{ p: 2 }}>
            {section.matches.length === 0 ? (
              <Typography color="text.secondary" textAlign="center">
                Aucun match {tabValue === 'live' ? 'en cours' : tabValue === 'upcoming' ? 'à venir' : 'récent'}
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {section.matches.map(match => (
                  <Grid item xs={12} md={6} lg={4} key={match.id}>
                    <MatchCard 
                      match={match} 
                      onClick={() => handleMatchClick(match)}
                      isLive={match.status === 'live'}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Collapse>
      </Paper>
    );
  };

  // Rendu du contenu principal
  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={() => fetchMatchesData()}>
              Réessayer
            </Button>
          }
        >
          {error}
        </Alert>
      );
    }

    if (leagueSections.length === 0) {
      return (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <SoccerIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Aucun match {tabValue === 'live' ? 'en cours' : tabValue === 'upcoming' ? 'à venir' : 'récent'}
          </Typography>
        </Paper>
      );
    }

    return (
      <Box>
        {leagueSections.map(renderLeagueSection)}
      </Box>
    );
  };

  return (
    <Container maxWidth="lg">
      {renderHeader()}
      {renderTabs()}
      {renderContent()}
      
      {/* Snackbar pour confirmer le refresh */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Données actualisées"
      />
    </Container>
  );
}

// ============= EXPORT DEFAULT =============
export default Matches;