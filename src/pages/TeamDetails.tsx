import React, { useState } from "react";
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
  LinearProgress
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
  SportsSoccer
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

// Composant PlayerCard intégré (simplifié)
function PlayerCard({ 
  player, 
  rank, 
  onClick 
}: { 
  player: any; 
  rank?: number;
  onClick: () => void;
}) {
  return (
    <Card 
      sx={{ 
        mb: 2, 
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          bgcolor: 'primary.50'
        }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={3} alignItems="center">
          {/* Photo et rang */}
          <Grid item xs={12} sm={3} md={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {rank && (
                <Box 
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    bgcolor: rank <= 3 ? '#FFD700' : 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.2rem'
                  }}
                >
                  {rank}
                </Box>
              )}
              <Avatar
                src={player.photo}
                alt={player.name}
                sx={{ width: 60, height: 60 }}
              />
            </Box>
          </Grid>

          {/* Infos joueur */}
          <Grid item xs={12} sm={4} md={3}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {player.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {player.age && (
                <Chip label={`${player.age} ans`} size="small" variant="outlined" />
              )}
              {player.nationality && (
                <Chip label={player.nationality} size="small" color="primary" variant="outlined" />
              )}
              {player.position && (
                <Chip label={player.position} size="small" color="secondary" />
              )}
            </Box>
            {player.injured && (
              <Chip label="🤕 Blessé" color="error" size="small" sx={{ mt: 1 }} />
            )}
          </Grid>

          {/* Statistiques principales */}
          <Grid item xs={12} sm={5} md={7}>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" color="success.main" fontWeight="bold">
                    {player.goals || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Buts
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" color="info.main" fontWeight="bold">
                    {player.assists || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Passes
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" color="primary.main" fontWeight="bold">
                    {player.appearances || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Matchs
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                {player.rating && (
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color="warning.main" fontWeight="bold">
                      {typeof player.rating === 'string' ? parseFloat(player.rating).toFixed(1) : player.rating.toFixed(1)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Note
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default function TeamDetails() {
  const { teamId } = useParams<{ teamId: string }>();
  const teamIdNumber = parseInt(teamId || "0");
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();

  // 1. ✅ Appel pour les infos de l'équipe (position, points, etc.)
  const { data: team, loading: teamLoading, error: teamError, refetch: refetchTeam } = useApi(
    () => teamsService.getTeamWithPlayers(teamIdNumber),
    [teamIdNumber],
    !!teamIdNumber && teamIdNumber > 0
  );

  // 2. 🔄 NOUVEAU : Appel pour les joueurs avec statistiques détaillées
  const { data: playersData, loading: playersLoading, error: playersError, refetch: refetchPlayers } = useApi(
    () => teamsService.getDetailedPlayersStats(teamIdNumber, 61, 2023),
    [teamIdNumber],
    !!teamIdNumber && teamIdNumber > 0 && !!team // Attendre que l'équipe soit chargée
  );

  // ✅ États combinés
  const loading = teamLoading || playersLoading;
  const error = teamError || playersError;
  const refetch = () => {
    refetchTeam();
    refetchPlayers();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePlayerClick = (playerId: number) => {
    navigate(`/player/${playerId}`);
  };

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
                {/* NOUVEAU : Chip de position */}
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
                Joueurs
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

        {/* Onglet Joueurs - VERSION AMÉLIORÉE */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={4}>
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SportsFootball color="primary" /> 
                      Effectif ({(playersData?.players || team.players || []).length} joueurs)
                    </Typography>
                    {((playersData?.players && playersData.players.length > 0) || (team.players && team.players.length > 0)) && (
                      <Button variant="outlined" startIcon={<SportsSoccer />}>
                        Voir statistiques détaillées
                      </Button>
                    )}
                    {playersLoading && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress sx={{ width: 100 }} />
                        <Typography variant="body2" color="text.secondary">
                          Chargement des stats...
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  
                  <Divider sx={{ mb: 3 }} />
                  
                  {((playersData?.players && playersData.players.length > 0) || (team.players && team.players.length > 0)) ? (
                    <Box>
                      {(playersData?.players || team.players || []).slice(0, 10).map((player, index) => (
                        <PlayerCard
                          key={player.id}
                          player={player}
                          onClick={() => handlePlayerClick(player.id)}
                        />
                      ))}
                      
                      {(playersData?.players || team.players || []).length > 10 && (
                        <Box sx={{ textAlign: 'center', mt: 3 }}>
                          <Button 
                            variant="outlined" 
                            size="large"
                            onClick={() => navigate(`/team/${teamId}/players`)}
                          >
                            Voir les {(playersData?.players || team.players || []).length - 10} autres joueurs
                          </Button>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <SportsFootball sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        {playersLoading ? 'Chargement des données des joueurs...' : 'Aucun joueur trouvé'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {playersLoading 
                          ? 'Les statistiques des joueurs sont en cours de récupération depuis l\'API.'
                          : 'Les données des joueurs ne sont pas disponibles pour cette équipe.'
                        }
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Card sx={{ height: 'fit-content' }}>
                <CardContent sx={{ p: 4 }}>
                  {/* Top Scoreurs - AVEC VRAIES DONNÉES */}
                  <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <Star color="warning" /> Top Scoreurs
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  {playersData?.players && playersData.players.length > 0 ? (
                    <List>
                      {playersData.players
                        .filter(p => (p.performance?.goals || 0) > 0)  // Seulement ceux qui ont marqué
                        .sort((a, b) => (b.performance?.goals || 0) - (a.performance?.goals || 0))  // Tri par buts
                        .slice(0, 5)  // Top 5
                        .map((player, index) => (
                          <ListItem key={player.id} sx={{ px: 0, py: 2 }}>
                            <ListItemAvatar>
                              <Avatar 
                                sx={{ 
                                  bgcolor: index === 0 ? '#FFD700' : 'primary.main',
                                  width: 40,
                                  height: 40,
                                  fontWeight: 'bold'
                                }}
                              >
                                {index + 1}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={<Typography variant="h6">{player.name}</Typography>}
                              secondary={`${player.performance?.goals || 0} buts • ${player.performance?.assists || 0} passes • ${player.performance?.appearances || 0} matchs`}
                            />
                          </ListItem>
                        ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      {playersLoading ? 'Chargement des statistiques...' : 'Aucun buteur pour cette saison'}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
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
      
      {/* Debug info amélioré */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Paper sx={{ p: 3, backgroundColor: 'grey.50' }}>
          <Typography variant="body1" color="text.secondary">
            ⚽ <strong>Team ID:</strong> {teamId} • 
            <strong>Position:</strong> #{team.position} • 
            <strong>Points:</strong> {team.points} • 
            <strong>Joueurs chargés:</strong> {team.players?.length || 0} • 
            <strong>Joueurs détaillés:</strong> {playersData?.players?.length || 0} • 
            <strong>Status:</strong> {playersLoading ? '🔄 Chargement...' : '✅ Terminé'} • 
            Dernière mise à jour : {new Date().toLocaleString()}
          </Typography>
        </Paper>
      </Box>
    </Layout>
  );
}