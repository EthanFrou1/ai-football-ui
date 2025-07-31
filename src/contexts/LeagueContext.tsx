// src/contexts/LeagueContext.tsx - AVEC HOOK SÉCURISÉ
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

// Types
export interface League {
  id: number;
  name: string;
  country: string;
  countryCode: string;
  logo?: string;
  color: string;
  description: string;
}

interface LeagueContextType {
  currentLeague: League | null;
  selectedLeague: League | null; // Alias pour compatibilité
  setCurrentLeague: (league: League) => void;
  isLoading: boolean;
}

// Context
const LeagueContext = createContext<LeagueContextType | undefined>(undefined);

// Provider
interface LeagueProviderProps {
  children: React.ReactNode;
}

export const LeagueProvider: React.FC<LeagueProviderProps> = ({ children }) => {
  const [currentLeague, setCurrentLeague] = useState<League | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { leagueId } = useParams<{ leagueId: string }>();
  const location = useLocation();

  useEffect(() => {
    // Récupérer les infos de la ligue depuis le state de navigation
    const leagueInfo = location.state?.leagueInfo;
    
    if (leagueInfo) {
      setCurrentLeague(leagueInfo);
      setIsLoading(false);
    } else if (leagueId) {
      // Si pas d'info dans le state, récupérer depuis l'API ou localStorage
      loadLeagueInfo(parseInt(leagueId));
    } else {
      setIsLoading(false);
    }
  }, [leagueId, location.state]);

  const loadLeagueInfo = async (id: number) => {
    setIsLoading(true);
    
    // D'abord essayer le localStorage
    const cached = localStorage.getItem(`league_${id}`);
    if (cached) {
      setCurrentLeague(JSON.parse(cached));
      setIsLoading(false);
      return;
    }

    // Sinon, mapping des ligues populaires
    const leagueMap: { [key: number]: League } = {
      61: {
        id: 61,
        name: "Ligue 1",
        country: "France",
        countryCode: "🇫🇷",
        logo: "https://media.api-sports.io/football/leagues/61.png",
        color: "#003d82",
        description: "Championnat français"
      },
      39: {
        id: 39,
        name: "Premier League",
        country: "England",
        countryCode: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
        logo: "https://media.api-sports.io/football/leagues/39.png",
        color: "#3d1a78",
        description: "Championnat anglais"
      },
      140: {
        id: 140,
        name: "La Liga",
        country: "Spain",
        countryCode: "🇪🇸",
        logo: "https://media.api-sports.io/football/leagues/140.png",
        color: "#ff6b35",
        description: "Championnat espagnol"
      },
      135: {
        id: 135,
        name: "Serie A",
        country: "Italy",
        countryCode: "🇮🇹",
        logo: "https://media.api-sports.io/football/leagues/135.png",
        color: "#0066cc",
        description: "Championnat italien"
      },
      78: {
        id: 78,
        name: "Bundesliga",
        country: "Germany",
        countryCode: "🇩🇪",
        logo: "https://media.api-sports.io/football/leagues/78.png",
        color: "#d20515",
        description: "Championnat allemand"
      },
      2: {
        id: 2,
        name: "Champions League",
        country: "Europe",
        countryCode: "🏆",
        logo: "https://media.api-sports.io/football/leagues/2.png",
        color: "#00387b",
        description: "Compétition européenne"
      }
    };

    const league = leagueMap[id];
    if (league) {
      setCurrentLeague(league);
      // Sauvegarder en cache
      localStorage.setItem(`league_${id}`, JSON.stringify(league));
    }
    
    setIsLoading(false);
  };

  const handleSetCurrentLeague = (league: League) => {
    setCurrentLeague(league);
    // Sauvegarder en cache
    localStorage.setItem(`league_${league.id}`, JSON.stringify(league));
  };

  return (
    <LeagueContext.Provider 
      value={{ 
        currentLeague, 
        selectedLeague: currentLeague, // Alias pour compatibilité
        setCurrentLeague: handleSetCurrentLeague, 
        isLoading 
      }}
    >
      {children}
    </LeagueContext.Provider>
  );
};

// Hook standard (lancera une erreur si pas dans un provider)
export const useLeague = (): LeagueContextType => {
  const context = useContext(LeagueContext);
  if (!context) {
    throw new Error('useLeague must be used within a LeagueProvider');
  }
  return context;
};

// ============= HOOK SÉCURISÉ =============
// Hook sécurisé qui ne lance pas d'erreur si pas dans un provider
export const useSafeLeague = (): LeagueContextType => {
  const context = useContext(LeagueContext);
  
  // Si pas de context, retourner des valeurs par défaut
  if (!context) {
    return {
      currentLeague: null,
      selectedLeague: null,
      setCurrentLeague: () => {
        console.warn('setCurrentLeague appelé en dehors d\'un LeagueProvider');
      },
      isLoading: false
    };
  }
  
  return context;
};

// Hook pour vérifier si on est dans le contexte d'une ligue
export const useIsInLeague = (): boolean => {
  const context = useContext(LeagueContext);
  
  // Si pas de context, on n'est pas dans une ligue
  if (!context) {
    return false;
  }
  
  return context.currentLeague !== null;
};

// Hook pour obtenir l'ID de la ligue actuelle (null si pas dans une ligue)
export const useLeagueId = (): number | null => {
  const context = useContext(LeagueContext);
  return context?.currentLeague?.id || null;
};