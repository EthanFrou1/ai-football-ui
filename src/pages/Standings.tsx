// src/pages/Standings.tsx
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Container,
  Grid,
  Paper,
  Divider
} from '@mui/material';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Remove, EmojiEvents } from '@mui/icons-material';
import { useLeague } from '../contexts/LeagueContext';
import { useApi } from '../hooks/useApi';
import { useSeason } from '../hooks/useSeason';
import { standingsService } from '../services/api/standingsService';
import { LoadingSpinner } from '../components/UI/Loading';
import ErrorHandler from '../components/UI/ErrorHandler';
import SeasonSelector from '../components/UI/SeasonSelector';
import Layout from '../components/Layout/Layout';
import BreadcrumbNavigation from '../components/UI/BreadcrumbNavigation';
import { MatchesAccessCard, CompactMatchesButton } from '../components/Matches/MatchesAccessButton';
import type { StandingEntry } from '../services/api/standingsService';

export default function Standings() {
  const { currentLeague, isLoading: leagueLoading } = useLeague();
  const { selectedSeason, setSelectedSeason, getSeasonLabel, loading: seasonLoading } = useSeason(2023);

  // Appel API avec la saison sélectionnée
  const { data: standingsData, loading, error, refetch } = useApi(
    async () => {
      if (!currentLeague || !selectedSeason) throw new Error('Ligue ou saison manquante');
      return standingsService.getStandings(currentLeague.id, selectedSeason);
    },
    [currentLeague?.id, selectedSeason],
    !!(currentLeague && selectedSeason)
  );

  const standings = standingsData?.standings || [];
  const leagueInfo = standingsData?.league;

  // Debug temporaire
  console.log('🔍 Debug Standings:', {
    standingsData,
    standings: standings?.length,
    firstEntry: standings?.[0]
  });

  // Fonction pour obtenir l'icône de tendance
  const getTrendIcon = (status: string) => {
    switch (status) {
      case 'up':
        return <TrendingUp sx={{ color: 'success.main', fontSize: 16 }} />;
      case 'down':
        return <TrendingDown sx={{ color: 'error.main', fontSize: 16 }} />;
      default:
        return <Remove sx={{ color: 'text.secondary', fontSize: 16 }} />;
    }
  };

  // Fonction pour obtenir la couleur de qualification
  const getQualificationColor = (description: string | null | undefined) => {
    if (!description) return 'transparent';
    
    if (description.includes('Champions League')) return '#00387b';
    if (description.includes('Europa League')) return '#ff6b00';
    if (description.includes('Relegation')) return '#d32f2f';
    return 'transparent';
  };

  // 🔧 CORRECTION COMPLÈTE de la fonction parseForm
  const parseForm = (form: string | null | undefined) => {
    if (!form) return null;
    
    // Nettoyer les points et traiter chaque caractère
    return form.replace(/\./g, '').split('').map((result, index) => {
      // ✅ Type correct pour MUI Chip colors
      let colorForme: 'default' | 'success' | 'error' | 'warning' = 'default';
      let labelForme = result;
      
      switch (result) {
        case 'W':
          colorForme = 'success';
          labelForme = 'V';
          break;
        case 'L':
          colorForme = 'error';  // ✅ L = Défaite = Rouge (error)
          labelForme = 'D';
          break;
        case 'D':
          colorForme = 'warning'; // ✅ D = Nul = Orange (warning)
          labelForme = 'N';
          break;
        default:
          // Pour tout autre caractère, on enlève les points
          labelForme = result.replace('.', '');
          break;
      }
      
      return (
       <Chip
          key={index}
          label={labelForme}  // ✅ Utilise labelForme, pas result
          size="small"
          color={colorForme}  // ✅ Utilise colorForme avec le bon type
          sx={{ 
            width: 24, 
            height: 24, 
            fontSize: '0.75rem',
            fontWeight: 600,
            mr: 0.5,
            // 🔧 FIX pour les "..." - styles directs
            '& .MuiChip-label': {
              overflow: 'visible !important',
              textOverflow: 'unset !important',
              whiteSpace: 'nowrap !important',
              padding: '0 4px !important'
            }
          }}
        />
      );
    });
  };

  if (leagueLoading || !currentLeague) {
    return (
      <Layout showBreadcrumb breadcrumbComponent={<BreadcrumbNavigation />}>
        <LoadingSpinner message="Chargement du championnat..." />
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout showBreadcrumb breadcrumbComponent={<BreadcrumbNavigation />}>
        <LoadingSpinner message="Chargement du classement..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout showBreadcrumb breadcrumbComponent={<BreadcrumbNavigation />}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <ErrorHandler error={error} onRetry={refetch} />
        </Container>
      </Layout>
    );
  }

  return (
    <Layout showBreadcrumb breadcrumbComponent={<BreadcrumbNavigation />}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* En-tête avec sélecteur de saison et bouton compact */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3} alignItems="flex-start">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmojiEvents sx={{ color: '#ffd700', fontSize: 32, mr: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Classement {currentLeague.name}
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                Classement général • Saison {getSeasonLabel(selectedSeason)}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <SeasonSelector
                selectedSeason={selectedSeason}
                onSeasonChange={setSelectedSeason}
                fullWidth
              />
            </Grid>

            {/* Bouton compact Matchs */}
            <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
              <CompactMatchesButton />
            </Grid>
          </Grid>
        </Box>

        {/* Card d'accès aux matchs - Prominente */}
        <Box sx={{ mb: 4 }}>
          <MatchesAccessCard />
        </Box>

        {/* Stats rapides */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                  {standings?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Équipes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                  {standings?.[0]?.points || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Points (Leader)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                  {standings?.[0]?.all.played || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Journées jouées
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                  {standings?.[0]?.goalsDiff || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Goal Average (Leader)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tableau du classement */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 700, width: 60 }}>Position</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Équipe</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, width: 60 }}>MJ</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, width: 60 }}>V</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, width: 60 }}>N</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, width: 60 }}>D</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, width: 80 }}>BP/BC</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, width: 60 }}>+/-</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, width: 60 }}>Pts</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, width: 120 }}>Forme</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {standings && standings.length > 0 ? standings.map((entry) => (
                    <TableRow 
                      key={entry.team.id}
                      sx={{ 
                        '&:hover': { bgcolor: 'grey.50' },
                        borderLeft: `4px solid ${getQualificationColor(entry.description)}`
                      }}
                    >
                      {/* Position */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, mr: 1 }}>
                            {entry.rank}
                          </Typography>
                          {getTrendIcon(entry.status)}
                        </Box>
                      </TableCell>

                      {/* Équipe */}
                      <TableCell>
                        <Link 
                          to={`/league/${currentLeague.id}/team/${entry.team.id}`}
                          style={{ textDecoration: 'none' }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              src={entry.team.logo}
                              alt={entry.team.name}
                              sx={{  mr: 2 }}
                            />
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                fontWeight: 600,
                                color: 'text.primary',
                                '&:hover': { color: 'primary.main' }
                              }}
                            >
                              {entry.team.name}
                            </Typography>
                          </Box>
                        </Link>
                      </TableCell>

                      {/* Matchs joués */}
                      <TableCell align="center">{entry.all.played}</TableCell>

                      {/* Victoires */}
                      <TableCell align="center" sx={{ color: 'success.main', fontWeight: 600 }}>
                        {entry.all.win}
                      </TableCell>

                      {/* Nuls */}
                      <TableCell align="center" sx={{ color: 'warning.main', fontWeight: 600 }}>
                        {entry.all.draw}
                      </TableCell>

                      {/* Défaites */}
                      <TableCell align="center" sx={{ color: 'error.main', fontWeight: 600 }}>
                        {entry.all.lose}
                      </TableCell>

                      {/* Buts pour/contre */}
                      <TableCell align="center">
                        <Typography variant="body2">
                          {entry.all.goals.for}/{entry.all.goals.against}
                        </Typography>
                      </TableCell>

                      {/* Différence de buts */}
                      <TableCell align="center">
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: entry.goalsDiff > 0 ? 'success.main' : 
                                   entry.goalsDiff < 0 ? 'error.main' : 'text.primary',
                            fontWeight: 600
                          }}
                        >
                          {entry.goalsDiff > 0 ? '+' : ''}{entry.goalsDiff}
                        </Typography>
                      </TableCell>

                      {/* Points */}
                      <TableCell align="center">
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {entry.points}
                        </Typography>
                      </TableCell>

                      {/* Forme récente */}
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          {parseForm(entry.form) || (
                            <Typography variant="caption" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={10} align="center">
                        <Typography variant="body1" color="text.secondary" sx={{ py: 4 }}>
                          Aucune donnée de classement disponible
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Légende */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Légende des qualifications
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: '#00387b', mr: 1, borderRadius: 0.5 }} />
                  <Typography variant="body2">Champions League</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: '#ff6b00', mr: 1, borderRadius: 0.5 }} />
                  <Typography variant="body2">Europa League</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: '#d32f2f', mr: 1, borderRadius: 0.5 }} />
                  <Typography variant="body2">Relégation</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Footer */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            ✨ Données en temps réel via API Football • Dernière mise à jour : {new Date().toLocaleString()}
          </Typography>
        </Box>
      </Container>
    </Layout>
  );
}