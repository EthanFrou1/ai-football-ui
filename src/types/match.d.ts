// src/types/match.d.ts

// Types de base pour les matchs
export interface Match {
  id: number;
  date: string;
  timestamp: number;
  status: MatchStatus;
  statusLong: string;
  elapsed: number | null;
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  score: MatchScore;
  venue: MatchVenue;
  league: MatchLeague;
}

// Statuts de match simplifiés
export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';

// Informations d'équipe dans le contexte d'un match
export interface TeamInfo {
  id: number;
  name: string;
  logo: string;
}

// Score du match
export interface MatchScore {
  home: number | null;
  away: number | null;
}

// Lieu du match
export interface MatchVenue {
  name: string | null;
  city: string | null;
}

// Informations de la ligue dans le contexte d'un match
export interface MatchLeague {
  id: number;
  name: string;
  round: string;
}

// Interface étendue pour les détails complets d'un match
export interface MatchDetails extends Match {
  referee: string | null;
  periods: {
    first: number | null;
    second: number | null;
  };
  score: MatchDetailedScore;
  lineups?: MatchLineups;
  events?: MatchEvent[];
  statistics?: MatchStatistics[];
}

// Score détaillé avec mi-temps, prolongations, etc.
export interface MatchDetailedScore {
  home: number | null;
  away: number | null;
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
}

// Compositions d'équipe
export interface MatchLineups {
  home: TeamLineup;
  away: TeamLineup;
}

export interface TeamLineup {
  team: TeamInfo;
  formation: string;
  startXI: Player[];
  substitutes: Player[];
  coach: Coach;
}

export interface Player {
  id: number;
  name: string;
  number: number | null;
  pos: string;
  grid: string | null;
}

export interface Coach {
  id: number;
  name: string;
  photo: string | null;
}

// Événements du match
export interface MatchEvent {
  time: {
    elapsed: number;
    extra: number | null;
  };
  team: TeamInfo;
  player: {
    id: number;
    name: string;
  };
  assist?: {
    id: number;
    name: string;
  };
  type: EventType;
  detail: string;
  comments: string | null;
}

export type EventType = 'Goal' | 'Card' | 'subst' | 'Var';

// Statistiques du match
export interface MatchStatistics {
  team: TeamInfo;
  statistics: StatisticItem[];
}

export interface StatisticItem {
  type: string;
  value: string | number | null;
}

// Types pour les filtres et recherche
export interface MatchFilters {
  teamId?: number;
  startDate?: Date;
  endDate?: Date;
  status?: MatchStatus | 'all' | 'recent' | 'upcoming';
  venue?: string;
  round?: string;
}

// Types pour le tri
export type MatchSortOption = 'date' | 'date-desc' | 'team-home' | 'team-away' | 'status';

// Type pour la réponse de l'API avec pagination
export interface MatchesApiResponse {
  response: Match[];
  paging: {
    current: number;
    total: number;
  };
  results: number;
}

// Types pour les statistiques des matchs
export interface MatchStats {
  total: number;
  recent: number;
  upcoming: number;
  live: number;
  finished: number;
  scheduled: number;
  postponed: number;
  cancelled: number;
}

// Interface pour le cache des matchs
export interface MatchesCache {
  recent: Match[];
  upcoming: Match[];
  all: Match[];
  timestamp: number;
  leagueId: number;
  season: number;
}

// Utilitaires de type
export type MatchStatusAPI = 'NS' | 'TBD' | '1H' | 'HT' | '2H' | 'ET' | 'BT' | 'FT' | 'AET' | 'PEN' | 'PST' | 'CANC';

// Mapping des statuts API vers nos statuts simplifiés
export const API_STATUS_MAP: Record<MatchStatusAPI, MatchStatus> = {
  'NS': 'scheduled',      // Non commencé
  'TBD': 'scheduled',     // À déterminer
  '1H': 'live',           // 1ère mi-temps
  'HT': 'live',           // Mi-temps
  '2H': 'live',           // 2ème mi-temps
  'ET': 'live',           // Prolongations
  'BT': 'live',           // Pause prolongations
  'FT': 'finished',       // Temps plein
  'AET': 'finished',      // Après prolongations
  'PEN': 'finished',      // Après tirs au but
  'PST': 'postponed',     // Reporté
  'CANC': 'cancelled'     // Annulé
};

// Interface pour les props des composants
export interface MatchCardProps {
  match: Match;
  showLeagueInfo?: boolean;
  showVenue?: boolean;
  showDetailsButton?: boolean;
  variant?: 'compact' | 'full';
  onClick?: (match: Match) => void;
}

export interface MatchListProps {
  matches: Match[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  onMatchClick?: (match: Match) => void;
  showFilters?: boolean;
  showPagination?: boolean;
}