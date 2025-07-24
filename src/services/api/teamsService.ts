/**
 * Service pour les équipes avec support des ligues
 */

import { apiClient } from './client';
import { ENDPOINTS, API_ERRORS } from './config';
import type { 
  Team, 
  TeamDetail, 
  TeamWithPlayers, 
  SearchTeamsParams 
} from '../../types/api';

class TeamsService {
  /**
   * Rechercher des équipes par nom
   */
  async searchTeams(params: SearchTeamsParams): Promise<Team[]> {
    try {
      const teams = await apiClient.get<Team[]>(ENDPOINTS.TEAMS.SEARCH, params);
      return teams;
    } catch (error) {
      console.error('Erreur lors de la recherche d\'équipes:', error);
      throw error;
    }
  }

  /**
   * Récupérer les équipes d'une ligue spécifique
   */
  async getTeamsByLeague(leagueId: number, season: number = 2024): Promise<Team[]> {
    try {
      const teams = await apiClient.get<Team[]>('/teams', {
        league: leagueId,
        season: season
      });
      return teams;
    } catch (error) {
      console.error(`Erreur lors de la récupération des équipes de la ligue ${leagueId}:`, error);
      throw error;
    }
  }

  /**
   * Récupérer les équipes populaires (fallback si pas de ligue)
   */
  async getPopularTeams(): Promise<Team[]> {
    try {
      const teams = await apiClient.get<Team[]>(ENDPOINTS.TEAMS.GET_POPULAR);
      return teams;
    } catch (error) {
      console.error('Erreur lors de la récupération des équipes populaires:', error);
      throw error;
    }
  }

  /**
   * Récupérer les détails d'une équipe par ID
   */
  async getTeamById(teamId: number): Promise<TeamDetail> {
    try {
      const team = await apiClient.get<TeamDetail>(`${ENDPOINTS.TEAMS.GET_BY_ID}/${teamId}`);
      return team;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'équipe ${teamId}:`, error);
      throw error;
    }
  }

  /**
   * Récupérer une équipe avec ses joueurs
   */
  async getTeamWithPlayers(teamId: number, season: number = 2024): Promise<TeamWithPlayers> {
    try {
      const team = await apiClient.get<TeamWithPlayers>(
        `${ENDPOINTS.TEAMS.GET_WITH_PLAYERS}/${teamId}/players`,
        { season }
      );
      return team;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'équipe ${teamId} avec joueurs:`, error);
      throw error;
    }
  }

  /**
   * Vérifier si une équipe existe
   */
  async teamExists(teamId: number): Promise<boolean> {
    try {
      await this.getTeamById(teamId);
      return true;
    } catch (error: any) {
      if (error.type === API_ERRORS.NOT_FOUND) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Méthode intelligente pour récupérer les équipes
   * Utilise la ligue si fournie, sinon les équipes populaires
   */
  async getTeams(leagueId?: number, season: number = 2024): Promise<Team[]> {
    if (leagueId) {
      return this.getTeamsByLeague(leagueId, season);
    } else {
      return this.getPopularTeams();
    }
  }
}

// Instance singleton du service
export const teamsService = new TeamsService();