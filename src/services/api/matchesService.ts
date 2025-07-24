/**
 * Service pour les matchs
 * Encapsule toutes les opérations liées aux matchs
 */

import { apiClient } from './client';
import { ENDPOINTS } from './config';
import type { 
  MatchPreview, 
  MatchDetail, 
  GetMatchesByDateParams,
  GetUpcomingMatchesParams,
  GetRecentMatchesParams 
} from '../../types/api';

class MatchesService {
  /**
   * Récupérer les matchs d'aujourd'hui
   */
  async getTodayMatches(): Promise<MatchPreview[]> {
    try {
      const matches = await apiClient.get<MatchPreview[]>(ENDPOINTS.MATCHES.TODAY);
      return matches;
    } catch (error) {
      console.error('Erreur lors de la récupération des matchs d\'aujourd\'hui:', error);
      throw error;
    }
  }

  /**
   * Récupérer les matchs d'une date spécifique
   */
  async getMatchesByDate(params: GetMatchesByDateParams): Promise<MatchPreview[]> {
    try {
      const matches = await apiClient.get<MatchPreview[]>(ENDPOINTS.MATCHES.BY_DATE, params);
      return matches;
    } catch (error) {
      console.error(`Erreur lors de la récupération des matchs du ${params.match_date}:`, error);
      throw error;
    }
  }

  /**
   * Récupérer les matchs à venir
   */
  async getUpcomingMatches(params: GetUpcomingMatchesParams = {}): Promise<MatchPreview[]> {
    try {
      const matches = await apiClient.get<MatchPreview[]>(ENDPOINTS.MATCHES.UPCOMING, params);
      return matches;
    } catch (error) {
      console.error('Erreur lors de la récupération des matchs à venir:', error);
      throw error;
    }
  }

  /**
   * Récupérer les matchs récents
   */
  async getRecentMatches(params: GetRecentMatchesParams = {}): Promise<MatchPreview[]> {
    try {
      const matches = await apiClient.get<MatchPreview[]>(ENDPOINTS.MATCHES.RECENT, params);
      return matches;
    } catch (error) {
      console.error('Erreur lors de la récupération des matchs récents:', error);
      throw error;
    }
  }

  /**
   * Récupérer les détails complets d'un match
   */
  async getMatchById(matchId: number): Promise<MatchDetail> {
    try {
      const match = await apiClient.get<MatchDetail>(`${ENDPOINTS.MATCHES.GET_BY_ID}/${matchId}`);
      return match;
    } catch (error) {
      console.error(`Erreur lors de la récupération du match ${matchId}:`, error);
      throw error;
    }
  }

  /**
   * Récupérer les matchs par statut
   */
  async getMatchesByStatus(status: 'upcoming' | 'recent' | 'today'): Promise<MatchPreview[]> {
    switch (status) {
      case 'today':
        return this.getTodayMatches();
      case 'upcoming':
        return this.getUpcomingMatches();
      case 'recent':
        return this.getRecentMatches();
      default:
        throw new Error(`Statut de match invalide: ${status}`);
    }
  }

  /**
   * Formater une date pour l'API (YYYY-MM-DD)
   */
  formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Récupérer les matchs d'une semaine
   */
  async getWeekMatches(startDate: Date = new Date()): Promise<MatchPreview[]> {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7);

    const promises: Promise<MatchPreview[]>[] = [];
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      promises.push(
        this.getMatchesByDate({ match_date: this.formatDateForApi(d) })
      );
    }

    try {
      const results = await Promise.all(promises);
      return results.flat().sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    } catch (error) {
      console.error('Erreur lors de la récupération des matchs de la semaine:', error);
      throw error;
    }
  }
}

// Instance singleton du service
export const matchesService = new MatchesService();