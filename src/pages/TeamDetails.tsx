import React from "react";
import { useParams } from "react-router-dom";
import { Typography, Box, Avatar, Card, CardContent, Grid, Chip, Divider } from "@mui/material";
import { LocationOn, Stadium, Person, CalendarToday } from "@mui/icons-material";
import { useApi } from "../hooks/useApi";
import { teamsService } from "../services/api";
import { TeamDetailsSkeleton } from "../components/UI/Loading";
import ErrorHandler from "../components/UI/ErrorHandler";
import Layout from "../components/Layout/Layout";
import BreadcrumbNavigation from "../components/UI/BreadcrumbNavigation";

export default function TeamDetails() {
  const { teamId } = useParams<{ teamId: string }>(); // ← Change ça
  const teamIdNumber = parseInt(teamId || "0");

  // Récupérer les détails de l'équipe avec les joueurs
  const { data: team, loading, error, refetch } = useApi(
    () => teamsService.getTeamWithPlayers(teamIdNumber),
    [teamIdNumber], // Se recharge si l'ID change
    !!teamIdNumber && teamIdNumber > 0 // ← Ajoute cette condition
  );

  // Affichage du loading
  if (loading) {
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
      <Box sx={{ padding: "2rem" }}>
        {/* En-tête de l'équipe */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ textAlign: "center", p: 4 }}>
            <Avatar
              src={team.logo || `https://media.api-sports.io/football/teams/${team.id}.png`}
              alt="team logo"
              sx={{ 
                width: 120, 
                height: 120, 
                margin: "0 auto", 
                mb: 2,
                border: '3px solid #f0f0f0'
              }}
            />
            
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 600 }}>
              {team.name}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
              <Chip 
                label={team.country} 
                color="primary" 
                icon={<LocationOn />}
              />
              {team.code && (
                <Chip 
                  label={team.code} 
                  variant="outlined"
                />
              )}
              {team.national && (
                <Chip 
                  label="Équipe nationale" 
                  color="secondary"
                  variant="outlined"
                />
              )}
            </Box>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* Informations générales */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person /> Informations générales
                </Typography>
                
                <Divider sx={{ mb: 2 }} />
                
                {team.founded && (
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday fontSize="small" color="action" />
                    <Typography variant="body1">
                      <strong>Fondé en :</strong> {team.founded}
                    </Typography>
                  </Box>
                )}
                
                {team.venue_name && (
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Stadium fontSize="small" color="action" />
                    <Box>
                      <Typography variant="body1">
                        <strong>Stade :</strong> {team.venue_name}
                      </Typography>
                      {team.venue_city && (
                        <Typography variant="body2" color="text.secondary">
                          {team.venue_city}
                        </Typography>
                      )}
                      {team.venue_capacity && (
                        <Typography variant="body2" color="text.secondary">
                          Capacité : {team.venue_capacity.toLocaleString()} places
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
                
                {team.venue_surface && (
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Surface :</strong> {team.venue_surface}
                  </Typography>
                )}
                
                {team.venue_address && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Adresse :</strong> {team.venue_address}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Joueurs */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Effectif ({team.players?.length || 0} joueurs)
                </Typography>
                
                <Divider sx={{ mb: 2 }} />
                
                {team.players && team.players.length > 0 ? (
                  <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                    {team.players.slice(0, 10).map((player) => (
                      <Box 
                        key={player.id} 
                        sx={{ 
                          mb: 2, 
                          p: 2, 
                          border: "1px solid #e0e0e0", 
                          borderRadius: 2,
                          '&:hover': {
                            bgcolor: 'grey.50'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {player.photo && (
                            <Avatar
                              src={player.photo}
                              alt={player.name}
                              sx={{ width: 40, height: 40 }}
                            />
                          )}
                          
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {player.name}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                              {player.age && (
                                <Typography variant="body2" color="text.secondary">
                                  {player.age} ans
                                </Typography>
                              )}
                              {player.nationality && (
                                <Typography variant="body2" color="text.secondary">
                                  {player.nationality}
                                </Typography>
                              )}
                            </Box>
                            
                            {(player.height || player.weight) && (
                              <Typography variant="caption" color="text.secondary">
                                {player.height && `${player.height}`}
                                {player.height && player.weight && ' • '}
                                {player.weight && `${player.weight}`}
                              </Typography>
                            )}
                            
                            {player.injured && (
                              <Chip 
                                label="Blessé" 
                                color="error" 
                                size="small" 
                                sx={{ mt: 0.5 }}
                              />
                            )}
                          </Box>
                        </Box>
                      </Box>
                    ))}
                    
                    {team.players.length > 10 && (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                        ... et {team.players.length - 10} autres joueurs
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Aucune information sur les joueurs disponible.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Image du stade si disponible */}
        {team.venue_image && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Stade
              </Typography>
              <Box
                component="img"
                src={team.venue_image}
                alt={team.venue_name}
                sx={{
                  width: '100%',
                  height: 300,
                  objectFit: 'cover',
                  borderRadius: 1
                }}
              />
            </CardContent>
          </Card>
        )}
        
        {/* Indicateur de données en temps réel */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            ✨ Données en temps réel via API Football • Dernière mise à jour : {new Date().toLocaleString()}
          </Typography>
        </Box>
      </Box>
    </Layout>
  );
}