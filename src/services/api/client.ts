/**
 * Client API centralisé avec gestion d'erreurs
 * Toutes les requêtes HTTP passent par ce client
 */

import { API_CONFIG, API_ERRORS } from './config';
import type { ApiError } from '../../types/api';

class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  /**
   * Méthode générique pour faire des requêtes HTTP
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      // Créer un AbortController pour le timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Vérifier si la réponse est ok
      if (!response.ok) {
        throw await this.handleHttpError(response);
      }

      // Parser la réponse JSON
      const data = await response.json();
      return data;

    } catch (error) {
      throw this.handleRequestError(error);
    }
  }

  /**
   * Gérer les erreurs HTTP (4xx, 5xx)
   */
  private async handleHttpError(response: Response): Promise<ApiError> {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let errorType: string = API_ERRORS.SERVER_ERROR;

    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // Impossible de parser la réponse d'erreur
    }

    // Déterminer le type d'erreur
    if (response.status === 404) {
      errorType = API_ERRORS.NOT_FOUND;
    } else if (response.status >= 400 && response.status < 500) {
      errorType = API_ERRORS.VALIDATION_ERROR;
    }

    return {
      type: errorType,
      message: errorMessage,
      details: { status: response.status, statusText: response.statusText }
    };
  }

  /**
   * Gérer les erreurs de requête (réseau, timeout, etc.)
   */
  private handleRequestError(error: any): ApiError {
    if (error.name === 'AbortError') {
      return {
        type: API_ERRORS.TIMEOUT_ERROR,
        message: 'La requête a pris trop de temps à répondre',
        details: { timeout: this.timeout }
      };
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        type: API_ERRORS.NETWORK_ERROR,
        message: 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré.',
        details: { baseURL: this.baseURL }
      };
    }

    // Si c'est déjà une ApiError, la retourner telle quelle
    if (error.type && error.message) {
      return error;
    }

    // Erreur inconnue
    return {
      type: API_ERRORS.SERVER_ERROR,
      message: error.message || 'Une erreur inattendue s\'est produite',
      details: error
    };
  }

  /**
   * Méthodes publiques pour les différents types de requêtes
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      
      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
    }

    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Vérifier la santé de l'API
   */
  async healthCheck(): Promise<{ status: string; api_version: string }> {
    return this.get('/health');
  }
}

// Instance singleton du client API
export const apiClient = new ApiClient();