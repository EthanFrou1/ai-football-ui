/**
 * Point d'entrée centralisé pour tous les services API
 * Import simple depuis n'importe où dans l'app
 */

// Services principaux
export { teamsService } from './teamsService';
export { matchesService } from './matchesService';
export { standingsService } from './standingsService';

// Types principaux
export type { MatchData } from './matchesService';
export type { TeamFromStandings } from './teamsService';

// Fonctions teams
export {
  fetchTeamsFromStandings,
  searchTeams,
  sortTeams,
  filterTeamsByQualification,
  getTeamsStats,
  clearTeamsCache,
  getTeamsCacheInfo
} from './teamsService';