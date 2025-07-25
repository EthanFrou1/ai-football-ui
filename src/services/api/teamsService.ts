// src/services/api/teamsService.ts
import { apiClient } from './client';

// Interfaces pour la réponse de l'API Football
interface FootballApiTeam {
  id: number;
  name: string;
  country: string;
  founded: number;
  national: boolean;
  logo: string;
  code?: string;
}

interface FootballApiVenue {
  id: number;
  name: string;
  address?: string;
  city: string;
  capacity?: number;
  surface?: string;
  image?: string;
}

interface FootballApiResponse {
  response: Array<{
    team: FootballApiTeam;
    venue: FootballApiVenue;
  }>;
  results: number;
}

export interface Team {
  id: number;
  name: string;
  logo: string;
  country: string;
  founded?: number;
  venue?: {
    id: number;
    name: string;
    address?: string;
    city: string;
    capacity?: number;
    surface?: string;
    image?: string;
  };
}

export interface TeamWithStandingData extends Team {
  // Données enrichies depuis le classement
  rank?: number;
  points?: number;
  form?: string;
  goalsDiff?: number;
  played?: number;
  win?: number;
  draw?: number;
  lose?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  qualification?: string;
}

export interface TeamsResponse {
  teams: TeamWithStandingData[];
  total: number;
  league?: {
    id: number;
    name: string;
    country: string;
    logo: string;
    season: number;
  };
}

// Fonction pour transformer la réponse API Football en format attendu
const transformApiResponse = (apiResponse: any): TeamsResponse => {
  // Vérification de la structure de la réponse
  if (!apiResponse) {
    return { teams: [], total: 0 };
  }

  // Si la réponse a déjà le bon format (teams array directement)
  if (Array.isArray(apiResponse.teams)) {
    return {
      teams: apiResponse.teams,
      total: apiResponse.total || apiResponse.teams.length
    };
  }

  // Si la réponse est au format API Football standard
  if (apiResponse.response && Array.isArray(apiResponse.response)) {
    const teams: TeamWithStandingData[] = apiResponse.response.map((item: any) => ({
      id: item.team.id,
      name: item.team.name,
      logo: item.team.logo,
      country: item.team.country,
      founded: item.team.founded,
      venue: item.venue ? {
        id: item.venue.id,
        name: item.venue.name,
        address: item.venue.address,
        city: item.venue.city,
        capacity: item.venue.capacity,
        surface: item.venue.surface,
        image: item.venue.image
      } : undefined
    }));

    return {
      teams,
      total: apiResponse.results || teams.length
    };
  }

  // Si la réponse est un array direct
  if (Array.isArray(apiResponse)) {
    const teams: TeamWithStandingData[] = apiResponse.map((item: any) => ({
      id: item.id || item.team?.id,
      name: item.name || item.team?.name,
      logo: item.logo || item.team?.logo,
      country: item.country || item.team?.country,
      founded: item.founded || item.team?.founded,
      venue: item.venue
    }));

    return {
      teams,
      total: teams.length
    };
  }

  return { teams: [], total: 0 };
};

// Filtres et options de tri
export type SortOption = 
  | 'name-asc' 
  | 'name-desc' 
  | 'rank-asc' 
  | 'rank-desc' 
  | 'points-asc' 
  | 'points-desc'
  | 'founded-asc'
  | 'founded-desc';

export interface TeamsFilters {
  search?: string;
  sort?: SortOption;
  limit?: number;
  offset?: number;
}

// Cache en mémoire pour éviter les appels API répétés
interface CacheEntry {
  data: TeamWithStandingData[];
  timestamp: number;
  leagueId: number;
  season: number;
}

class TeamsService {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  /**
   * Génère une clé de cache unique
   */
  private getCacheKey(leagueId: number, season: number): string {
    return `teams_${leagueId}_${season}`;
  }

  /**
   * Vérifie si les données en cache sont encore valides
   */
  private isCacheValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < this.CACHE_DURATION;
  }

  /**
   * Récupère les données depuis l'API (appel unique par ligue/saison)
   */
  private async fetchTeamsFromApi(leagueId: number, season: number): Promise<TeamWithStandingData[]> {
    const params = new URLSearchParams();
    params.append('league', leagueId.toString());
    params.append('season', season.toString());

    const url = `/teams?${params.toString()}`;
    const apiResponse = await apiClient.get(url);
    
    // Transformation des données
    const transformedResponse = transformApiResponse(apiResponse);
    return transformedResponse.teams;
  }

  /**
   * Récupère toutes les équipes avec cache intelligent
   */
  async getTeams(leagueId: number, season: number, filters?: TeamsFilters): Promise<TeamsResponse> {
    const cacheKey = this.getCacheKey(leagueId, season);
    let teams: TeamWithStandingData[];

    // Vérifier le cache
    const cachedEntry = this.cache.get(cacheKey);
    if (cachedEntry && this.isCacheValid(cachedEntry)) {
      console.log('✅ Using cached data for teams');
      teams = cachedEntry.data;
    } else {
      console.log('🔄 Fetching fresh data from API');
      try {
        teams = await this.fetchTeamsFromApi(leagueId, season);
        
        // Mettre en cache
        this.cache.set(cacheKey, {
          data: teams,
          timestamp: Date.now(),
          leagueId,
          season
        });
      } catch (error) {
        console.error('❌ Error fetching teams:', error);
        throw error;
      }
    }

    // Appliquer les filtres côté client
    let filteredTeams = [...teams];

    // 1. Filtrage par recherche
    if (filters?.search && filters.search.trim()) {
      filteredTeams = filterTeamsBySearch(filteredTeams, filters.search);
    }

    // 2. Tri
    if (filters?.sort) {
      filteredTeams = sortTeams(filteredTeams, filters.sort);
    }

    // 3. Pagination côté client si nécessaire
    if (filters?.limit && filters.limit > 0) {
      const offset = filters.offset || 0;
      filteredTeams = filteredTeams.slice(offset, offset + filters.limit);
    }

    return {
      teams: filteredTeams,
      total: teams.length // Total original, pas filtré
    };
  }

  /**
   * Récupère les détails d'une équipe spécifique
   */
  async getTeamDetails(teamId: number, season?: number): Promise<Team> {
    const params = new URLSearchParams();
    params.append('id', teamId.toString());
    if (season) params.append('season', season.toString());
    
    const url = `/teams?${params.toString()}`;
    
    return apiClient.get(url);
  }

  /**
   * Recherche d'équipes en temps réel (utilise le cache)
   */
  async searchTeams(leagueId: number, query: string, season: number): Promise<TeamWithStandingData[]> {
    if (!query.trim()) return [];
    
    const response = await this.getTeams(leagueId, season, {
      search: query
    });
    
    return response.teams;
  }

  /**
   * Récupère les équipes populaires/favorites (utilise le cache)
   */
  async getPopularTeams(leagueId: number, season: number): Promise<TeamWithStandingData[]> {
    const response = await this.getTeams(leagueId, season, {
      sort: 'rank-asc'
    });
    
    return response.teams;
  }

  /**
   * Vide le cache (utile pour forcer un refresh)
   */
  clearCache(leagueId?: number, season?: number): void {
    if (leagueId && season) {
      const cacheKey = this.getCacheKey(leagueId, season);
      this.cache.delete(cacheKey);
      console.log(`🗑️ Cache cleared for league ${leagueId} season ${season}`);
    } else {
      this.cache.clear();
      console.log('🗑️ All cache cleared');
    }
  }

  /**
   * Informations sur le cache (pour debug)
   */
  getCacheInfo(): { entries: number; keys: string[] } {
    return {
      entries: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Instance singleton
export const teamsService = new TeamsService();

// Utilitaires pour le tri et filtrage côté client (backup)
export const sortTeams = (teams: TeamWithStandingData[], sortOption: SortOption): TeamWithStandingData[] => {
  const sortedTeams = [...teams];
  
  switch (sortOption) {
    case 'name-asc':
      return sortedTeams.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sortedTeams.sort((a, b) => b.name.localeCompare(a.name));
    case 'rank-asc':
      return sortedTeams.sort((a, b) => (a.rank || 999) - (b.rank || 999));
    case 'rank-desc':
      return sortedTeams.sort((a, b) => (b.rank || 0) - (a.rank || 0));
    case 'points-asc':
      return sortedTeams.sort((a, b) => (a.points || 0) - (b.points || 0));
    case 'points-desc':
      return sortedTeams.sort((a, b) => (b.points || 0) - (a.points || 0));
    case 'founded-asc':
      return sortedTeams.sort((a, b) => (a.founded || 0) - (b.founded || 0));
    case 'founded-desc':
      return sortedTeams.sort((a, b) => (b.founded || 0) - (a.founded || 0));
    default:
      return sortedTeams;
  }
};

// Fonction pour filtrer les équipes par recherche
export const filterTeamsBySearch = (teams: TeamWithStandingData[], search: string): TeamWithStandingData[] => {
  if (!search.trim()) return teams;
  
  const searchLower = search.toLowerCase();
  return teams.filter(team => 
    team.name.toLowerCase().includes(searchLower) ||
    team.country.toLowerCase().includes(searchLower)
  );
};