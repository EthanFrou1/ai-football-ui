/**
 * Configuration API centralisée
 * Permet de gérer facilement les URLs et paramètres de l'API
 */

// Configuration de base de l'API
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api',
  TIMEOUT: 10000, // 10 secondes
} as const;

// Endpoints disponibles
export const ENDPOINTS = {
  // Teams endpoints
TEAMS: {
    SEARCH: '/teams/search',
    GET_BY_ID: '/teams',
    GET_POPULAR: '/teams/popular',
    GET_WITH_PLAYERS: '/teams', // + /{id}/players
    GET_BY_LEAGUE: '/teams', // + ?league={id}&season={year} - NOUVEAU
  },
  
  // Matches endpoints
  MATCHES: {
    TODAY: '/matches/today',
    BY_DATE: '/matches/by-date',
    UPCOMING: '/matches/upcoming',
    RECENT: '/matches/recent',
    GET_BY_ID: '/matches',
  },
  
  // Health check
  HEALTH: '/health',
} as const;

// Types d'erreurs API
export const API_ERRORS = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;