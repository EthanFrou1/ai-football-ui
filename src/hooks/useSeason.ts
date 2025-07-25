/**
 * Hook simplifié pour la gestion des saisons (plan gratuit uniquement)
 */

import { useState } from 'react';

interface UseSeasonReturn {
  selectedSeason: number;
  setSelectedSeason: (season: number) => void;
  getSeasonLabel: (year: number) => string;
  loading: boolean;
}

export function useSeason(initialSeason: number = 2023): UseSeasonReturn {
  const [selectedSeason, setSelectedSeason] = useState<number>(initialSeason);

  const getSeasonLabel = (year: number): string => {
    return `${year}-${String(year + 1).slice(-2)}`;
  };

  const handleSetSelectedSeason = (season: number) => {
    // Vérifier que la saison est dans la plage autorisée (2021-2023)
    if (season >= 2021 && season <= 2023) {
      setSelectedSeason(season);
      
      // Sauvegarder la préférence
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
    getSeasonLabel,
    loading: false // Pas de chargement async
  };
}