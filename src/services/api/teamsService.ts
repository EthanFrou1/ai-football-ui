// src/services/api/teamsService.ts - CORRECTION POUR LES JOUEURS

import { API_CONFIG } from './config';

// Interface pour les équipes avec joueurs (mise à jour)
export interface TeamWithPlayers {
  id: number;
  name: string;
  logo: string;
  country: string;
  code?: string;
  founded?: number;
  national?: boolean; 
  position?: number;
  points?: number;
  matches_played?: number;
  venue_name?: string;
  venue_city?: string;
  venue_capacity?: number;
  venue_surface?: string;
  venue_address?: string;
  venue_image?: string;
  players?: Array<{
    id: number;
    name: string;
    age?: number;
    nationality?: string;
    height?: string;
    weight?: string;
    photo?: string;
    injured?: boolean;
    position?: string;
    appearances?: number;
    goals?: number;
    assists?: number;
    minutes?: number;
    rating?: number;
    yellow_cards?: number;
    red_cards?: number;
    minutes_per_game?: number;
    goals_per_game?: number;
    goal_contributions?: number;
  }>;
}

// NOUVELLE FONCTION : Récupérer équipe avec joueurs et statistiques
export async function getTeamWithPlayersAndStats(
  teamId: number,
  leagueId: number = 61, // Ligue 1 par défaut
  season: number = 2023
): Promise<TeamWithPlayers> {
  try {
    console.log(`📡 Appel API Team avec statistiques joueurs: teamId=${teamId}, league=${leagueId}`);
    
    // Appeler le nouvel endpoint du backend avec les paramètres corrects
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/teams/${teamId}/players?season=${season}&league=${leagueId}`
    );
    
    if (!response.ok) {
      throw new Error(`Erreur API Team: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log(`✅ Team avec joueurs récupérés:`, {
      teamName: data.name,
      playersCount: data.players?.length || 0
    });
    
    return data;

  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'équipe avec joueurs:', error);
    throw error;
  }
}

// CORRECTION : Fonction pour récupérer les détails d'une équipe avec joueurs (ANCIEN FORMAT MAIS CORRIGÉ)
export async function getTeamWithPlayers(teamId: number): Promise<TeamWithPlayers> {
  try {
    console.log(`📡 Appel API Team Details: teamId=${teamId}`);
    
    // Utiliser l'auto-détection de ligue que tu as déjà créée !
    return await getTeamWithAutoLeague(teamId);

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des détails équipe:', error);
    throw error;
  }
}

// NOUVELLE FONCTION : Récupérer statistiques détaillées des joueurs
export async function getDetailedPlayersStats(
  teamId: number,
  leagueId: number,
  season: number
): Promise<{ players: any[]; total: number; last_update: string }> {
  try {
    console.log(`👥 Récupération statistiques détaillées joueurs: teamId=${teamId}`);
    
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/teams/${teamId}/players/detailed?league=${leagueId}&season=${season}`
    );
    
    if (!response.ok) {
      throw new Error(`Erreur API Detailed Players: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log(`✅ ${data.players.length} joueurs avec statistiques détaillées récupérés`);
    
    return data;

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques détaillées:', error);
    throw error;
  }
}

// HOOK PERSONNALISÉ pour les équipes avec gestion des ligues
export function useTeamWithStats(teamId: number, leagueId?: number) {
  const [data, setData] = React.useState<TeamWithPlayers | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchData() {
      if (!teamId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const teamData = await getTeamWithPlayersAndStats(
          teamId, 
          leagueId || 61, // Déterminer la ligue selon le contexte
          2023
        );
        setData(teamData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [teamId, leagueId]);

  return { data, loading, error, refetch: () => fetchData() };
}

// UTILITAIRE : Déterminer la ligue selon l'équipe
export function getLeagueByTeamId(teamId: number): number {
  // Équipes de Ligue 1 (France)
  const ligue1Teams = [85, 79, 80, 84, 81, 77, 83, 82, 93, 94, 91]; // PSG, OM, OL, Nice, Monaco, Lille, etc.
  
  // Équipes de Premier League (Angleterre)  
  const premierLeagueTeams = [50, 47, 40, 42, 33, 34, 35, 36, 41, 45, 49, 51]; // Man City, Tottenham, Liverpool, Arsenal, etc.
  
  // Équipes de La Liga (Espagne)
  const laLigaTeams = [529, 530, 531, 532, 533, 548, 541, 542]; // Barcelona, Real Madrid, etc.
  
  if (ligue1Teams.includes(teamId)) return 61;
  if (premierLeagueTeams.includes(teamId)) return 39;
  if (laLigaTeams.includes(teamId)) return 140;
  
  // Par défaut, essayer Ligue 1
  return 61;
}

// FONCTION PRINCIPALE INTELLIGENTE : Auto-détection de la ligue
export async function getTeamWithAutoLeague(teamId: number): Promise<TeamWithPlayers> {
  const detectedLeague = getLeagueByTeamId(teamId);
  console.log(`🎯 Ligue détectée pour l'équipe ${teamId}: ${detectedLeague}`);
  
  return await getTeamWithPlayersAndStats(teamId, detectedLeague, 2023);
}

// AJOUTER cette fonction dans teamsService.ts
export async function getTeamTopPerformers(
  teamId: number,
  leagueId: number = 61,
  season: number = 2023
): Promise<any> {
  try {
    console.log(`🏆 Récupération top performers: teamId=${teamId}`);
    
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/teams/${teamId}/top-performers?league=${leagueId}&season=${season}`
    );
    
    if (!response.ok) {
      throw new Error(`Erreur API Top Performers: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Top performers récupérés:`, data.summary);
    
    return data;
  } catch (error) {
    console.error('❌ Erreur top performers:', error);
    throw error;
  }
}

// ============= ANCIENNES FONCTIONS (CONSERVATION) =============

export interface TeamFromStandings {
  id: number;
  name: string;
  logo: string;
  country: string;
  position: number;
  points: number;
  goalsDiff: number;
  form: string;
  status: string;
  description: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  home: {
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goals_for: number;
    goals_against: number;
  };
  away: {
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goals_for: number;
    goals_against: number;
  };
  last_update: string;
}

const teamsStandingsCache = new Map<string, any>();
const STANDINGS_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export async function fetchTeamsFromStandings(leagueId: number, season: number): Promise<TeamFromStandings[]> {
  const cacheKey = `teams_standings_${leagueId}_${season}`;
  const cachedEntry = teamsStandingsCache.get(cacheKey);

  if (cachedEntry && Date.now() - cachedEntry.timestamp < STANDINGS_CACHE_DURATION) {
    console.log(`✅ Cache HIT pour teams-standings: ${cacheKey}`);
    return cachedEntry.data.teams;
  }

  console.log(`🔄 Cache MISS pour teams-standings: ${cacheKey} - Appel API`);

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/teams?league=${leagueId}&season=${season}`);
    
    if (!response.ok) {
      throw new Error(`Erreur API Teams: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.teams || !Array.isArray(data.teams)) {
      throw new Error('Format de réponse API Teams inattendu');
    }

    const cacheEntry = {
      data,
      timestamp: Date.now(),
    };

    teamsStandingsCache.set(cacheKey, cacheEntry);
    
    console.log(`✅ Teams standings mis en cache: ${data.teams.length} équipes`);
    
    return data.teams;

  } catch (error) {
    console.error('Erreur lors de la récupération des équipes:', error);
    throw error;
  }
}

export function searchTeams(teams: TeamFromStandings[], query: string): TeamFromStandings[] {
  if (!query.trim()) return teams;
  
  const lowerQuery = query.toLowerCase();
  return teams.filter(team => 
    team.name.toLowerCase().includes(lowerQuery) ||
    team.country.toLowerCase().includes(lowerQuery)
  );
}

export function sortTeams(teams: TeamFromStandings[], sortBy: 'position' | 'name' | 'points'): TeamFromStandings[] {
  const sorted = [...teams];
  
  switch (sortBy) {
    case 'position':
      return sorted.sort((a, b) => a.position - b.position);
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'points':
      return sorted.sort((a, b) => b.points - a.points);
    default:
      return sorted;
  }
}

export function filterTeamsByQualification(teams: TeamFromStandings[], qualification: string): TeamFromStandings[] {
  if (qualification === 'all') return teams;
  
  return teams.filter(team => {
    const pos = team.position;
    
    switch (qualification) {
      case 'champions-league':
        return pos <= 3;
      case 'europa-league':
        return pos >= 4 && pos <= 6;
      case 'relegation':
        return pos >= teams.length - 2;
      default:
        return true;
    }
  });
}

export function getTeamsStats(teams: TeamFromStandings[]) {
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

// Service principal
class TeamsService {
  // Nouvelles méthodes principales
  getTeamWithPlayers = getTeamWithPlayers;
  getTeamWithStats = getTeamWithPlayersAndStats;
  getTeamWithAutoLeague = getTeamWithAutoLeague;
  getDetailedPlayersStats = getDetailedPlayersStats;
  
  // Méthodes existantes
  fetchFromStandings = fetchTeamsFromStandings;
  search = searchTeams;
  sort = sortTeams;
  filterByQualification = filterTeamsByQualification;
  getStats = getTeamsStats;
  
  // Utilitaires
  clearCache = () => teamsStandingsCache.clear();
  getCacheInfo = () => `${teamsStandingsCache.size} entrées en cache`;
}

export const teamsService = new TeamsService();