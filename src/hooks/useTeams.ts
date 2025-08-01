// src/hooks/useTeams.ts - VERSION CORRIGÉE
import { useState, useEffect, useMemo } from 'react';
import { 
  fetchTeamsFromStandings,
  searchTeams,
  sortTeams,
  filterTeamsByQualification,
  type TeamFromStandings
} from '../services/api/teamsService';
import { useDebouncedValue } from './useDebouncedValue';

// Types pour les filtres
interface TeamFilters {
  search: string;
  sortBy: 'position' | 'name' | 'points';
  qualification: 'all' | 'champions-league' | 'europa-league' | 'relegation';
  viewMode: 'grid' | 'list';
}

// Interface du hook
interface UseTeamsResult {
  // Données
  teams: TeamFromStandings[];
  allTeams: TeamFromStandings[];
  
  // États
  loading: boolean;
  error: string | null;
  
  // Filtres et recherche
  filters: TeamFilters;
  setFilters: (filters: Partial<TeamFilters>) => void;
  clearFilters: () => void;
  
  // Recherche avec debounce
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  debouncedSearch: string;
  
  // Statistiques
  stats: {
    total: number;
    filtered: number;
    championsLeague: number;
    europaLeague: number;
    relegation: number;
    averagePoints: number;
    topScorer: TeamFromStandings | null;
    bestDefense: TeamFromStandings | null;
  };
  
  // Actions
  refetch: () => Promise<void>;
}

// Fonction locale pour calculer les statistiques (remplace getTeamsStats)
function calculateTeamsStats(teams: TeamFromStandings[]) {
  if (teams.length === 0) {
    return {
      total: 0,
      championsLeague: 0,
      europaLeague: 0,
      relegation: 0,
      averagePoints: 0,
      topScorer: null,
      bestDefense: null,
    };
  }

  const championsLeague = teams.filter(t => t.position <= 3).length;
  const europaLeague = teams.filter(t => t.position >= 4 && t.position <= 6).length;
  const relegation = teams.filter(t => t.position >= teams.length - 2).length;
  const averagePoints = teams.reduce((sum, t) => sum + t.points, 0) / teams.length;
  
  const topScorer = teams.reduce((top, team) => 
    team.goals_for > (top?.goals_for || 0) ? team : top, teams[0]);
  
  const bestDefense = teams.reduce((best, team) => 
    team.goals_against < (best?.goals_against || Infinity) ? team : best, teams[0]);

  return {
    total: teams.length,
    championsLeague,
    europaLeague,
    relegation,
    averagePoints: Math.round(averagePoints * 10) / 10,
    topScorer,
    bestDefense,
  };
}

export function useTeams(leagueId: number, season: number): UseTeamsResult {
  // États principaux
  const [allTeams, setAllTeams] = useState<TeamFromStandings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // États pour filtres
  const [filters, setFiltersState] = useState<TeamFilters>({
    search: '',
    sortBy: 'position',
    qualification: 'all',
    viewMode: 'grid',
  });

  // Recherche avec debounce
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  // Fonction pour charger les données
  const fetchData = async () => {
    if (!leagueId || !season) return;

    setLoading(true);
    setError(null);

    try {
      console.log(`🔄 useTeams: Chargement des équipes pour league=${leagueId}, season=${season}`);
      const teams = await fetchTeamsFromStandings(leagueId, season);
      console.log(`✅ useTeams: ${teams.length} équipes chargées`);
      setAllTeams(teams);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des équipes';
      setError(errorMessage);
      console.error('❌ Erreur useTeams:', err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage et quand leagueId/season change
  useEffect(() => {
    fetchData();
  }, [leagueId, season]);

  // Mettre à jour les filtres quand la recherche change
  useEffect(() => {
    setFiltersState(prev => ({
      ...prev,
      search: debouncedSearch,
    }));
  }, [debouncedSearch]);

  // Appliquer les filtres et la recherche
  const filteredTeams = useMemo(() => {
    let result = [...allTeams];

    // Recherche
    if (filters.search) {
      result = searchTeams(result, filters.search);
    }

    // Filtre par qualification
    result = filterTeamsByQualification(result, filters.qualification);

    // Tri
    result = sortTeams(result, filters.sortBy);

    return result;
  }, [allTeams, filters]);

  // Calculer les statistiques
  const stats = useMemo(() => {
    const baseStats = calculateTeamsStats(allTeams);

    return {
      ...baseStats,
      filtered: filteredTeams.length,
    };
  }, [allTeams, filteredTeams]);

  // Fonction pour mettre à jour les filtres
  const setFilters = (newFilters: Partial<TeamFilters>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
    }));
  };

  // Fonction pour vider les filtres
  const clearFilters = () => {
    setSearchQuery('');
    setFiltersState({
      search: '',
      sortBy: 'position',
      qualification: 'all',
      viewMode: 'grid',
    });
  };

  // Fonction pour recharger les données
  const refetch = async () => {
    await fetchData();
  };

  return {
    // Données
    teams: filteredTeams,
    allTeams,
    
    // États
    loading,
    error,
    
    // Filtres et recherche
    filters,
    setFilters,
    clearFilters,
    
    // Recherche avec debounce
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    
    // Statistiques
    stats,
    
    // Actions
    refetch,
  };
}