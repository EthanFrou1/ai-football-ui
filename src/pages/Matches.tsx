// src/pages/Matches.tsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Alert,
  IconButton,
  Paper,
  Typography,
  Skeleton,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  Grid,
  Collapse
} from '@mui/material';
import { 
  FiberManualRecord as FiberManualRecordIcon,
  Refresh as RefreshIcon,
  Sports as SportsIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  fetchRecentMatches, 
  fetchUpcomingMatches,
  type MatchData 
} from '../services/api/matchesService';

type TabValue = 'live' | 'upcoming' | 'recent';

// Hook sécurisé pour utiliser le LeagueContext
function useSafeLeague() {
  try {
    const { useLeague } = require('../contexts/LeagueContext');
    return useLeague();
  } catch {
    return {
      currentLeague: null,
      isLoading: false
    };
  }
}

// Interface pour les matchs live (simulés en attendant l'API)
interface LiveMatch extends MatchData {
  elapsed?: number;
}

// Données simulées pour les matchs live
const mockLiveMatches: LiveMatch[] = [
  {
    id: 999,
    date: '2025-07-29T20:45:00+00:00',
    timestamp: Date.now() / 1000,
    status: 'live' as const,
    statusLong: 'En cours - 2ème mi-temps',
    elapsed: 78,
    homeTeam: { id: 85, name: 'Paris Saint Germain', logo: 'https://media.api-sports.io/football/teams/85.png' },
    awayTeam: { id: 80, name: 'Olympique Marseille', logo: 'https://media.api-sports.io/football/teams/80.png' },
    score: { home: 2, away: 1 },
    venue: { name: 'Parc des Princes', city: 'Paris' },
    league: { id: 61, name: 'Ligue 1', round: 'Journée 15' }
  },
  {
    id: 998,
    date: '2025-07-29T18:00:00+00:00',
    timestamp: Date.now() / 1000,
    status: 'live' as const,
    statusLong: 'En cours - 1ère mi-temps',
    elapsed: 33,
    homeTeam: { id: 541, name: 'Real Madrid', logo: 'https://media.api-sports.io/football/teams/541.png' },
    awayTeam: { id: 529, name: 'Barcelona', logo: 'https://media.api-sports.io/football/teams/529.png' },
    score: { home: 0, away: 1 },
    venue: { name: 'Santiago Bernabéu', city: 'Madrid' },
    league: { id: 140, name: 'La Liga', round: 'El Clasico' }
  }
];

// Composant MatchCard amélioré avec grid layout
const EnhancedMatchCard: React.FC<{ match: MatchData; onClick: () => void }> = ({ match, onClick }) => {
  const getStatusColor = (status: MatchData['status']) => {
    switch (status) {
      case 'live': return '#ef4444';
      case 'finished': return '#22c55e';
      case 'scheduled': return '#3b82f6';
      case 'postponed': return '#f59e0b';
      case 'cancelled': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: MatchData['status'], elapsed?: number) => {
    switch (status) {
      case 'live': return `🔴 ${elapsed || 0}'`;
      case 'finished': return 'FT';
      case 'scheduled': return new Date(match.date).toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      case 'postponed': return 'REPORTÉ';
      case 'cancelled': return 'ANNULÉ';
      default: return status.toUpperCase();
    }
  };

  const getScoreDisplay = () => {
    if (match.score.home !== null && match.score.away !== null) {
      return `${match.score.home}-${match.score.away}`;
    }
    return 'vs';
  };

  return (
    <Card 
      sx={{ 
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-1px)',
          backgroundColor: 'rgba(59, 130, 246, 0.02)'
        },
        mb: 1,
        borderLeft: match.status === 'live' ? `4px solid ${getStatusColor(match.status)}` : 'none'
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 100px 1fr 120px',
          gap: 2,
          alignItems: 'center'
        }}>
          {/* Équipe domicile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar src={match.homeTeam.logo} sx={{ width: 28, height: 28 }} />
            <Typography variant="body1" sx={{ 
              fontWeight: 600,
              fontSize: '0.95rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {match.homeTeam.name}
            </Typography>
          </Box>

          {/* Score */}
          <Box sx={{ textAlign: 'center' }}>
            <Chip
              label={getScoreDisplay()}
              variant={match.status === 'live' ? 'filled' : 'outlined'}
              color={match.status === 'live' ? 'error' : 'default'}
              sx={{ 
                fontWeight: 'bold',
                fontSize: '0.85rem',
                minWidth: '60px'
              }}
            />
          </Box>

          {/* Équipe extérieur */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
            <Typography variant="body1" sx={{ 
              fontWeight: 600,
              fontSize: '0.95rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textAlign: 'right'
            }}>
              {match.awayTeam.name}
            </Typography>
            <Avatar src={match.awayTeam.logo} sx={{ width: 28, height: 28 }} />
          </Box>

          {/* Status/Temps */}
          <Box sx={{ textAlign: 'center' }}>
            <Chip
              label={getStatusText(match.status, (match as LiveMatch).elapsed)}
              size="small"
              sx={{
                backgroundColor: getStatusColor(match.status),
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.75rem'
              }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default function Matches() {
  const { currentLeague, isLoading: leagueLoading } = useSafeLeague();
  const { leagueId } = useParams<{ leagueId: string }>();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<TabValue>('live');
  const [matches, setMatches] = useState<{ [key in TabValue]: MatchData[] }>({
    live: [],
    upcoming: [],
    recent: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // État pour gérer l'expand/collapse des sections de championnats
  const [expandedLeagues, setExpandedLeagues] = useState<{ [leagueId: number]: boolean }>({});

  // Fonction pour toggle l'état d'une section
  const toggleLeagueExpanded = (leagueId: number) => {
    setExpandedLeagues(prev => ({
      ...prev,
      [leagueId]: !prev[leagueId]
    }));
  };

  // Déterminer la ligue à utiliser
  const targetLeague = currentLeague || (leagueId ? { id: parseInt(leagueId), name: `Ligue ${leagueId}` } : null);

  // Fonction pour charger les données selon l'onglet
  const fetchMatches = async (tab: TabValue, showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      let data: MatchData[] = [];

      switch (tab) {
        case 'live':
          // Pour le live, on utilise les données mockées
          data = mockLiveMatches;
          break;
        case 'upcoming':
          if (targetLeague) {
            data = await fetchUpcomingMatches(targetLeague.id, 2023);
          }
          break;
        case 'recent':
          if (targetLeague) {
            data = await fetchRecentMatches(targetLeague.id, 2023);
          }
          break;
      }

      setMatches(prev => ({ ...prev, [tab]: data }));
    } catch (err) {
      console.error(`Erreur lors du chargement des matchs ${tab}:`, err);
      setError(`Erreur lors du chargement des matchs ${tab === 'live' ? 'en cours' : tab === 'upcoming' ? 'à venir' : 'récents'}`);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Charger les données au changement d'onglet
  useEffect(() => {
    fetchMatches(activeTab);
  }, [activeTab, targetLeague]);

  // Auto-refresh pour les matchs live
  useEffect(() => {
    if (activeTab === 'live') {
      const interval = setInterval(() => {
        fetchMatches('live', false);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const handleMatchClick = (matchId: number) => {
    if (leagueId) {
      navigate(`/league/${leagueId}/match/${matchId}`);
    } else {
      navigate(`/match/${matchId}`);
    }
  };

  // Grouper les matchs par championnat
  const groupMatchesByLeague = (matchList: MatchData[]) => {
    const grouped: { [leagueId: number]: { league: MatchData['league']; matches: MatchData[] } } = {};
    
    matchList.forEach(match => {
      if (!grouped[match.league.id]) {
        grouped[match.league.id] = {
          league: match.league,
          matches: []
        };
      }
      grouped[match.league.id].matches.push(match);
    });
    
    return grouped;
  };

  const renderMatches = (matchList: MatchData[]) => {
    if (loading) {
      return Array(3).fill(0).map((_, index) => (
        <Skeleton 
          key={index} 
          variant="rectangular" 
          height={80} 
          sx={{ mb: 2, borderRadius: 1 }}
        />
      ));
    }

    if (matchList.length === 0) {
      const messages = {
        live: 'Aucun match en cours actuellement',
        upcoming: 'Aucun match à venir',
        recent: 'Aucun match récent'
      };
      
      return (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {messages[activeTab]}
          </Typography>
        </Paper>
      );
    }

    // Grouper par championnat
    const groupedMatches = groupMatchesByLeague(matchList);
    const leagueEntries = Object.entries(groupedMatches);

    return leagueEntries.map(([leagueIdKey, { league, matches: leagueMatches }], index) => {
      const leagueIdNum = parseInt(leagueIdKey);
      const isExpanded = expandedLeagues[leagueIdNum] !== false; // Par défaut expanded

      return (
        <Box key={leagueIdKey} sx={{ mb: 4 }}>
          {/* En-tête du championnat avec bouton collapse */}
          <Paper 
            elevation={1}
            sx={{ 
              mb: 2, 
              backgroundColor: isExpanded ? 'primary.main' : 'grey.400',
              color: 'white'
            }}
          >
            <Box 
              sx={{ 
                p: 2,
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: isExpanded ? 'primary.dark' : 'grey.500'
                },
                transition: 'background-color 0.2s ease'
              }}
              onClick={() => toggleLeagueExpanded(leagueIdNum)}
            >
              <SportsIcon sx={{ fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1 }}>
                {league.name}
              </Typography>
              <Chip 
                label={`${leagueMatches.length} match${leagueMatches.length > 1 ? 's' : ''}`}
                size="small"
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
              {isExpanded ? (
                <ExpandLessIcon sx={{ fontSize: 24 }} />
              ) : (
                <ExpandMoreIcon sx={{ fontSize: 24 }} />
              )}
            </Box>
          </Paper>

          {/* Matchs du championnat avec animation collapse */}
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box>
              {/* En-têtes des colonnes */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 100px 1fr 120px',
                gap: 2,
                p: 2,
                backgroundColor: 'grey.100',
                borderRadius: 1,
                mb: 1
              }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                  Domicile
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary', textAlign: 'center' }}>
                  Score
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary', textAlign: 'right' }}>
                  Extérieur
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary', textAlign: 'center' }}>
                  Temps de jeu
                </Typography>
              </Box>

              {/* Liste des matchs */}
              {leagueMatches.map(match => (
                <EnhancedMatchCard
                  key={match.id}
                  match={match}
                  onClick={() => handleMatchClick(match.id)}
                />
              ))}
            </Box>
          </Collapse>
        </Box>
      );
    });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <SportsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            🏆 Matchs de Football
            {targetLeague && ` - ${targetLeague.name}`}
          </Typography>
        </Box>
      </Box>

      {/* Onglets simples */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider' }}>
          {[
            { key: 'live' as TabValue, label: '🔴 En cours', count: matches.live.length },
            { key: 'upcoming' as TabValue, label: '📅 À venir', count: matches.upcoming.length },
            { key: 'recent' as TabValue, label: '✅ Terminés', count: matches.recent.length }
          ].map(tab => (
            <Box
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              sx={{
                flex: 1,
                p: 2,
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: activeTab === tab.key ? 'primary.main' : 'transparent',
                color: activeTab === tab.key ? 'white' : 'text.primary',
                '&:hover': {
                  backgroundColor: activeTab === tab.key ? 'primary.dark' : 'grey.100'
                }
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {tab.label}
                {tab.count > 0 && (
                  <Chip 
                    label={tab.count} 
                    size="small" 
                    sx={{ ml: 1, backgroundColor: 'rgba(255,255,255,0.2)' }}
                  />
                )}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Gestion d'erreurs */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Contenu */}
      <Box>
        {renderMatches(matches[activeTab])}
      </Box>

      {/* Styles pour les animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </Container>
  );
}