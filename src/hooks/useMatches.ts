// src/hooks/useMatches.ts
import { useState, useEffect, useMemo } from 'react';
import { 
  fetchAllMatches, 
  fetchRecentMatches, 
  fetchUpcomingMatches, 
  filterMatchesByTeam,
  filterMatchesByDateRange
} from '../services/api/matchesService';
import type { MatchData } from "../services/api/matchesService";
import { useDebouncedValue } from './useDebouncedValue';

// Types pour les filtres
interface MatchFilters {
  teamId?: number;
  startDate?: Date;
  endDate?: Date;
  status?: 'all' | 'recent' | 'upcoming' | 'live' | 'finished' | 'scheduled';
}

// Types pour les options de tri
type SortOption = 'date' | 'date-desc' | 'team-home' | 'team-away';

// Interface du hook
interface UseMatchesResult {
  // Données
  matches: MatchData[];
  recentMatches: MatchData[];
  upcomingMatches: MatchData[];
  allMatches: MatchData[];
  
  // États
  loading: boolean;
  error: string | null;
  
  // Filtres et recherche
  filters: MatchFilters;
  setFilters: (filters: MatchFilters) => void;
  clearFilters: () => void;
  
  // Tri
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  
  // Statistiques
  stats: {
    total: number;
    recent: number;
    upcoming: number;
    live: number;
    finished: number;
  };
  
  // Actions
  refetch: () => Promise<void>;
}

export function useMatches(leagueId: number, season: number): UseMatchesResult {
  // États principaux
  const [allMatches, setAllMatches] = useState<MatchData[]>([]);
  const [recentMatches, setRecentMatches] = useState<MatchData[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour filtres et tri
  const [filters, setFilters] = useState<MatchFilters>({});
  const [sortBy, setSortBy] = useState<SortOption>('date');

  // Fonction pour charger les données
  const fetchData = async () => {
    if (!leagueId || !season) return;

    setLoading(true);
    setError(null);

    try {
      // Charger tous les matchs (utilise le cache intelligent)
      const [all, recent, upcoming] = await Promise.all([
        fetchAllMatches(leagueId, season),
        fetchRecentMatches(leagueId, season),
        fetchUpcomingMatches(leagueId, season),
      ]);

      setAllMatches(all);
      setRecentMatches(recent);
      setUpcomingMatches(upcoming);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des matchs';
      setError(errorMessage);
      console.error('Erreur useMatches:', err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage et quand leagueId/season change
  useEffect(() => {
    fetchData();
  }, [leagueId, season]);

  // Fonction de tri
  const sortMatches = useMemo(() => {
    return (matches: MatchData[], sortOption: SortOption): MatchData[] => {
      const sorted = [...matches];
      
      switch (sortOption) {
        case 'date':
          return sorted.sort((a, b) => a.timestamp - b.timestamp);
        case 'date-desc':
          return sorted.sort((a, b) => b.timestamp - a.timestamp);
        case 'team-home':
          return sorted.sort((a, b) => a.homeTeam.name.localeCompare(b.homeTeam.name));
        case 'team-away':
          return sorted.sort((a, b) => a.awayTeam.name.localeCompare(b.awayTeam.name));
        default:
          return sorted;
      }
    };
  }, []);

  // Appliquer les filtres et le tri
  const filteredMatches = useMemo(() => {
    let result = [...allMatches];

    // Filtre par équipe
    if (filters.teamId) {
      result = filterMatchesByTeam(result, filters.teamId);
    }

    // Filtre par dates
    if (filters.startDate && filters.endDate) {
      result = filterMatchesByDateRange(result, filters.startDate, filters.endDate);
    }

    // Filtre par statut
    if (filters.status && filters.status !== 'all') {
      switch (filters.status) {
        case 'recent':
          result = result.filter(match => match.status === 'finished');
          break;
        case 'upcoming':
          result = result.filter(match => match.status === 'scheduled');
          break;
        case 'live':
          result = result.filter(match => match.status === 'live');
          break;
        case 'finished':
          result = result.filter(match => match.status === 'finished');
          break;
        case 'scheduled':
          result = result.filter(match => match.status === 'scheduled');
          break;
      }
    }

    // Appliquer le tri
    return sortMatches(result, sortBy);
  }, [allMatches, filters, sortBy, sortMatches]);

  // Calculer les statistiques
  const stats = useMemo(() => {
    return {
      total: allMatches.length,
      recent: recentMatches.length,
      upcoming: upcomingMatches.length,
      live: allMatches.filter(m => m.status === 'live').length,
      finished: allMatches.filter(m => m.status === 'finished').length,
    };
  }, [allMatches, recentMatches, upcomingMatches]);

  // Fonction pour vider les filtres
  const clearFilters = () => {
    setFilters({});
  };

  // Fonction pour recharger les données
  const refetch = async () => {
    await fetchData();
  };

  return {
    // Données
    matches: filteredMatches,
    recentMatches,
    upcomingMatches,
    allMatches,
    
    // États
    loading,
    error,
    
    // Filtres et recherche
    filters,
    setFilters,
    clearFilters,
    
    // Tri
    sortBy,
    setSortBy,
    
    // Statistiques
    stats,
    
    // Actions
    refetch,
  };
}

// Hook spécialisé pour les matchs récents seulement
export function useRecentMatches(leagueId: number, season: number) {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMatches = async () => {
      if (!leagueId || !season) return;

      setLoading(true);
      setError(null);

      try {
        const data = await fetchRecentMatches(leagueId, season);
        setMatches(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des matchs récents';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, [leagueId, season]);

  return { matches, loading, error };
}

// Hook spécialisé pour les matchs à venir seulement
export function useUpcomingMatches(leagueId: number, season: number) {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMatches = async () => {
      if (!leagueId || !season) return;

      setLoading(true);
      setError(null);

      try {
        const data = await fetchUpcomingMatches(leagueId, season);
        setMatches(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des matchs à venir';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, [leagueId, season]);

  return { matches, loading, error };
}