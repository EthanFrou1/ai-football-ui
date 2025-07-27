import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useTeams } from '../hooks/useTeams';
import Layout from '../components/Layout/Layout';
import BreadcrumbNavigation from '../components/UI/BreadcrumbNavigation';

// Composant pour une carte d'équipe
interface TeamCardProps {
  team: {
    id: number;
    name: string;
    logo: string;
    country: string;
    position: number;
    points: number;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goals_for: number;
    goals_against: number;
    goalsDiff: number;
    form?: string;
    status?: string;
    description?: string;
  };
  isGridView: boolean;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, isGridView }) => {
  // Déterminer la couleur du badge selon la position
  const getPositionColor = (position: number) => {
    if (position <= 3) return 'success'; // Champions League
    if (position <= 6) return 'info'; // Europa League
    if (position >= 18) return 'error'; // Relégation
    return 'default';
  };

  if (isGridView) {
    return (
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Link to={`/teams/${team.id}`} style={{ textDecoration: 'none' }}>
          <Card sx={{ 
            height: '100%', 
            transition: 'transform 0.2s', 
            '&:hover': { transform: 'scale(1.02)' } 
          }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Avatar
                src={team.logo}
                alt={team.name}
                sx={{ width: 64, height: 64, margin: '0 auto', mb: 2 }}
              />
              
              <Typography variant="h6" noWrap sx={{ mb: 1, fontWeight: 'bold' }}>
                {team.name}
              </Typography>
              
              <Chip 
                label={`${team.position}e place`} 
                size="small" 
                color={getPositionColor(team.position)}
                sx={{ mb: 1 }}
              />
              
              <Typography variant="body1" sx={{ mb: 1, fontWeight: 'bold' }}>
                {team.points} pts
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {team.played} matchs • {team.wins}V-{team.draws}N-{team.losses}D
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Buts: {team.goals_for}-{team.goals_against} ({team.goalsDiff})
              </Typography>
              
              {team.form && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Forme: {team.form}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Link>
      </Grid>
    );
  }

  // Vue liste
  return (
    <Grid item xs={12}>
      <Link to={`/teams/${team.id}`} style={{ textDecoration: 'none' }}>
        <Card sx={{ 
          transition: 'background-color 0.2s', 
          '&:hover': { backgroundColor: 'action.hover' } 
        }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <Chip 
                label={team.position} 
                color={getPositionColor(team.position)}
                sx={{ minWidth: 40, fontWeight: 'bold' }}
              />
              
              <Avatar src={team.logo} alt={team.name} sx={{ width: 48, height: 48 }} />
              
              <Box flex={1}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {team.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {team.description || team.country}
                </Typography>
              </Box>
              
              <Box textAlign="center" sx={{ minWidth: 80 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {team.points}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Points
                </Typography>
              </Box>
              
              <Box textAlign="center" sx={{ minWidth: 80 }}>
                <Typography variant="body2">
                  {team.played}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Matchs
                </Typography>
              </Box>
              
              <Box textAlign="center" sx={{ minWidth: 120 }}>
                <Typography variant="body2">
                  {team.wins}V-{team.draws}N-{team.losses}D
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Bilan
                </Typography>
              </Box>
              
              <Box textAlign="center" sx={{ minWidth: 100 }}>
                <Typography variant="body2">
                  {team.goals_for}-{team.goals_against}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Buts ({team.goalsDiff})
                </Typography>
              </Box>
              
              {team.form && (
                <Box textAlign="center" sx={{ minWidth: 80 }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {team.form}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Forme
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Link>
    </Grid>
  );
};

export default function Teams() {
  // Pour le moment, on utilise des valeurs par défaut
  // Tu pourras les récupérer du context League plus tard
  const leagueId = 61; // Ligue 1
  const season = 2023;
  
  const [isGridView, setIsGridView] = useState(true);
  
  const {
    teams,
    allTeams,
    loading,
    error,
    filters,
    setFilters,
    clearFilters,
    searchQuery,
    setSearchQuery,
    stats,
    refetch
  } = useTeams(leagueId, season);

  if (loading) {
    return (
      <Layout showBreadcrumb breadcrumbComponent={<BreadcrumbNavigation />}>
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="400px"
        >
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Chargement des équipes...</Typography>
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout showBreadcrumb breadcrumbComponent={<BreadcrumbNavigation />}>
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={refetch}>
            Réessayer
          </Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout showBreadcrumb breadcrumbComponent={<BreadcrumbNavigation />}>
      <Box sx={{ p: 3 }}>
        {/* En-tête avec statistiques */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4">
              Équipes ({stats.total})
            </Typography>
            <Box display="flex" gap={2} mt={1}>
              <Chip 
                label={`${stats.championsLeague} en C1`} 
                color="success" 
                size="small" 
              />
              <Chip 
                label={`${stats.europaLeague} en C3`} 
                color="info" 
                size="small" 
              />
              <Chip 
                label={`${stats.relegation} en danger`} 
                color="error" 
                size="small" 
              />
            </Box>
          </Box>
          <Button variant="outlined" size="small" onClick={refetch}>
            Actualiser
          </Button>
        </Box>

        {/* Statistiques supplémentaires */}
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <Card sx={{ p: 2, minWidth: 200 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Meilleure attaque
            </Typography>
            <Typography variant="h6">
              {stats.topScorer?.name || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stats.topScorer?.goals_for || 0} buts
            </Typography>
          </Card>
          
          <Card sx={{ p: 2, minWidth: 200 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Meilleure défense
            </Typography>
            <Typography variant="h6">
              {stats.bestDefense?.name || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stats.bestDefense?.goals_against || 0} buts encaissés
            </Typography>
          </Card>
          
          <Card sx={{ p: 2, minWidth: 200 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Moyenne de points
            </Typography>
            <Typography variant="h6">
              {stats.averagePoints}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              points par équipe
            </Typography>
          </Card>
        </Box>

        {/* Filtres et contrôles */}
        <Box display="flex" gap={2} mb={3} flexWrap="wrap" alignItems="center">
          <TextField
            label="Rechercher une équipe"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: 250 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Trier par</InputLabel>
            <Select
              value={filters.sortBy}
              onChange={(e) => setFilters({ sortBy: e.target.value as any })}
              label="Trier par"
            >
              <MenuItem value="position">Position</MenuItem>
              <MenuItem value="name">Nom</MenuItem>
              <MenuItem value="points">Points</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Qualification</InputLabel>
            <Select
              value={filters.qualification}
              onChange={(e) => setFilters({ qualification: e.target.value as any })}
              label="Qualification"
            >
              <MenuItem value="all">Toutes</MenuItem>
              <MenuItem value="champions-league">Champions League</MenuItem>
              <MenuItem value="europa-league">Europa League</MenuItem>
              <MenuItem value="relegation">Relégation</MenuItem>
            </Select>
          </FormControl>
          
          <FormControlLabel
            control={
              <Switch
                checked={isGridView}
                onChange={(e) => setIsGridView(e.target.checked)}
              />
            }
            label={isGridView ? "Vue grille" : "Vue liste"}
          />
          
          {(filters.search || filters.qualification !== 'all' || filters.sortBy !== 'position') && (
            <Button 
              variant="outlined" 
              size="small" 
              onClick={clearFilters}
            >
              Réinitialiser filtres
            </Button>
          )}
        </Box>

        {/* Résultats */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {teams.length} équipe(s) affichée(s)
          {searchQuery && ` pour "${searchQuery}"`}
          {filters.qualification !== 'all' && ` • Filtre: ${filters.qualification}`}
        </Typography>

        {/* Grille des équipes */}
        <Grid container spacing={isGridView ? 3 : 1}>
          {teams.map((team) => (
            <TeamCard 
              key={team.id} 
              team={team} 
              isGridView={isGridView}
            />
          ))}
        </Grid>

        {teams.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              Aucune équipe trouvée
            </Typography>
            {(searchQuery || filters.qualification !== 'all') && (
              <Button 
                variant="text" 
                onClick={clearFilters}
                sx={{ mt: 1 }}
              >
                Réinitialiser les filtres
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Layout>
  );
}