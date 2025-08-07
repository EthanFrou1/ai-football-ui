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
  Tooltip,
  Fab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import { 
  Person, 
  CalendarToday,
  TrendingUp,
  SportsFootball,
  EmojiEvents,
  Star,
  Flag,
  Height,
  MonitorWeight,
  KeyboardArrowUp,
  SportsSoccer,
  Timeline,
  History,
  Shield
} from "@mui/icons-material";
import { useApi } from "../hooks/useApi";
import { playersService } from "../services/api";
//import { PlayerDetailsSkeleton } from "../components/UI/Loading";
import ErrorHandler from "../components/UI/ErrorHandler";
import Layout from "../components/Layout/Layout";
import BreadcrumbNavigation from "../components/UI/BreadcrumbNavigation";

// Couleurs cohérentes avec TeamDetails
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

// Interface pour les détails du joueur
interface PlayerDetails {
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
  // Infos équipe actuelle
  current_team?: {
    id: number;
    name: string;
    logo: string;
  };
  // Statistiques saison
  performance?: {
    position?: string;
    appearances?: number;
    minutes?: number;
    rating?: string | number;
    goals?: number;
    assists?: number;
    yellow_cards?: number;
    red_cards?: number;
    captain?: boolean;
  };
  // Statistiques calculées
  calculated_stats?: {
    goals_per_match?: number;
    assists_per_match?: number;
    minutes_per_match?: number;
    goal_contribution?: number;
  };
}

// Composant StatCard pour les statistiques
function StatCard({ 
  icon, 
  label, 
  value, 
  color = 'primary',
  subtitle 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number; 
  color?: string;
  subtitle?: string;
}) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ textAlign: 'center', py: 3 }}>
        <Box sx={{ color: `${color}.main`, mb: 1 }}>
          {icon}
        </Box>
        <Typography variant="h4" fontWeight="bold" color={`${color}.main`}>
          {value}
        </Typography>
        <Typography variant="body1" fontWeight="600" gutterBottom>
          {label}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

// Composant PerformanceChart (placeholder)
function PerformanceChart({ title, data }: { title: string; data: any[] }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Graphique en cours de développement
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function PlayerDetails() {
  const { playerId } = useParams<{ playerId: string }>();
  const playerIdNumber = parseInt(playerId || "0");
  const [tabValue, setTabValue] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();

  // API call pour récupérer les détails du joueur
  const { data: player, loading, error, refetch } = useApi(
    () => playersService.getPlayerDetails(playerIdNumber, 61, 2023),
    [playerIdNumber],
    !!playerIdNumber && playerIdNumber > 0
  );

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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Calculs pour affichage
  const goalContribution = (player?.performance?.goals || 0) + (player?.performance?.assists || 0);
  const efficiency = player?.performance?.appearances ? 
    ((player?.performance?.goals || 0) / player.performance.appearances * 100).toFixed(1) : '0';

  // Affichage du loading
  if (loading && !player) {
    return (
      <Layout showBreadcrumb breadcrumbComponent={<BreadcrumbNavigation />}>
        {/* <PlayerDetailsSkeleton /> */}
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

  // Joueur non trouvé
  if (!player) {
    return (
      <Layout showBreadcrumb breadcrumbComponent={<BreadcrumbNavigation />}>
        <Box sx={{ padding: "2rem", textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Joueur non trouvé
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Le joueur avec l'ID {playerId} n'existe pas ou n'est plus disponible.
          </Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout showBreadcrumb breadcrumbComponent={<BreadcrumbNavigation />}>
      {/* En-tête héroïque du joueur */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent sx={{ p: 4, color: 'white' }}>
          <Grid container alignItems="center" spacing={4}>
            {/* Photo du joueur */}
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar
                  src={player.photo || '/default-player.png'}
                  alt={player.name}
                  sx={{ 
                    width: 150, 
                    height: 150, 
                    margin: "0 auto", 
                    border: '4px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    mb: 2
                  }}
                />
                {/* Badges statut */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                  {player.performance?.captain && (
                    <Chip 
                      label="Capitaine" 
                      icon={<Shield />}
                      sx={{ bgcolor: 'rgba(255,215,0,0.9)', color: 'black', fontWeight: 'bold' }}
                    />
                  )}
                  {player.injured && (
                    <Chip 
                      label="Blessé" 
                      color="error"
                      sx={{ bgcolor: 'error.main', color: 'white' }}
                    />
                  )}
                </Box>
              </Box>
            </Grid>
            
            {/* Informations principales */}
            <Grid item xs={12} md={6}>
              <Typography variant="h2" gutterBottom sx={{ fontWeight: 700, textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                {player.name}
              </Typography>
              
              <Typography variant="h5" sx={{ mb: 2, opacity: 0.9 }}>
                {player.performance?.position || 'Position non définie'}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {player.age && (
                  <Chip 
                    label={`${player.age} ans`}
                    icon={<CalendarToday />}
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(10px)' }}
                  />
                )}
                {player.nationality && (
                  <Chip 
                    label={player.nationality}
                    icon={<Flag />}
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(10px)' }}
                  />
                )}
                {player.height && (
                  <Chip 
                    label={player.height}
                    icon={<Height />}
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(10px)' }}
                  />
                )}
                {player.weight && (
                  <Chip 
                    label={player.weight}
                    icon={<MonitorWeight />}
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(10px)' }}
                  />
                )}
              </Box>
              
              {/* Équipe actuelle */}
              {player.current_team && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar 
                    src={player.current_team.logo} 
                    sx={{ width: 40, height: 40 }}
                  />
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    {player.current_team.name}
                  </Typography>
                </Box>
              )}
            </Grid>

            {/* Statistiques rapides */}
            <Grid item xs={12} md={3}>
              <Grid container spacing={2}>
                <Grid item xs={6} md={12}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      {player.performance?.goals || 0}
                    </Typography>
                    <Typography variant="body1">Buts</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={12}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      {player.performance?.assists || 0}
                    </Typography>
                    <Typography variant="body1">Passes</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={12}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      {player.performance?.appearances || 0}
                    </Typography>
                    <Typography variant="body1">Matchs</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={12}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      {player.performance?.rating ? 
                        (typeof player.performance.rating === 'string' ? 
                          parseFloat(player.performance.rating).toFixed(1) : 
                          player.performance.rating.toFixed(1)
                        ) : '--'
                      }
                    </Typography>
                    <Typography variant="body1">Note</Typography>
                  </Box>
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
          <Tab label="Statistiques" icon={<TrendingUp />} />
          <Tab label="Performance" icon={<Timeline />} />
          <Tab label="Carrière" icon={<History />} />
          <Tab label="Matchs" icon={<SportsFootball />} />
        </Tabs>
      </Paper>

      <Box sx={{ px: 2 }}>
        {/* Onglet Statistiques */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={4}>
            {/* Statistiques principales */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <TrendingUp color="primary" /> Statistiques de la saison 2023
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={3}>
                    <Grid item xs={6} sm={3}>
                      <StatCard 
                        icon={<SportsFootball sx={{ fontSize: 40 }} />}
                        label="Buts marqués"
                        value={player.performance?.goals || 0}
                        color="success"
                        subtitle={`${efficiency}% d'efficacité`}
                      />
                    </Grid>
                    
                    <Grid item xs={6} sm={3}>
                      <StatCard 
                        icon={<SportsSoccer sx={{ fontSize: 40 }} />}
                        label="Passes décisives"
                        value={player.performance?.assists || 0}
                        color="info"
                      />
                    </Grid>
                    
                    <Grid item xs={6} sm={3}>
                      <StatCard 
                        icon={<EmojiEvents sx={{ fontSize: 40 }} />}
                        label="Contributions"
                        value={goalContribution}
                        color="warning"
                        subtitle="Buts + Passes"
                      />
                    </Grid>
                    
                    <Grid item xs={6} sm={3}>
                      <StatCard 
                        icon={<Star sx={{ fontSize: 40 }} />}
                        label="Note moyenne"
                        value={player.performance?.rating ? 
                          (typeof player.performance.rating === 'string' ? 
                            parseFloat(player.performance.rating).toFixed(1) : 
                            player.performance.rating.toFixed(1)
                          ) : '--'
                        }
                        color="primary"
                        subtitle="/10"
                      />
                    </Grid>
                  </Grid>

                  {/* Minutes et cartons */}
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      Temps de jeu et discipline
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                          <Typography variant="h5" fontWeight="bold">
                            {player.performance?.minutes || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Minutes jouées
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50' }}>
                          <Typography variant="h5" fontWeight="bold" color="warning.main">
                            {player.performance?.yellow_cards || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Cartons jaunes
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.50' }}>
                          <Typography variant="h5" fontWeight="bold" color="error.main">
                            {player.performance?.red_cards || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Cartons rouges
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Informations personnelles */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: 'fit-content' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person color="primary" /> Informations
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <List>
                    {player.birth_date && (
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.50' }}>
                            <CalendarToday color="primary" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Date de naissance"
                          secondary={new Date(player.birth_date).toLocaleDateString('fr-FR')}
                        />
                      </ListItem>
                    )}
                    
                    {player.birth_place && (
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'info.50' }}>
                            <Flag color="info" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Lieu de naissance"
                          secondary={`${player.birth_place}, ${player.birth_country}`}
                        />
                      </ListItem>
                    )}
                    
                    {player.height && (
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'success.50' }}>
                            <Height color="success" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Taille"
                          secondary={player.height}
                        />
                      </ListItem>
                    )}
                    
                    {player.weight && (
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'warning.50' }}>
                            <MonitorWeight color="warning" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Poids"
                          secondary={player.weight}
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Onglet Performance */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <PerformanceChart 
                title="Évolution des buts"
                data={[]}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PerformanceChart 
                title="Notes par match"
                data={[]}
              />
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Comparaison avec la moyenne du championnat
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Graphiques de comparaison en cours de développement
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Onglet Carrière */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Historique de carrière
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Timeline des transferts et palmarès en cours de développement
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Onglet Matchs */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Derniers matchs joués
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Historique des performances en cours de développement
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>

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
      
      {/* Debug info */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Paper sx={{ p: 3, backgroundColor: 'grey.50' }}>
          <Typography variant="body1" color="text.secondary">
            👤 <strong>Player ID:</strong> {playerId} • 
            <strong>Position:</strong> {player.performance?.position || 'N/A'} • 
            <strong>Équipe:</strong> {player.current_team?.name || 'N/A'} • 
            Dernière mise à jour : {new Date().toLocaleString()}
          </Typography>
        </Paper>
      </Box>
    </Layout>
  );
}