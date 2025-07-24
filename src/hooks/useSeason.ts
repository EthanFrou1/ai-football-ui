/**
 * Hook personnalisé pour la gestion des saisons
 */

import { useState, useEffect } from 'react';
import { seasonsService } from '../services/api/seasonsService';
import type { Season } from '../services/api/seasonsService';

interface UseSeasonReturn {
  selectedSeason: number;
  setSelectedSeason: (season: number) => void;
  availableSeasons: Season[];
  loading: boolean;
  error: string | null;
  isSeasonAvailable: (year: number) => boolean;
  getSeasonLabel: (year: number) => string;
  recommendedSeason: Season | null;
}

export function useSeason(initialSeason?: number): UseSeasonReturn {
  const [selectedSeason, setSelectedSeason] = useState<number>(initialSeason || 0);
  const [availableSeasons, setAvailableSeasons] = useState<Season[]>([]);
  const [recommendedSeason, setRecommendedSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSeasons();
  }, []);

  const loadSeasons = async () => {
    try {
      setLoading(true);
      setError(null);

      const [seasons, recommended] = await Promise.all([
        seasonsService.getAvailableSeasons(),
        seasonsService.getRecommendedSeason()
      ]);

      setAvailableSeasons(seasons);
      setRecommendedSeason(recommended);

      // Si pas de saison sélectionnée, utiliser la recommandée
      if (!selectedSeason || selectedSeason === 0) {
        setSelectedSeason(recommended.year);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des saisons');
      console.error('Erreur lors du chargement des saisons:', err);
    } finally {
      setLoading(false);
    }
  };

  const isSeasonAvailable = (year: number): boolean => {
    return availableSeasons.some(season => season.year === year && season.available);
  };

  const getSeasonLabel = (year: number): string => {
    return seasonsService.getSeasonLabel(year);
  };

  const handleSetSelectedSeason = (season: number) => {
    if (isSeasonAvailable(season)) {
      setSelectedSeason(season);
      
      // Sauvegarder la préférence dans localStorage
      try {
        localStorage.setItem('preferred_season', season.toString());
      } catch (error) {
        // Ignorer les erreurs de localStorage
      }
    }
  };

  return {
    selectedSeason,
    setSelectedSeason: handleSetSelectedSeason,
    availableSeasons,
    loading,
    error,
    isSeasonAvailable,
    getSeasonLabel,
    recommendedSeason
  };
}

// Hook simplifié pour récupérer juste la saison courante
export function useCurrentSeason(): {
  currentSeason: number;
  loading: boolean;
} {
  const [currentSeason, setCurrentSeason] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seasonsService.getRecommendedSeason()
      .then(season => {
        setCurrentSeason(season.year);
        setLoading(false);
      })
      .catch(() => {
        // Fallback: calculer la saison courante
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        setCurrentSeason(month >= 8 ? year : year - 1);
        setLoading(false);
      });
  }, []);

  return { currentSeason, loading };
}