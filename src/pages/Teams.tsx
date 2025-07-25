// src/pages/Teams.tsx
import React, { useState } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Paper,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import { ArrowForward, Groups } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useLeague } from '../contexts/LeagueContext';
import { useSeason } from '../hooks/useSeason';
import { useTeams } from '../hooks/useTeams';
import { LoadingSpinner } from '../components/UI/Loading';
import ErrorHandler from '../components/UI/ErrorHandler';
import TeamsHeader, { type ViewMode } from '../components/Teams/TeamsHeader';
import TeamCard from '../components/Teams/TeamsCard';
import type { TeamWithStandingData } from '../services/api/teamsService';

export default function Teams() {
  const { currentLeague, isLoading: leagueLoading } = useLeague();
  const { selectedSeason } = useSeason(2023);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Hook principal pour les équipes
  const {
    teams,
    filteredTeams,
    total,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    refetch,
    clearSearch
  } = useTeams({
    leagueId: currentLeague?.id || 0,
    season: selectedSeason,
    initialSort: 'rank-asc'
  });

  // Fonction pour parser la forme récente (pour la vue liste)
  const parseForm = (form?: string) => {
    if (!form) return null;
    
    return form.replace(/\./g, '').split('').slice(-5).map((result, index) => {
      let color: 'success' | 'error' | 'warning' | 'default' = 'default';
      let label = result;
      
      switch (result) {
        case 'W':
          color = 'success';
          label = 'V';
          break;
        case 'L':
          color = 'error';
          label = 'D';
          break;
        case 'D':
          color = 'warning';
          label = 'N';
          break;
      }
      
      return (
        <Chip
          key={index}
          label={label}
          size="small"
          color={color}
          sx={{ 
            width: 20, 
            height: 20, 
            fontSize: '0.7rem',
            fontWeight: 600,
            mr: 0.3,
            textOverflow: 'clip'
          }}
        />
      );
    });
  };

  // Couleurs selon la position (pour la vue liste)
  const getRankColor = (rank?: number) => {
    if (!rank) return 'text.secondary';
    if (rank <= 4) return 'success.main'; // Champions League
    if (rank <= 6) return 'warning.main'; // Europa League
    if (rank >= 18) return 'error.main'; // Relégation
    return 'text.primary';
  };

  // Chargements
  if (leagueLoading || !currentLeague) {
    return <LoadingSpinner message="Chargement du championnat..." />;
  }

  if (loading) {
    return <LoadingSpinner message="Chargement des équipes..." />;
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <ErrorHandler error={error} onRetry={refetch} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header avec recherche et filtres */}
      <TeamsHeader
        totalTeams={total}
        filteredCount={filteredTeams.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSearch={clearSearch}
        sortOption={sortOption}
        onSortChange={setSortOption}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        loading={loading}
      />

      {/* Contenu principal */}
      {filteredTeams.length === 0 ? (
        // État vide
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Groups sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchQuery ? 'Aucune équipe trouvée' : 'Aucune équipe disponible'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchQuery 
                ? `Essayez de modifier votre recherche "${searchQuery}"`
                : 'Les données des équipes ne sont pas encore disponibles'
              }
            </Typography>
            {searchQuery && (
              <Box sx={{ mt: 2 }}>
                <Typography 
                  component="span" 
                  color="primary.main" 
                  sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={clearSearch}
                >
                  Effacer la recherche
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        // Vue en grille
        <Grid container spacing={3}>
          {filteredTeams.map((team) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={team.id}>
              <TeamCard 
                team={team} 
                leagueId={currentLeague.id}
                showRanking={true}
                compact={false}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        // Vue en liste
        <Card>
          <CardContent sx={{ p: 0 }}>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 700, width: 60 }}>Pos</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Équipe</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, width: 80 }}>Pts</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, width: 60 }}>+/-</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, width: 120 }}>Forme</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, width: 60 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTeams.map((team) => (
                    <TableRow 
                      key={team.id}
                      sx={{ 
                        '&:hover': { bgcolor: 'grey.50' },
                        cursor: 'pointer'
                      }}
                      component={Link}
                      to={`/league/${currentLeague.id}/team/${team.id}`}
                      style={{ textDecoration: 'none' }}
                    >
                      {/* Position */}
                      <TableCell>
                        <Chip
                          label={team.rank || '-'}
                          size="small"
                          sx={{
                            bgcolor: getRankColor(team.rank),
                            color: 'white',
                            fontWeight: 700,
                            minWidth: 32
                          }}
                        />
                      </TableCell>

                      {/* Équipe */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            src={team.logo}
                            alt={team.name}
                            sx={{ width: 32, height: 32, mr: 2, borderRadius: 1 }}
                          />
                          <Box>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                fontWeight: 600,
                                color: 'text.primary'
                              }}
                            >
                              {team.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {team.country}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Points */}
                      <TableCell align="center">
                        <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {team.points || '-'}
                        </Typography>
                      </TableCell>

                      {/* Différence de buts */}
                      <TableCell align="center">
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: team.goalsDiff && team.goalsDiff > 0 ? 'success.main' : 
                                   team.goalsDiff && team.goalsDiff < 0 ? 'error.main' : 'text.primary',
                            fontWeight: 600
                          }}
                        >
                          {team.goalsDiff !== undefined 
                            ? `${team.goalsDiff > 0 ? '+' : ''}${team.goalsDiff}`
                            : '-'
                          }
                        </Typography>
                      </TableCell>

                      {/* Forme récente */}
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          {parseForm(team.form) || (
                            <Typography variant="caption" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </Box>
                      </TableCell>

                      {/* Action */}
                      <TableCell align="center">
                        <IconButton size="small" color="primary">
                          <ArrowForward />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Footer stats */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          ✨ {filteredTeams.length} équipe{filteredTeams.length > 1 ? 's' : ''} affichée{filteredTeams.length > 1 ? 's' : ''} 
          {searchQuery && ` • Recherche: "${searchQuery}"`}
          {` • Tri: ${sortOption}`}
          {` • ${currentLeague.name} ${selectedSeason}-${selectedSeason + 1}`}
        </Typography>
      </Box>
    </Container>
  );
}