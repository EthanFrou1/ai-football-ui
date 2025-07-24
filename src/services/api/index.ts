/**
 * Point d'entrée centralisé pour tous les services API
 * Import simple depuis n'importe où dans l'app
 */

// Services
export { teamsService } from './teamsService';
export { matchesService } from './matchesService';
export { standingsService } from './standingsService';
export { apiClient } from './client';

// Configuration
export { API_CONFIG, ENDPOINTS, API_ERRORS } from './config';

// Types (re-export pour faciliter les imports)
export type {
  Team,
  TeamDetail,
  TeamWithPlayers,
  Player,
  MatchPreview,
  MatchDetail,
  MatchScore,
  MatchGoal,
  MatchStats,
  ApiError,
  SearchTeamsParams,
  GetMatchesByDateParams,
  GetUpcomingMatchesParams,
  GetRecentMatchesParams
} from '../../types/api';

// Types standings
export type {
  StandingEntry,
  StandingsResponse,
  StandingsSummary
} from './standingsService';