// src/services/api/teamsService.ts
import { API_CONFIG } from './config';

// Interface pour les équipes avec données du classement (enrichies)
export interface TeamFromStandings {
  id: number;
  name: string;
  logo: string;
  country: string;
  
  // Données du classement
  position: number;
  points: number;
  goalsDiff: number;
  form: string;
  status: string;
  description: string;
  
  // Statistiques complètes
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  
  // Statistiques domicile/extérieur
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

// Interface simplifiée pour les équipes (plus légère) - garde l'ancienne
export interface TeamBasic {
  id: number;
  name: string;
  logo: string;
  country: string;
  founded?: number;
  venue?: {
    name: string;
    city: string;
    capacity: number;
  };
}

// Réponse de l'API pour les équipes du championnat
export interface TeamsResponse {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
  };
  teams: TeamFromStandings[];
  total: number;
  last_update: string | null;
}

// Cache pour les équipes du championnat
interface TeamsStandingsCache {
  data: TeamsResponse;
  timestamp: number;
  leagueId: number;
  season: number;
}

// Cache pour les équipes basiques
interface TeamsCache {
  teams: TeamBasic[];
  timestamp: number;
  leagueId: number;
  season: number;
}

const teamsStandingsCache = new Map<string, TeamsStandingsCache>();
const teamsCache = new Map<string, TeamsCache>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

function getCacheKey(leagueId: number, season: number): string {
  return `teams_${leagueId}_${season}`;
}

function getStandingsCacheKey(leagueId: number, season: number): string {
  return `teams_standings_${leagueId}_${season}`;
}

function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION;
}

// NOUVELLE FONCTION: Récupérer les équipes avec données du classement
export async function fetchTeamsFromStandings(leagueId: number, season: number): Promise<TeamFromStandings[]> {
  const cacheKey = getStandingsCacheKey(leagueId, season);
  const cachedEntry = teamsStandingsCache.get(cacheKey);

  // Retourner le cache s'il est valide
  if (cachedEntry && isCacheValid(cachedEntry.timestamp)) {
    console.log(`✅ Cache HIT pour teams-standings: ${cacheKey}`);
    return cachedEntry.data.teams;
  }

  console.log(`🔄 Cache MISS pour teams-standings: ${cacheKey} - Appel API`);

  try {
    // Appel au nouvel endpoint
    const response = await fetch(`${API_CONFIG.BASE_URL}/teams?league=${leagueId}&season=${season}`);
    
    if (!response.ok) {
      throw new Error(`Erreur API Teams: ${response.status} ${response.statusText}`);
    }

    const data: TeamsResponse = await response.json();
    
    // Vérifier la structure de réponse
    if (!data.teams || !Array.isArray(data.teams)) {
      throw new Error('Format de réponse API Teams inattendu');
    }

    // Créer l'entrée de cache
    const cacheEntry: TeamsStandingsCache = {
      data,
      timestamp: Date.now(),
      leagueId,
      season,
    };

    // Sauvegarder dans le cache
    teamsStandingsCache.set(cacheKey, cacheEntry);
    
    console.log(`✅ Teams standings mis en cache: ${data.teams.length} équipes`);
    
    return data.teams;

  } catch (error) {
    console.error('Erreur lors de la récupération des équipes:', error);
    throw error;
  }
}

// Fonction de recherche pour les équipes avec classement
export function searchTeams(teams: TeamFromStandings[], query: string): TeamFromStandings[] {
  if (!query.trim()) return teams;
  
  const lowerQuery = query.toLowerCase();
  return teams.filter(team => 
    team.name.toLowerCase().includes(lowerQuery) ||
    team.country.toLowerCase().includes(lowerQuery)
  );
}

// Fonction de tri pour les équipes avec classement
export function sortTeams(teams: TeamFromStandings[], sortBy: 'position' | 'name' | 'points' | 'founded'): TeamFromStandings[] {
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

// Filtre par qualification (Champions League, Europa League, etc.)
export function filterTeamsByQualification(teams: TeamFromStandings[], qualification: string): TeamFromStandings[] {
  if (qualification === 'all') return teams;
  
  return teams.filter(team => {
    const pos = team.position;
    
    switch (qualification) {
      case 'champions-league':
        return pos <= 3; // Top 3 pour la Champions League
      case 'europa-league':
        return pos >= 4 && pos <= 6; // 4e-6e pour Europa League
      case 'relegation':
        return pos >= teams.length - 2; // 3 derniers pour la relégation
      default:
        return true;
    }
  });
}

// Statistiques des équipes
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

// Transformer les données de l'API Football /teams (ancien endpoint - garde pour compatibilité)
function transformTeamsApiResponse(apiTeams: any[]): TeamBasic[] {
  return apiTeams.map((item) => {
    const team = item.team;
    const venue = item.venue;
    
    return {
      id: team.id,
      name: team.name,
      logo: team.logo,
      country: team.country,
      founded: team.founded,
      venue: venue ? {
        name: venue.name,
        city: venue.city,
        capacity: venue.capacity,
      } : undefined,
    };
  });
}

// Fonction principale pour récupérer les équipes basiques (ancien endpoint - garde pour compatibilité)
export async function fetchTeamsBasic(leagueId: number, season: number): Promise<TeamBasic[]> {
  const cacheKey = getCacheKey(leagueId, season);
  const cachedEntry = teamsCache.get(cacheKey);

  // Retourner le cache s'il est valide
  if (cachedEntry && isCacheValid(cachedEntry.timestamp)) {
    console.log(`✅ Cache HIT pour teams-basic: ${cacheKey}`);
    return cachedEntry.teams;
  }

  console.log(`🔄 Cache MISS pour teams-basic: ${cacheKey} - Appel API Teams`);

  try {
    // Utiliser l'endpoint /teams/popular (plus approprié pour les équipes basiques)
    const response = await fetch(`${API_CONFIG.BASE_URL}/teams/popular`);
    
    if (!response.ok) {
      throw new Error(`Erreur API Teams: ${response.status} ${response.statusText}`);
    }

    const teams: TeamBasic[] = await response.json();
    
    // Créer l'entrée de cache
    const cacheEntry: TeamsCache = {
      teams,
      timestamp: Date.now(),
      leagueId,
      season,
    };

    // Sauvegarder dans le cache
    teamsCache.set(cacheKey, cacheEntry);
    
    console.log(`✅ Teams basiques mis en cache: ${teams.length} équipes`);
    
    return teams;

  } catch (error) {
    console.error('Erreur lors de la récupération des équipes basiques:', error);
    throw error;
  }
}

// Fonctions utilitaires simplifiées (ancien code - garde pour compatibilité)
export function searchTeamsBasic(teams: TeamBasic[], query: string): TeamBasic[] {
  if (!query.trim()) return teams;
  
  const lowerQuery = query.toLowerCase();
  return teams.filter(team => 
    team.name.toLowerCase().includes(lowerQuery) ||
    team.country.toLowerCase().includes(lowerQuery)
  );
}

export function sortTeamsBasic(teams: TeamBasic[], sortBy: string): TeamBasic[] {
  const sorted = [...teams];
  
  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'country':
      return sorted.sort((a, b) => a.country.localeCompare(b.country));
    case 'founded':
      return sorted.sort((a, b) => (a.founded || 0) - (b.founded || 0));
    default:
      return sorted;
  }
}

// Utilitaires de cache
export function clearTeamsCache(): void {
  teamsStandingsCache.clear();
  teamsCache.clear();
  console.log('🗑️ Cache des équipes vidé');
}

export function getTeamsCacheInfo(): string {
  const standingsEntries = Array.from(teamsStandingsCache.entries()).map(([key, entry]) => {
    const age = Math.round((Date.now() - entry.timestamp) / 1000);
    const isValid = isCacheValid(entry.timestamp);
    return `${key}: ${entry.data.teams.length} équipes (${age}s, ${isValid ? 'valide' : 'expiré'})`;
  });
  
  const basicEntries = Array.from(teamsCache.entries()).map(([key, entry]) => {
    const age = Math.round((Date.now() - entry.timestamp) / 1000);
    const isValid = isCacheValid(entry.timestamp);
    return `${key}: ${entry.teams.length} équipes (${age}s, ${isValid ? 'valide' : 'expiré'})`;
  });
  
  const allEntries = [...standingsEntries, ...basicEntries];
  return allEntries.length > 0 ? allEntries.join('\n') : 'Cache teams vide';
}

// Statistiques simplifiées (ancien code - garde pour compatibilité)
export function getTeamsBasicStats(teams: TeamBasic[]) {
  const countries = new Set(teams.map(t => t.country));
  const averageFounded = teams
    .filter(t => t.founded)
    .reduce((sum, t) => sum + (t.founded || 0), 0) / teams.filter(t => t.founded).length;

  return {
    total: teams.length,
    countries: countries.size,
    averageFounded: Math.round(averageFounded) || 0,
    oldestTeam: teams.reduce((oldest, team) => 
      (team.founded && oldest.founded && team.founded < oldest.founded) ? team : oldest, teams[0]),
    newestTeam: teams.reduce((newest, team) => 
      (team.founded && newest.founded && team.founded > newest.founded) ? team : newest, teams[0]),
  };
}

// Interface pour les détails d'équipe avec joueurs
export interface TeamWithPlayers {
  id: number;
  name: string;
  logo: string;
  country: string;
  code?: string;
  founded?: number;
  national?: boolean;
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
  }>;
}

// Fonction pour récupérer les détails d'une équipe avec joueurs
export async function getTeamWithPlayers(teamId: number): Promise<TeamWithPlayers> {
  try {
    console.log(`📡 Appel API Team Details: teamId=${teamId}`);
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/teams/${teamId}/players`);
    
    if (!response.ok) {
      throw new Error(`Erreur API Team: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log(`✅ Team details récupérés pour l'équipe ${teamId}`);
    
    return data;

  } catch (error) {
    console.error('Erreur lors de la récupération des détails équipe:', error);
    throw error;
  }
}

// Classe pour compatibilité
class TeamsService {
  // Nouvelles méthodes principales
  fetchFromStandings = fetchTeamsFromStandings;
  search = searchTeams;
  sort = sortTeams;
  filterByQualification = filterTeamsByQualification;
  getStats = getTeamsStats;
  
  // Anciennes méthodes (compatibilité)
  fetchBasic = fetchTeamsBasic;
  searchBasic = searchTeamsBasic;
  sortBasic = sortTeamsBasic;
  getBasicStats = getTeamsBasicStats;
  
  // Utilitaires
  clearCache = clearTeamsCache;
  getCacheInfo = getTeamsCacheInfo;

  getTeamWithPlayers = getTeamWithPlayers;
}

export const teamsService = new TeamsService();