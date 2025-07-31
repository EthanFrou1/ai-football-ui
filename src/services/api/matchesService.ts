// src/services/api/matchesService.ts - CORRECTION DES EXPORTS

import { API_CONFIG } from './config';

// ============= TYPES EXPORTS =============
// Types pour les matchs - BIEN EXPORTÉS
export interface MatchData {
  id: number;
  status: 'live' | 'scheduled' | 'finished' | 'postponed' | 'cancelled';
  timestamp: number;
  date: string; // Ajout pour compatibilité avec l'ancien code
  homeTeam: {
    id: number;
    name: string;
    logo: string;
  };
  awayTeam: {
    id: number;
    name: string;
    logo: string;
  };
  score: {
    home: number | null;
    away: number | null;
  };
  venue: {
    name: string;
    city: string;
  };
  league: {
    id: number;
    name: string;
    round: string;
  };
  elapsed?: number;
}

// Interface pour l'entrée de cache
export interface MatchesCacheEntry {
  recent: MatchData[];
  upcoming: MatchData[];
  all: MatchData[];
  timestamp: number;
  leagueId: number;
  season: number;
}

// ============= CACHE SYSTEM =============
const matchesCache = new Map<string, MatchesCacheEntry>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

function getCacheKey(leagueId: number, season: number): string {
  return `matches_${leagueId}_${season}`;
}

function isCacheValid(entry: MatchesCacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_DURATION;
}

// ============= DATA TRANSFORMATION =============
function transformApiResponse(apiMatches: any[]): MatchData[] {
  return apiMatches.map(match => ({
    id: match.fixture.id,
    status: mapApiStatus(match.fixture.status.short),
    timestamp: match.fixture.timestamp,
    date: new Date(match.fixture.timestamp * 1000).toISOString(), // Pour compatibilité
    homeTeam: {
      id: match.teams.home.id,
      name: match.teams.home.name,
      logo: match.teams.home.logo,
    },
    awayTeam: {
      id: match.teams.away.id,
      name: match.teams.away.name,
      logo: match.teams.away.logo,
    },
    score: {
      home: match.goals.home,
      away: match.goals.away,
    },
    venue: {
      name: match.fixture.venue?.name || 'Stade non défini',
      city: match.fixture.venue?.city || 'Ville non définie',
    },
    league: {
      id: match.league.id,
      name: match.league.name,
      round: match.league.round,
    },
    elapsed: match.fixture.status.elapsed,
  }));
}

function mapApiStatus(apiStatus: string): MatchData['status'] {
  const statusMap: Record<string, MatchData['status']> = {
    'NS': 'scheduled', // Not Started
    'LIVE': 'live',
    '1H': 'live',      // First Half
    'HT': 'live',      // Half Time
    '2H': 'live',      // Second Half
    'ET': 'live',      // Extra Time
    'P': 'live',       // Penalty
    'FT': 'finished',  // Full Time
    'AET': 'finished', // After Extra Time
    'PEN': 'finished', // Penalty
    'PST': 'postponed',
    'CANC': 'cancelled',
    'ABD': 'cancelled', // Abandoned
    'AWD': 'finished',  // Technical Loss
    'WO': 'finished',   // WalkOver
  };
  
  return statusMap[apiStatus] || 'scheduled';
}

function categorizeMatches(matches: MatchData[]): { recent: MatchData[], upcoming: MatchData[] } {
  const now = Date.now() / 1000;
  const recent: MatchData[] = [];
  const upcoming: MatchData[] = [];

  matches.forEach(match => {
    if (match.timestamp < now && match.status === 'finished') {
      recent.push(match);
    } else if (match.timestamp >= now || ['scheduled', 'live'].includes(match.status)) {
      upcoming.push(match);
    }
  });

  recent.sort((a, b) => b.timestamp - a.timestamp);
  upcoming.sort((a, b) => a.timestamp - b.timestamp);

  return { recent, upcoming };
}

// ============= API FUNCTIONS =============

export async function fetchMatches(leagueId: number, season: number): Promise<MatchesCacheEntry> {
  const cacheKey = getCacheKey(leagueId, season);
  const cachedEntry = matchesCache.get(cacheKey);

  if (cachedEntry && isCacheValid(cachedEntry)) {
    console.log(`✅ Cache HIT pour les matchs: ${cacheKey}`);
    return cachedEntry;
  }

  console.log(`🔄 Cache MISS pour les matchs: ${cacheKey} - Appel API`);

  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/matches/recent?league=${leagueId}&season=${season}&limit=50`
    );
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.response || !Array.isArray(data.response)) {
      throw new Error('Format de réponse API inattendu pour les matchs');
    }

    const allMatches = transformApiResponse(data.response);
    const { recent, upcoming } = categorizeMatches(allMatches);

    const cacheEntry: MatchesCacheEntry = {
      recent: recent.slice(0, 10),
      upcoming: upcoming.slice(0, 10),
      all: allMatches,
      timestamp: Date.now(),
      leagueId,
      season,
    };

    matchesCache.set(cacheKey, cacheEntry);
    
    console.log(`✅ Matchs mis en cache: ${allMatches.length} matchs (${recent.length} récents, ${upcoming.length} à venir)`);
    
    return cacheEntry;

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des matchs:', error);
    throw error;
  }
}

export async function fetchRecentMatches(leagueId: number, season: number): Promise<MatchData[]> {
  try {
    // Vérifier les types des paramètres
    if (typeof leagueId !== 'number' || typeof season !== 'number') {
      throw new Error(`Paramètres invalides: leagueId=${typeof leagueId}, season=${typeof season}`);
    }
    
    const url = `${API_CONFIG.BASE_URL}/matches/recent?league=${leagueId}&season=${season}&limit=10`;
    console.log(`📅 Appel API récents: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erreur API récents: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.response) {
      return [];
    }
    
    const recentMatches = transformApiResponse(data.response);
    console.log(`✅ ${recentMatches.length} matchs récents récupérés`);
    
    return recentMatches;
    
  } catch (error) {
    console.error('❌ Erreur matchs récents:', error);
    return [];
  }
}

export async function fetchUpcomingMatches(leagueId: number, season: number): Promise<MatchData[]> {
  try {
    // Vérifier les types des paramètres
    if (typeof leagueId !== 'number' || typeof season !== 'number') {
      throw new Error(`Paramètres invalides: leagueId=${typeof leagueId}, season=${typeof season}`);
    }
    
    const url = `${API_CONFIG.BASE_URL}/matches/upcoming?league=${leagueId}&season=${season}&limit=10`;
    console.log(`⏰ Appel API à venir: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erreur API à venir: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.response) {
      return [];
    }
    
    const upcomingMatches = transformApiResponse(data.response);
    console.log(`✅ ${upcomingMatches.length} matchs à venir récupérés`);
    
    return upcomingMatches;
    
  } catch (error) {
    console.error('❌ Erreur matchs à venir:', error);
    return [];
  }
}

export async function fetchLiveMatches(leagueId?: number): Promise<MatchData[]> {
  try {
    // Construire l'URL correctement
    let url = `${API_CONFIG.BASE_URL}/matches/live`;
    
    // Ajouter le paramètre de ligue si spécifié
    if (leagueId && typeof leagueId === 'number') {
      url += `?league=${leagueId}`;
    }
    
    console.log(`🔴 Appel API live: ${url}`);
      
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erreur API live: ${response.status}`);
    }

    const data = await response.json();
    
    // Vérifier la structure de la réponse
    if (!data.response || !Array.isArray(data.response)) {
      console.warn('⚠️ Réponse API live vide ou incorrecte');
      return [];
    }
    
    // Transformer les données
    const liveMatches = transformApiResponse(data.response);
    
    console.log(`✅ ${liveMatches.length} matchs live récupérés`);
    
    return liveMatches;
    
  } catch (error) {
    console.error('❌ Erreur matchs live:', error);
    
    // Retourner un tableau vide au lieu de planter
    return [];
  }
}

function debugApiCall(endpoint: string, params: any) {
  console.log('🔍 Debug API Call:', {
    endpoint,
    params,
    paramsTypes: Object.entries(params).map(([key, value]) => [key, typeof value])
  });
}

export async function fetchAllMatches(leagueId: number, season: number): Promise<MatchData[]> {
  const matches = await fetchMatches(leagueId, season);
  return matches.all;
}

export async function fetchMatchById(matchId: number): Promise<MatchData | null> {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/matches/${matchId}`);
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Erreur API match: ${response.status}`);
    }

    const data = await response.json();
    const matches = transformApiResponse(data.response || []);
    return matches[0] || null;
  } catch (error) {
    console.error(`❌ Erreur match ${matchId}:`, error);
    return null;
  }
}

// ============= UTILITY FUNCTIONS =============

export function filterMatchesByTeam(matches: MatchData[], teamId: number): MatchData[] {
  return matches.filter(match => 
    match.homeTeam.id === teamId || match.awayTeam.id === teamId
  );
}

export function filterMatchesByDateRange(
  matches: MatchData[], 
  startDate: Date, 
  endDate: Date
): MatchData[] {
  const start = startDate.getTime() / 1000;
  const end = endDate.getTime() / 1000;
  
  return matches.filter(match => 
    match.timestamp >= start && match.timestamp <= end
  );
}

export function filterMatchesByStatus(matches: MatchData[], status: MatchData['status']): MatchData[] {
  return matches.filter(match => match.status === status);
}

// ============= CACHE UTILITIES =============

export function clearMatchesCache(): void {
  matchesCache.clear();
  console.log('🗑️ Cache des matchs vidé');
}

export function getMatchesCacheInfo(): string {
  const entries = Array.from(matchesCache.entries()).map(([key, entry]) => {
    const age = Math.round((Date.now() - entry.timestamp) / 1000);
    const isValid = isCacheValid(entry);
    return `${key}: ${entry.all.length} matchs (${age}s, ${isValid ? 'valide' : 'expiré'})`;
  });
  
  return entries.length > 0 ? entries.join('\n') : 'Cache vide';
}

// ============= SERVICE CLASS =============

class MatchesService {
  fetchMatches = fetchMatches;
  fetchRecentMatches = fetchRecentMatches;
  fetchUpcomingMatches = fetchUpcomingMatches;
  fetchLiveMatches = fetchLiveMatches;
  fetchAllMatches = fetchAllMatches;
  fetchMatchById = fetchMatchById;
  
  clearCache = clearMatchesCache;
  getCacheInfo = getMatchesCacheInfo;
  filterByTeam = filterMatchesByTeam;
  filterByDate = filterMatchesByDateRange;
  filterByStatus = filterMatchesByStatus;
}

export const matchesService = new MatchesService();

// ============= DEFAULT EXPORT =============
export default matchesService;