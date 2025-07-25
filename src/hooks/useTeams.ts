// src/hooks/useTeams.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { teamsService, sortTeams, filterTeamsBySearch, type TeamWithStandingData, type SortOption, type TeamsFilters } from '../services/api/teamsService';
import { useApi } from './useApi';
import { useDebouncedValue } from './useDebouncedValue';

interface UseTeamsOptions {
  leagueId: number;
  season: number;
  initialSort?: SortOption;
}

interface UseTeamsReturn {
  // Données
  teams: TeamWithStandingData[];
  filteredTeams: TeamWithStandingData[];
  total: number;
  
  // États
  loading: boolean;
  error: any; // ✅ Changé pour correspondre au type de useApi
  
  // Contrôles
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOption: SortOption;
  setSortOption: (sort: SortOption) => void;
  
  // Actions
  refetch: () => void;
  clearSearch: () => void;
}

export const useTeams = ({
  leagueId,
  season,
  initialSort = 'rank-asc'
}: UseTeamsOptions): UseTeamsReturn => {
  // États locaux
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>(initialSort);
  const [allTeams, setAllTeams] = useState<TeamWithStandingData[]>([]);
  
  // Debounce de la recherche pour éviter trop de re-calculs
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  
  // Appel API unique (sans filtres) - les filtres sont appliqués côté client
  const { 
    data: teamsData, 
    loading, 
    error, 
    refetch 
  } = useApi(
    async () => {
      if (!leagueId || !season) throw new Error('League ID et saison requis');
      console.log('🔄 Fetching teams data from API...');
      return teamsService.getTeams(leagueId, season); // Pas de filtres ici !
    },
    [leagueId, season], // Seulement dépendant de league/season
    !!(leagueId && season)
  );
  
  // Mettre à jour les équipes quand les données arrivent
  useEffect(() => {
    if (teamsData?.teams) {
      setAllTeams(teamsData.teams);
    }
  }, [teamsData]);
  
  // Filtrage et tri côté client en temps réel
  const filteredTeams = useMemo(() => {
    let result = [...allTeams];
    
    // 1. Filtrage par recherche
    if (debouncedSearch.trim()) {
      const searchLower = debouncedSearch.toLowerCase();
      result = result.filter(team => 
        team.name.toLowerCase().includes(searchLower) ||
        team.country.toLowerCase().includes(searchLower)
      );
    }
    
    // 2. Tri
    result = sortTeams(result, sortOption);
    
    return result;
  }, [allTeams, debouncedSearch, sortOption]);
  
  // Fonction pour vider la recherche
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);
  
  // Debug en développement
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 useTeams Debug:', {
        leagueId,
        season,
        searchQuery: debouncedSearch,
        sortOption,
        allTeamsCount: allTeams.length,
        filteredCount: filteredTeams.length,
        loading,
        error: error?.message,
        cacheInfo: teamsService.getCacheInfo()
      });
    }
  }, [leagueId, season, debouncedSearch, sortOption, allTeams.length, filteredTeams.length, loading, error]);
  
  return {
    // Données
    teams: allTeams,
    filteredTeams,
    total: allTeams.length,
    
    // États
    loading,
    error,
    
    // Contrôles
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    
    // Actions
    refetch,
    clearSearch
  };
};

// Hook pour récupérer une équipe spécifique
export const useTeamDetails = (teamId: number, season?: number) => {
  return useApi(
    async () => {
      if (!teamId) throw new Error('Team ID requis');
      return teamsService.getTeamDetails(teamId, season);
    },
    [teamId, season],
    !!teamId
  );
};