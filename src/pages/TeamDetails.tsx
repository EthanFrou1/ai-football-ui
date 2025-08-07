import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Typography, 
  Box, 
  Avatar, 
  Card, 
  CardContent, 
  Grid, 
  Chip, 
  Divider,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Button,
  LinearProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Tooltip,
  Fab
} from "@mui/material";
import { 
  LocationOn, 
  Stadium, 
  Person, 
  CalendarToday,
  TrendingUp,
  SportsFootball,
  Shield,
  EmojiEvents,
  Star,
  SportsSoccer,
  Search,
  FilterList,
  KeyboardArrowUp,
  Visibility
} from "@mui/icons-material";
import { useApi } from "../hooks/useApi";
import { teamsService } from "../services/api";
import { TeamDetailsSkeleton } from "../components/UI/Loading";
import ErrorHandler from "../components/UI/ErrorHandler";
import Layout from "../components/Layout/Layout";
import BreadcrumbNavigation from "../components/UI/BreadcrumbNavigation";

// Couleurs
const COLORS = {
  wins: '#4CAF50',
  draws: '#FF9800', 
  losses: '#F44336',
  primary: '#1976d2',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3'
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Interface pour un joueur avec toutes ses statistiques
interface PlayerWithStats {
  id: number;
  name: string;
  age?: number;
  nationality?: string;
  height?: string;
  weight?: string;
  photo?: string;
  injured?: boolean;
  performance?: {
    position?: string;
    appearances?: number;
    minutes?: number;
    rating?: string | number;
    goals?: number;
    assists?: number;
    yellow_cards?: number;
    red_cards?: number;
  };
  calculated_stats?: {
    goals_per_match?: number;
    assists_per_match?: number;
    minutes_per_match?: number;
    goal_contribution?: number;
  };
}

// Composant PlayerCard amélioré - UNIQUEMENT MODE CARTE
function EnhancedPlayerCard({ 
  player, 
  onClick
}: { 
  player: PlayerWithStats; 
  onClick: () => void;
}) {
  const goalContribution = (player.performance?.goals || 0) + (player.performance?.assists || 0);
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        borderRadius: 3,
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          '& .player-photo': {
            transform: 'scale(1.05)'
          }
        }
      }}
      onClick={onClick}
    >
      {/* Header avec photo et infos de base */}
      <Box
        sx={{
          position: 'relative',
          height: 120,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        <Avatar
          src={player.photo}
          alt={player.name}
          className="player-photo"
          sx={{ 
            width: 80, 
            height: 80,
            border: '4px solid rgba(255,255,255,0.3)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            transition: 'transform 0.3s ease'
          }}
        />
        
        {/* Badges position et statut */}
        <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
          {player.performance?.position && (
            <Chip 
              label={player.performance.position} 
              size="small" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.9)', 
                color: 'primary.main',
                fontWeight: 'bold',
                fontSize: '0.75rem'
              }} 
            />
          )}
        </Box>
        
        {player.injured && (
          <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
            <Chip 
              label="🤕" 
              color="error" 
              size="small"
              sx={{ bgcolor: 'error.main', color: 'white' }}
            />
          </Box>
        )}
      </Box>

      {/* Contenu principal */}
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Nom et infos personnelles */}
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Typography variant="h6" fontWeight="700" gutterBottom noWrap>
            {player.name}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
            {player.age && (
              <Chip label={`${player.age} ans`} size="small" variant="outlined" />
            )}
            {player.nationality && (
              <Chip 
                label={player.nationality} 
                size="small" 
                color="primary" 
                variant="outlined" 
              />
            )}
          </Box>
        </Box>

        {/* Statistiques principales - Design en grille */}
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'success.50' }}>
              <Typography variant="h5" color="success.main" fontWeight="bold">
                {player.performance?.goals || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight="600">
                Buts
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={6}>
            <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'info.50' }}>
              <Typography variant="h5" color="info.main" fontWeight="bold">
                {player.performance?.assists || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight="600">
                Passes
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={6}>
            <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'primary.50' }}>
              <Typography variant="h5" color="primary.main" fontWeight="bold">
                {player.performance?.appearances || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight="600">
                Matchs
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={6}>
            <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'warning.50' }}>
              <Typography variant="h5" color="warning.main" fontWeight="bold">
                {goalContribution}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight="600">
                G+P
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Note et bouton d'action */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {player.performance?.rating && (
            <Tooltip title="Note moyenne sur la saison">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Star color="warning" fontSize="small" />
                <Typography variant="body1" fontWeight="bold" color="warning.main">
                  {typeof player.performance.rating === 'string' 
                    ? parseFloat(player.performance.rating).toFixed(1) 
                    : player.performance.rating.toFixed(1)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  /10
                </Typography>
              </Box>
            </Tooltip>
          )}
          
          <Button
            variant="outlined"
            startIcon={<Visibility />}
            size="small"
            sx={{ 
              ml: 'auto',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Voir
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function TeamDetails() {
  const { teamId, leagueId} = useParams<{ teamId: string, leagueId?: string }>();
  const teamIdNumber = parseInt(teamId || "0");
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();
  
  // États pour le système de filtres des joueurs
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('appearances');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const playersPerPage = 9; // 9 cartes par page (3x3)

  // 1. ✅ Appel pour les infos de l'équipe (position, points, etc.)
  const { data: team, loading: teamLoading, error: teamError, refetch: refetchTeam } = useApi(
    () => teamsService.getTeamWithPlayers(teamIdNumber),
    [teamIdNumber],
    !!teamIdNumber && teamIdNumber > 0
  );

  // 2. ✅ Appel pour les joueurs avec statistiques détaillées
  const { data: playersData, loading: playersLoading, error: playersError, refetch: refetchPlayers } = useApi(
    () => teamsService.getDetailedPlayersStats(teamIdNumber, 61, 2023),
    [teamIdNumber],
    !!teamIdNumber && teamIdNumber > 0 && !!team
  );

  // ✅ États combinés
  const loading = teamLoading || playersLoading;
  const error = teamError || playersError;
  const refetch = () => {
    refetchTeam();
    refetchPlayers();
  };

  // Gestion du scroll vers le haut
  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ✅ Logique de filtrage et tri des joueurs
  const filteredAndSortedPlayers = useMemo(() => {
    let players = (playersData?.players || team?.players || []) as PlayerWithStats[];
    
    // Filtrage par recherche
    if (searchTerm) {
      players = players.filter(player => 
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.nationality?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.performance?.position?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrage par position
    if (positionFilter !== 'all') {
      players = players.filter(player => {
        const position = player.performance?.position?.toLowerCase() || '';
        switch (positionFilter) {
          case 'goalkeeper': return position.includes('goalkeeper');
          case 'defender': return position.includes('defender');
          case 'midfielder': return position.includes('midfielder');
          case 'forward': return position.includes('forward') || position.includes('attacker');
          default: return true;
        }
      });
    }
    
    // Tri
    players.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'age':
          return (b.age || 0) - (a.age || 0);
        case 'goals':
          return (b.performance?.goals || 0) - (a.performance?.goals || 0);
        case 'assists':
          return (b.performance?.assists || 0) - (a.performance?.assists || 0);
        case 'appearances':
          return (b.performance?.appearances || 0) - (a.performance?.appearances || 0);
        case 'rating':
          const aRating = typeof a.performance?.rating === 'string' 
            ? parseFloat(a.performance.rating) 
            : (a.performance?.rating || 0);
          const bRating = typeof b.performance?.rating === 'string' 
            ? parseFloat(b.performance.rating) 
            : (b.performance?.rating || 0);
          return bRating - aRating;
        case 'contribution':
          const aContrib = (a.performance?.goals || 0) + (a.performance?.assists || 0);
          const bContrib = (b.performance?.goals || 0) + (b.performance?.assists || 0);
          return bContrib - aContrib;
        default:
          return (b.performance?.appearances || 0) - (a.performance?.appearances || 0);
      }
    });
    
    return players;
  }, [playersData?.players, team?.players, searchTerm, positionFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPlayers.length / playersPerPage);
  const paginatedPlayers = filteredAndSortedPlayers.slice(
    (currentPage - 1) * playersPerPage,
    currentPage * playersPerPage
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setCurrentPage(1); // Reset pagination quand on change d'onglet
  };

  const handlePlayerClick = (playerId: number) => {
    // Si on est dans le contexte d'une ligue, utiliser la route avec ligue
    if (leagueId) {
      navigate(`/league/${leagueId}/player/${playerId}`);
    } else {
      // Sinon utiliser la route globale
      navigate(`/player/${playerId}`);
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    scrollToTop();
  };

  // Positions uniques pour le filtre
  const uniquePositions = useMemo(() => {
    const positions = new Set<string>();
    (playersData?.players || team?.players || []).forEach((player: any) => {
      if (player.performance?.position) {
        const pos = player.performance.position.toLowerCase();
        if (pos.includes('goalkeeper')) positions.add('goalkeeper');
        else if (pos.includes('defender')) positions.add('defender');
        else if (pos.includes('midfielder')) positions.add('midfielder');
        else if (pos.includes('forward') || pos.includes('attacker')) positions.add('forward');
      }
    });
    return Array.from(positions);
  }, [playersData?.players, team?.players]);

  // Affichage du loading
  if (loading && !team) {
    return (
      <Layout showBreadcrumb breadcrumbComponent={<BreadcrumbNavigation />}>
        <TeamDetailsSkeleton />
      </Layout>
    );
  }

  // Affichage des erreurs
  if (error) {
    return (
      <Layout showBreadcrumb breadcrumbComponent={<BreadcrumbNavigation />}>
        <Box sx={{ padding: "2rem" }}>
          <ErrorHandler 
            error={error} 
            onRetry={refetch}
            showRetryButton={true}
          />
        </Box>
      </Layout>
    );
  }

  // Équipe non trouvée
  if (!team) {
    return (
      <Layout showBreadcrumb breadcrumbComponent={<BreadcrumbNavigation />}>
        <Box sx={{ padding: "2rem", textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Équipe non trouvée
          </Typography>
          <Typography variant="body1" color="text.secondary">
            L'équipe avec l'ID {teamId} n'existe pas ou n'est plus disponible.
          </Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout showBreadcrumb breadcrumbComponent={<BreadcrumbNavigation />}>
      {/* En-tête de l'équipe - PLEINE LARGEUR */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent sx={{ textAlign: "center", p: 4, color: 'white' }}>
          <Grid container alignItems="center" spacing={4}>
            <Grid item xs={12} md={3}>
              <Avatar
                src={team.logo || `https://media.api-sports.io/football/teams/${team.id}.png`}
                alt="team logo"
                sx={{ 
                  width: 120, 
                  height: 120, 
                  margin: "0 auto", 
                  border: '4px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                {team.name}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip 
                  label={team.country} 
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(10px)' }}
                  icon={<LocationOn sx={{ color: 'white !important' }} />}
                />
                {team.code && (
                  <Chip 
                    label={team.code} 
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(10px)' }}
                  />
                )}
                {team.position && (
                  <Chip 
                    label={`#${team.position} au classement`}
                    sx={{ 
                      backgroundColor: 'rgba(255,215,0,0.9)', 
                      color: 'black', 
                      fontWeight: 'bold' 
                    }}
                    icon={<EmojiEvents sx={{ color: 'black !important' }} />}
                  />
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={3}>
              <Grid container spacing={2}>
                <Grid item xs={4} md={12}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {team.matches_played || 0}
                  </Typography>
                  <Typography variant="body2">Matchs</Typography>
                </Grid>
                <Grid item xs={4} md={12}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: COLORS.wins }}>
                    {team.points || 0}
                  </Typography>
                  <Typography variant="body2">Points</Typography>
                </Grid>
                <Grid item xs={4} md={12}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {team.position ? `${team.position}°` : '?'}
                  </Typography>
                  <Typography variant="body2">Position</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Onglets de navigation */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              py: 2
            }
          }}
        >
          <Tab label="Informations" icon={<Person />} />
          <Tab label="Statistiques" icon={<TrendingUp />} />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SportsFootball />
                Joueurs ({(playersData?.players || team?.players || []).length})
                {playersLoading && (
                  <Box sx={{ ml: 1 }}>
                    <LinearProgress sx={{ width: 20, height: 2 }} />
                  </Box>
                )}
              </Box>
            } 
          />
          <Tab label="Performance" icon={<EmojiEvents />} />
        </Tabs>
      </Paper>

      <Box sx={{ px: 2 }}>
        {/* Onglet Informations */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <Person color="primary" /> Informations générales
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  {team.founded && (
                    <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CalendarToday color="action" />
                      <Box>
                        <Typography variant="h6" fontWeight="600">Fondé en {team.founded}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date().getFullYear() - team.founded} ans d'histoire
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  
                  {team.venue_name && (
                    <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Stadium color="action" />
                      <Box>
                        <Typography variant="h6" fontWeight="600">{team.venue_name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {team.venue_city}
                        </Typography>
                        {team.venue_capacity && (
                          <Typography variant="body2" color="text.secondary">
                            Capacité : {team.venue_capacity.toLocaleString()} places
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <EmojiEvents color="primary" /> Palmarès récent
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#FFD700', width: 48, height: 48 }}>🏆</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography variant="h6">Championnat National</Typography>}
                        secondary="3 victoires • 2019, 2021, 2023"
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#C0C0C0', width: 48, height: 48 }}>🥈</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography variant="h6">Coupe Nationale</Typography>}
                        secondary="2 victoires • 2020, 2022"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Onglet Statistiques */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h5" gutterBottom>
            Statistiques en cours de développement
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Les graphiques seront disponibles une fois les composants TeamStatsCharts créés.
          </Typography>
        </TabPanel>

        {/* Onglet Joueurs - VERSION COMPLÈTE AVEC FILTRES */}
        <TabPanel value={tabValue} index={2}>
          {/* Barre de filtres et recherche */}
          <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
            <Grid container spacing={3} alignItems="center">
              {/* Recherche */}
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  placeholder="Rechercher un joueur..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              {/* Filtre par position */}
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Position</InputLabel>
                  <Select
                    value={positionFilter}
                    onChange={(e) => {
                      setPositionFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    label="Position"
                  >
                    <MenuItem value="all">Toutes</MenuItem>
                    {uniquePositions.includes('goalkeeper') && <MenuItem value="goalkeeper">Gardiens</MenuItem>}
                    {uniquePositions.includes('defender') && <MenuItem value="defender">Défenseurs</MenuItem>}
                    {uniquePositions.includes('midfielder') && <MenuItem value="midfielder">Milieux</MenuItem>}
                    {uniquePositions.includes('forward') && <MenuItem value="forward">Attaquants</MenuItem>}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Tri */}
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Trier par</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Trier par"
                  >
                    <MenuItem value="appearances">Matchs joués</MenuItem>
                    <MenuItem value="goals">Buts</MenuItem>
                    <MenuItem value="assists">Passes</MenuItem>
                    <MenuItem value="contribution">Buts + Passes</MenuItem>
                    <MenuItem value="rating">Note moyenne</MenuItem>
                    <MenuItem value="name">Nom</MenuItem>
                    <MenuItem value="age">Âge</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Informations */}
              <Grid item xs={12} md={1}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>{filteredAndSortedPlayers.length}</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    joueur(s)
                  </Typography>
                  {playersLoading && (
                    <LinearProgress sx={{ mt: 1 }} />
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Grille des joueurs - MODE CARTE UNIQUEMENT */}
          {filteredAndSortedPlayers.length > 0 ? (
            <Box>
              {/* Affichage en grille 3x3 */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {paginatedPlayers.map((player) => (
                  <Grid item xs={12} sm={6} md={4} key={player.id}>
                    <EnhancedPlayerCard
                      player={player}
                      onClick={() => handlePlayerClick(player.id)}
                    />
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <SportsFootball sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {playersLoading 
                  ? 'Chargement des données des joueurs...' 
                  : searchTerm || positionFilter !== 'all'
                    ? 'Aucun joueur ne correspond à vos critères'
                    : 'Aucun joueur trouvé'
                }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {playersLoading 
                  ? 'Les statistiques des joueurs sont en cours de récupération depuis l\'API.'
                  : searchTerm || positionFilter !== 'all'
                    ? 'Essayez de modifier vos filtres de recherche.'
                    : 'Les données des joueurs ne sont pas disponibles pour cette équipe.'
                }
              </Typography>
              {(searchTerm || positionFilter !== 'all') && (
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    setSearchTerm('');
                    setPositionFilter('all');
                    setCurrentPage(1);
                  }}
                  sx={{ mt: 2 }}
                >
                  Réinitialiser les filtres
                </Button>
              )}
            </Box>
          )}

          {/* Statistiques rapides de l'effectif */}
          {filteredAndSortedPlayers.length > 0 && (
            <Paper sx={{ mt: 4, p: 3, bgcolor: 'primary.50' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp color="primary" /> Statistiques de l'effectif
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {filteredAndSortedPlayers.reduce((sum, p) => sum + (p.performance?.goals || 0), 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total buts
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main" fontWeight="bold">
                      {filteredAndSortedPlayers.reduce((sum, p) => sum + (p.performance?.assists || 0), 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total passes
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary.main" fontWeight="bold">
                      {Math.round(filteredAndSortedPlayers.reduce((sum, p) => sum + (p.age || 0), 0) / filteredAndSortedPlayers.length) || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Âge moyen
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main" fontWeight="bold">
                      {filteredAndSortedPlayers.filter(p => (p.performance?.goals || 0) > 0).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Buteurs différents
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}
        </TabPanel>

        {/* Onglet Performance */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h5" gutterBottom>
            Performance en cours de développement
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Les analyses de performance seront disponibles prochainement.
          </Typography>
        </TabPanel>
      </Box>

      {/* Image du stade si disponible */}
      {team.venue_image && (
        <Card sx={{ mt: 4 }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ position: 'relative' }}>
              <Box
                component="img"
                src={team.venue_image}
                alt={team.venue_name}
                sx={{
                  width: '100%',
                  height: 400,
                  objectFit: 'cover',
                }}
              />
              <Box 
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  color: 'white',
                  p: 4
                }}
              >
                <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Stadium /> {team.venue_name}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  {team.venue_city} • Capacité: {team.venue_capacity?.toLocaleString()} places
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Bouton scroll vers le haut */}
      {showScrollTop && (
        <Fab
          color="primary"
          size="medium"
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      )}
      
      {/* Debug info amélioré */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Paper sx={{ p: 3, backgroundColor: 'grey.50' }}>
          <Typography variant="body1" color="text.secondary">
            ⚽ <strong>Team ID:</strong> {teamId} • 
            <strong>Position:</strong> #{team.position} • 
            <strong>Points:</strong> {team.points} • 
            <strong>Joueurs API:</strong> {(playersData?.players || team?.players || []).length} • 
            <strong>Affichés:</strong> {paginatedPlayers.length} • 
            <strong>Page:</strong> {currentPage}/{totalPages} • 
            <strong>Status:</strong> {playersLoading ? '🔄 Chargement...' : '✅ Terminé'} • 
            Dernière mise à jour : {new Date().toLocaleString()}
          </Typography>
        </Paper>
      </Box>
    </Layout>
  );
}