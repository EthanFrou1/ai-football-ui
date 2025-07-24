/**
 * Types TypeScript pour l'API Football
 * Correspondent exactement aux modèles Python Pydantic
 */

// Types de base
export interface TeamBase {
  id: number;
  name: string;
  country: string;
  logo?: string;
}

export interface Team extends TeamBase {
  founded?: number;
  national: boolean;
  code?: string;
}

export interface TeamDetail extends Team {
  venue_id?: number;
  venue_name?: string;
  venue_address?: string;
  venue_city?: string;
  venue_capacity?: number;
  venue_surface?: string;
  venue_image?: string;
}

export interface Player {
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
}

export interface TeamWithPlayers extends TeamDetail {
  players: Player[];
}

// Types pour les matchs
export interface MatchScore {
  home?: number;
  away?: number;
}

export interface MatchGoal {
  time_elapsed: number;
  team_id: number;
  team_name: string;
  player_id: number;
  player_name: string;
  assist_id?: number;
  assist_name?: string;
  type: string;
}

export interface MatchStats {
  team_id: number;
  team_name: string;
  shots_on_goal?: number;
  shots_off_goal?: number;
  total_shots?: number;
  blocked_shots?: number;
  shots_inside_box?: number;
  shots_outside_box?: number;
  fouls?: number;
  corner_kicks?: number;
  offsides?: number;
  ball_possession?: string;
  yellow_cards?: number;
  red_cards?: number;
  goalkeeper_saves?: number;
  total_passes?: number;
  passes_accurate?: number;
  passes_percentage?: string;
}

export interface MatchPreview {
  id: number;
  date: string; // ISO string
  status: string;
  home_team: TeamBase;
  away_team: TeamBase;
  score: MatchScore;
}

export interface MatchDetail {
  id: number;
  referee?: string;
  timezone: string;
  date: string; // ISO string
  timestamp: number;
  status_long: string;
  status_short: string;
  status_elapsed?: number;
  league_id: number;
  league_name: string;
  league_country: string;
  league_logo?: string;
  league_flag?: string;
  season: number;
  round: string;
  home_team: TeamBase;
  away_team: TeamBase;
  score: MatchScore;
  venue_id?: number;
  venue_name?: string;
  venue_city?: string;
  goals: MatchGoal[];
  statistics: MatchStats[];
}

// Types pour les réponses API
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  type: string;
  message: string;
  details?: any;
}

// Types pour les paramètres de requête
export interface SearchTeamsParams {
  q: string;
  country?: string;
}

export interface GetMatchesByDateParams {
  match_date: string; // YYYY-MM-DD
}

export interface GetUpcomingMatchesParams {
  days?: number;
}

export interface GetRecentMatchesParams {
  days?: number;
}