// src/services/api/matchesService.ts

// Types pour l'API Football (structure des réponses de l'API)
interface ApiMatch {
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    periods: {
      first: number | null;
      second: number | null;
    };
    venue: {
      id: number | null;
      name: string | null;
      city: string | null;
    };
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
    away: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
    extratime: {
      home: number | null;
      away: number | null;
    };
    penalty: {
      home: number | null;
      away: number | null;
    };
  };
}

// Type pour nos données enrichies (ce qu'on utilise dans l'app)
export interface MatchData {
  id: number;
  date: string;
  timestamp: number;
  status: 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';
  statusLong: string;
  elapsed: number | null;
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
    name: string | null;
    city: string | null;
  };
  league: {
    id: number;
    name: string;
    round: string;
  };
}

// Interface pour le cache
interface MatchesCacheEntry {
  recent: MatchData[];
  upcoming: MatchData[];
  all: MatchData[];
  timestamp: number;
  leagueId: number;
  season: number;
}

// Cache intelligent - mêmes principes que teamsService
const matchesCache = new Map<string, MatchesCacheEntry>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Fonction pour transformer les données de l'API Football vers notre format
function transformApiResponse(apiMatches: ApiMatch[]): MatchData[] {
  return apiMatches.map(match => {
    // Conversion du statut API vers notre statut simplifié
    let status: MatchData['status'] = 'scheduled';
    switch (match.fixture.status.short) {
      case 'NS':
      case 'TBD':
        status = 'scheduled';
        break;
      case '1H':
      case 'HT':
      case '2H':
      case 'ET':
      case 'BT':
        status = 'live';
        break;
      case 'FT':
      case 'AET':
      case 'PEN':
        status = 'finished';
        break;
      case 'PST':
        status = 'postponed';
        break;
      case 'CANC':
        status = 'cancelled';
        break;
      default:
        status = 'scheduled';
    }

    return {
      id: match.fixture.id,
      date: match.fixture.date,
      timestamp: match.fixture.timestamp,
      status,
      statusLong: match.fixture.status.long,
      elapsed: match.fixture.status.elapsed,
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
        name: match.fixture.venue.name,
        city: match.fixture.venue.city,
      },
      league: {
        id: match.league.id,
        name: match.league.name,
        round: match.league.round,
      },
    };
  });
}

// Clé de cache unique par ligue/saison
function getCacheKey(leagueId: number, season: number): string {
  return `matches_${leagueId}_${season}`;
}

// Vérifier si le cache est valide
function isCacheValid(entry: MatchesCacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_DURATION;
}

// Séparer les matchs en récents et à venir
function categorizeMatches(matches: MatchData[]): { recent: MatchData[], upcoming: MatchData[] } {
  const now = Date.now();
  const recent: MatchData[] = [];
  const upcoming: MatchData[] = [];

  matches.forEach(match => {
    if (match.timestamp * 1000 < now && match.status === 'finished') {
      recent.push(match);
    } else if (match.timestamp * 1000 >= now || match.status === 'scheduled') {
      upcoming.push(match);
    }
  });

  // Trier : récents du plus récent au plus ancien, à venir du plus proche au plus lointain
  recent.sort((a, b) => b.timestamp - a.timestamp);
  upcoming.sort((a, b) => a.timestamp - b.timestamp);

  return { recent, upcoming };
}

// Fonction principale pour récupérer tous les matchs
export async function fetchMatches(leagueId: number, season: number): Promise<MatchesCacheEntry> {
  const cacheKey = getCacheKey(leagueId, season);
  const cachedEntry = matchesCache.get(cacheKey);

  // Retourner le cache s'il est valide
  if (cachedEntry && isCacheValid(cachedEntry)) {
    console.log(`✅ Cache HIT pour les matchs: ${cacheKey}`);
    return cachedEntry;
  }

  console.log(`🔄 Cache MISS pour les matchs: ${cacheKey} - Appel API`);

  try {
    // Appel API backend
    const response = await fetch(`http://localhost:8000/api/matches?league=${leagueId}&season=${season}`);
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Vérifier la structure de la réponse API Football
    if (!data.response || !Array.isArray(data.response)) {
      throw new Error('Format de réponse API inattendu pour les matchs');
    }

    // Transformer les données
    const allMatches = transformApiResponse(data.response);
    
    // Catégoriser les matchs
    const { recent, upcoming } = categorizeMatches(allMatches);

    // Créer l'entrée de cache
    const cacheEntry: MatchesCacheEntry = {
      recent: recent.slice(0, 10), // Limiter à 10 matchs récents
      upcoming: upcoming.slice(0, 10), // Limiter à 10 matchs à venir
      all: allMatches,
      timestamp: Date.now(),
      leagueId,
      season,
    };

    // Sauvegarder dans le cache
    matchesCache.set(cacheKey, cacheEntry);
    
    console.log(`✅ Matchs mis en cache: ${allMatches.length} matchs (${recent.length} récents, ${upcoming.length} à venir)`);
    
    return cacheEntry;

  } catch (error) {
    console.error('Erreur lors de la récupération des matchs:', error);
    throw error;
  }
}

// Récupérer seulement les matchs récents
export async function fetchRecentMatches(leagueId: number, season: number): Promise<MatchData[]> {
  const matches = await fetchMatches(leagueId, season);
  return matches.recent;
}

// Récupérer seulement les matchs à venir
export async function fetchUpcomingMatches(leagueId: number, season: number): Promise<MatchData[]> {
  const matches = await fetchMatches(leagueId, season);
  return matches.upcoming;
}

// Récupérer tous les matchs
export async function fetchAllMatches(leagueId: number, season: number): Promise<MatchData[]> {
  const matches = await fetchMatches(leagueId, season);
  return matches.all;
}

// Utilitaires de cache (pour debug)
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

// Fonction helper pour filtrer les matchs par équipe
export function filterMatchesByTeam(matches: MatchData[], teamId: number): MatchData[] {
  return matches.filter(match => 
    match.homeTeam.id === teamId || match.awayTeam.id === teamId
  );
}

// Fonction helper pour filtrer les matchs par date
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

class MatchesService {
  fetchMatches = fetchMatches;
  fetchRecentMatches = fetchRecentMatches;
  fetchUpcomingMatches = fetchUpcomingMatches;
  fetchAllMatches = fetchAllMatches;
  clearCache = clearMatchesCache;
  getCacheInfo = getMatchesCacheInfo;
  filterByTeam = filterMatchesByTeam;
  filterByDate = filterMatchesByDateRange;
}

export const matchesService = new MatchesService();