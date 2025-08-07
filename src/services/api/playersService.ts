// src/services/api/playersService.ts

import { API_CONFIG } from './config';

// Interface pour les détails du joueur
export interface PlayerDetails {
  id: number;
  name: string;
  firstname?: string;
  lastname?: string;
  age?: number;
  birth_date?: string;
  birth_place?: string;
  birth_country?: string;
  nationality?: string;
  height?: string;
  weight?: string;
  injured: boolean;
  photo?: string;
  // Infos équipe actuelle
  current_team?: {
    id: number;
    name: string;
    logo: string;
  };
  // Statistiques saison
  performance?: {
    position?: string;
    appearances?: number;
    minutes?: number;
    rating?: string | number;
    goals?: number;
    assists?: number;
    yellow_cards?: number;
    red_cards?: number;
    captain?: boolean;
  };
  // Statistiques calculées
  calculated_stats?: {
    goals_per_match?: number;
    assists_per_match?: number;
    minutes_per_match?: number;
    goal_contribution?: number;
  };
}

/**
 * Récupérer les détails complets d'un joueur avec statistiques
 */
export async function getPlayerDetails(
  playerId: number,
  leagueId: number = 61,
  season: number = 2023
): Promise<PlayerDetails> {
  try {
    console.log(`👤 Récupération détails joueur: ${playerId}`);
    
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/players/${playerId}/details?league=${leagueId}&season=${season}`
    );
    
    if (!response.ok) {
      throw new Error(`Erreur API Player Details: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log(`✅ Détails joueur récupérés:`, data.name);
    
    return data;

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des détails du joueur:', error);
    throw error;
  }
}

/**
 * Récupérer l'historique des matchs d'un joueur
 */
export async function getPlayerMatches(
  playerId: number,
  leagueId: number = 61,
  season: number = 2023,
  limit: number = 10
): Promise<any[]> {
  try {
    console.log(`⚽ Récupération matchs joueur: ${playerId}`);
    
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/players/${playerId}/matches?league=${leagueId}&season=${season}&limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error(`Erreur API Player Matches: ${response.status}`);
    }

    const data = await response.json();
    return data.matches || [];

  } catch (error) {
    console.error('❌ Erreur matchs du joueur:', error);
    return [];
  }
}

/**
 * Récupérer les transferts d'un joueur
 */
export async function getPlayerTransfers(playerId: number): Promise<any[]> {
  try {
    console.log(`🔄 Récupération transferts joueur: ${playerId}`);
    
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/players/${playerId}/transfers`
    );
    
    if (!response.ok) {
      throw new Error(`Erreur API Player Transfers: ${response.status}`);
    }

    const data = await response.json();
    return data.transfers || [];

  } catch (error) {
    console.error('❌ Erreur transferts du joueur:', error);
    return [];
  }
}

/**
 * Rechercher des joueurs par nom
 */
export async function searchPlayers(
  searchTerm: string,
  leagueId?: number
): Promise<PlayerDetails[]> {
  try {
    console.log(`🔍 Recherche joueurs: ${searchTerm}`);
    
    let url = `${API_CONFIG.BASE_URL}/players/search?q=${encodeURIComponent(searchTerm)}`;
    if (leagueId) {
      url += `&league=${leagueId}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erreur API Search Players: ${response.status}`);
    }

    const data = await response.json();
    return data.players || [];

  } catch (error) {
    console.error('❌ Erreur recherche joueurs:', error);
    return [];
  }
}

/**
 * Comparer plusieurs joueurs
 */
export async function comparePlayers(
  playerIds: number[],
  leagueId: number = 61,
  season: number = 2023
): Promise<PlayerDetails[]> {
  try {
    console.log(`📊 Comparaison joueurs:`, playerIds);
    
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/players/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          player_ids: playerIds,
          league: leagueId,
          season: season
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`Erreur API Compare Players: ${response.status}`);
    }

    const data = await response.json();
    return data.players || [];

  } catch (error) {
    console.error('❌ Erreur comparaison joueurs:', error);
    return [];
  }
}

// Service principal
class PlayersService {
  // Méthodes principales
  getPlayerDetails = getPlayerDetails;
  getPlayerMatches = getPlayerMatches;
  getPlayerTransfers = getPlayerTransfers;
  searchPlayers = searchPlayers;
  comparePlayers = comparePlayers;
  
  // Utilitaires
  calculatePlayerStats = (player: PlayerDetails) => {
    const appearances = player.performance?.appearances || 0;
    const goals = player.performance?.goals || 0;
    const assists = player.performance?.assists || 0;
    const minutes = player.performance?.minutes || 0;
    
    if (appearances === 0) {
      return {
        goals_per_match: 0,
        assists_per_match: 0,
        minutes_per_match: 0,
        goal_contribution: goals + assists,
        efficiency: 0
      };
    }
    
    return {
      goals_per_match: Number((goals / appearances).toFixed(2)),
      assists_per_match: Number((assists / appearances).toFixed(2)),
      minutes_per_match: Math.round(minutes / appearances),
      goal_contribution: goals + assists,
      efficiency: Number(((goals / appearances) * 100).toFixed(1))
    };
  };
  
  getPlayerAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };
  
  formatPlayerPosition = (position: string) => {
    const positionMap: { [key: string]: string } = {
      'Goalkeeper': 'Gardien',
      'Defender': 'Défenseur', 
      'Midfielder': 'Milieu',
      'Attacker': 'Attaquant',
      'Forward': 'Attaquant'
    };
    
    return positionMap[position] || position;
  };
}

export const playersService = new PlayersService();