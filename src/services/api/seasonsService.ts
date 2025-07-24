/**
 * Service pour la gestion des saisons
 * Système intelligent qui s'adapte selon le plan API (gratuit/payant)
 */

import { apiClient } from './client';

// Types pour les saisons
export interface Season {
  year: number;
  label: string;
  period: string;
  current: boolean;
  available: boolean;
}

export interface ApiPlan {
  type: 'free' | 'basic' | 'premium';
  available_seasons: {
    from: number;
    to: number;
  };
  current_requests: number;
  max_requests: number;
}

class SeasonsService {
  private cachedSeasons: Season[] | null = null;
  private apiPlan: ApiPlan | null = null;

  /**
   * Récupérer les informations du plan API
   */
  async getApiPlan(): Promise<ApiPlan> {
    if (this.apiPlan) return this.apiPlan;

    try {
      // Tenter d'appeler l'endpoint status de l'API (si disponible)
      const response = await apiClient.get('/status');
      this.apiPlan = response.plan;
      return this.apiPlan;
    } catch {
      // Si pas d'endpoint status, détecter automatiquement
      return this.detectApiPlan();
    }
  }

  /**
   * Détecter automatiquement le type de plan
   */
  private async detectApiPlan(): Promise<ApiPlan> {
    try {
      // Tester une saison récente pour voir si elle est disponible
      const currentYear = new Date().getFullYear();
      
      // Essayer la saison courante
      try {
        await apiClient.get(`/standings/61?season=${currentYear}`);
        // Si ça marche, on a probablement un plan payant
        this.apiPlan = {
          type: 'premium',
          available_seasons: { from: 2008, to: currentYear },
          current_requests: 0,
          max_requests: 10000
        };
      } catch (error: any) {
        if (error.message?.includes('Free plans do not have access')) {
          // Plan gratuit détecté
          this.apiPlan = {
            type: 'free',
            available_seasons: { from: 2021, to: 2023 },
            current_requests: 0,
            max_requests: 100
          };
        } else {
          // Plan basique par défaut
          this.apiPlan = {
            type: 'basic',
            available_seasons: { from: 2018, to: currentYear - 1 },
            current_requests: 0,
            max_requests: 1000
          };
        }
      }

      return this.apiPlan!;
    } catch {
      // Fallback: plan gratuit
      this.apiPlan = {
        type: 'free',
        available_seasons: { from: 2021, to: 2023 },
        current_requests: 0,
        max_requests: 100
      };
      return this.apiPlan;
    }
  }

  /**
   * Générer la liste des saisons disponibles
   */
  async getAvailableSeasons(): Promise<Season[]> {
    if (this.cachedSeasons) return this.cachedSeasons;

    const plan = await this.getApiPlan();
    const seasons: Season[] = [];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Janvier = 1
    const currentYear = currentDate.getFullYear();

    // Déterminer la saison courante
    // La saison football va d'août (mois 8) à mai (mois 5)
    const currentSeason = currentMonth >= 8 ? currentYear : currentYear - 1;

    // Générer les saisons disponibles
    for (let year = plan.available_seasons.to; year >= plan.available_seasons.from; year--) {
      const isCurrent = year === currentSeason;
      const isAvailable = year >= plan.available_seasons.from && year <= plan.available_seasons.to;

      seasons.push({
        year,
        label: `${year}-${year + 1}`,
        period: `${year}-${String(year + 1).slice(-2)}`, // 2023-24
        current: isCurrent,
        available: isAvailable
      });
    }

    this.cachedSeasons = seasons;
    return seasons;
  }

  /**
   * Obtenir la saison recommandée (la plus récente disponible)
   */
  async getRecommendedSeason(): Promise<Season> {
    const seasons = await this.getAvailableSeasons();
    
    // Prioriser la saison courante si disponible
    const currentSeason = seasons.find(s => s.current && s.available);
    if (currentSeason) return currentSeason;

    // Sinon, prendre la plus récente disponible
    return seasons.find(s => s.available) || seasons[0];
  }

  /**
   * Obtenir les saisons par plan
   */
  getSeasonsByPlan(planType: 'free' | 'basic' | 'premium'): { from: number; to: number } {
    const currentYear = new Date().getFullYear();
    
    switch (planType) {
      case 'free':
        return { from: 2021, to: 2023 };
      case 'basic':
        return { from: 2018, to: currentYear - 1 };
      case 'premium':
        return { from: 2008, to: currentYear };
      default:
        return { from: 2021, to: 2023 };
    }
  }

  /**
   * Vérifier si une saison est disponible
   */
  async isSeasonAvailable(year: number): Promise<boolean> {
    const seasons = await this.getAvailableSeasons();
    return seasons.some(s => s.year === year && s.available);
  }

  /**
   * Obtenir le label d'une saison
   */
  getSeasonLabel(year: number): string {
    return `${year}-${String(year + 1).slice(-2)}`;
  }

  /**
   * Convertir une année de saison en période complète
   */
  getSeasonPeriod(year: number): { start: Date; end: Date } {
    return {
      start: new Date(year, 7, 1), // 1er août
      end: new Date(year + 1, 4, 31) // 31 mai
    };
  }

  /**
   * Obtenir des informations contextuelles sur la saison
   */
  getSeasonContext(year: number): {
    isHistoric: boolean;
    isCurrent: boolean;
    isFuture: boolean;
    description: string;
  } {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const currentSeason = currentMonth >= 8 ? currentYear : currentYear - 1;

    const isHistoric = year < currentSeason - 1;
    const isCurrent = year === currentSeason;
    const isFuture = year > currentSeason;

    let description = '';
    if (isCurrent) {
      description = 'Saison en cours';
    } else if (year === currentSeason - 1) {
      description = 'Saison précédente';
    } else if (isHistoric) {
      description = `Il y a ${currentSeason - year} saison${currentSeason - year > 1 ? 's' : ''}`;
    } else if (isFuture) {
      description = 'Saison future';
    }

    return {
      isHistoric,
      isCurrent,
      isFuture,
      description
    };
  }

  /**
   * Nettoyer le cache (utile après un changement de plan)
   */
  clearCache(): void {
    this.cachedSeasons = null;
    this.apiPlan = null;
  }
}

// Instance singleton du service
export const seasonsService = new SeasonsService();