/**
 * Service pour les classements
 */

import { apiClient } from './client';
import { ENDPOINTS } from './config';

// Types pour les classements (correspond au backend Python)
export interface StandingEntry {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  status: string;
  description: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  home: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  away: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  update: string;
}

export interface StandingsResponse {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
  };
  standings: StandingEntry[];
  last_update: string;
}

export interface StandingsSummary {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
  };
  summary: {
    total_teams: number;
    matches_played_average: number;
    goals_per_match: number;
    leader: StandingEntry | null;
    top_3: StandingEntry[];
    relegation_zone: StandingEntry[];
  };
  last_update: string;
}

class StandingsService {
  /**
   * Récupérer le classement complet d'une ligue
   */
  async getStandings(leagueId: number, season: number = 2024): Promise<StandingsResponse> {
    try {
      const response = await apiClient.get<StandingsResponse>(`/standings/${leagueId}`, { season });
      return response;
    } catch (error) {
      console.error(`Erreur lors de la récupération du classement de la ligue ${leagueId}:`, error);
      throw error;
    }
  }

  /**
   * Récupérer un résumé du classement
   */
  async getStandingsSummary(leagueId: number, season: number = 2024): Promise<StandingsSummary> {
    try {
      const response = await apiClient.get<StandingsSummary>(`/standings/${leagueId}/summary`, { season });
      return response;
    } catch (error) {
      console.error(`Erreur lors de la récupération du résumé du classement de la ligue ${leagueId}:`, error);
      throw error;
    }
  }

  /**
   * Analyser les journées manquantes
   */
  analyzeMatchesPlayed(standings: StandingEntry[]): {
    minMatches: number;
    maxMatches: number;
    averageMatches: number;
    teamsWithDelayedMatches: StandingEntry[];
  } {
    if (standings.length === 0) {
      return { minMatches: 0, maxMatches: 0, averageMatches: 0, teamsWithDelayedMatches: [] };
    }

    const matchesPlayed = standings.map(team => team.all.played);
    const minMatches = Math.min(...matchesPlayed);
    const maxMatches = Math.max(...matchesPlayed);
    const averageMatches = matchesPlayed.reduce((sum, matches) => sum + matches, 0) / standings.length;

    // Équipes avec des matchs en retard (moins que la moyenne)
    const teamsWithDelayedMatches = standings.filter(team => 
      team.all.played < Math.floor(averageMatches)
    );

    return {
      minMatches,
      maxMatches,
      averageMatches: Math.round(averageMatches * 10) / 10,
      teamsWithDelayedMatches
    };
  }
}

// Instance singleton du service
export const standingsService = new StandingsService();