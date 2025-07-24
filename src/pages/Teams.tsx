import React from "react";
import { Card, CardContent, Typography, Avatar, Grid, Box } from "@mui/material";
import { Link } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { teamsService } from "../services/api";
import { TeamCardSkeleton, LoadingSpinner } from "../components/UI/Loading";
import ErrorHandler from "../components/UI/ErrorHandler";

export default function Teams() {
  // Utiliser l'API pour récupérer les équipes populaires
  const { data: teams, loading, error, refetch } = useApi(
    () => teamsService.getPopularTeams(),
    [], // Pas de dépendances
    true // Charger immédiatement
  );

  // Affichage du loading
  if (loading) {
    return (
      <div style={{ padding: "2rem" }}>
        <Typography variant="h4" gutterBottom>
          Équipes
        </Typography>
        
        <Grid container spacing={4}>
          {/* Afficher 6 skeletons pendant le chargement */}
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <TeamCardSkeleton />
            </Grid>
          ))}
        </Grid>
      </div>
    );
  }

  // Affichage des erreurs
  if (error) {
    return (
      <div style={{ padding: "2rem" }}>
        <Typography variant="h4" gutterBottom>
          Équipes
        </Typography>
        
        <ErrorHandler 
          error={error} 
          onRetry={refetch}
          showRetryButton={true}
        />
      </div>
    );
  }

  // Affichage quand pas de données
  if (!teams || teams.length === 0) {
    return (
      <div style={{ padding: "2rem" }}>
        <Typography variant="h4" gutterBottom>
          Équipes
        </Typography>
        
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center"
          py={6}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Aucune équipe trouvée
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Les équipes populaires ne sont pas disponibles pour le moment.
          </Typography>
        </Box>
      </div>
    );
  }

  // Affichage normal avec les données
  return (
    <div style={{ padding: "2rem" }}>
      <Typography variant="h4" gutterBottom>
        Équipes populaires
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Découvrez les équipes les plus suivies
      </Typography>

      <Grid container spacing={4}>
        {teams.map((team) => (
          <Grid item xs={12} sm={6} md={4} key={team.id}>
            <Link to={`/team/${team.id}`} style={{ textDecoration: "none" }}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
              >
                <CardContent sx={{ textAlign: "center", p: 3 }}>
                  {/* Logo de l'équipe */}
                  <Avatar
                    src={team.logo || `https://media.api-sports.io/football/teams/${team.id}.png`}
                    alt={team.name}
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      margin: "0 auto",
                      mb: 2,
                      border: '2px solid #f0f0f0'
                    }}
                  />
                  
                  {/* Nom de l'équipe */}
                  <Typography 
                    variant="h6" 
                    color="text.primary"
                    sx={{ 
                      mb: 1,
                      fontWeight: 600,
                      minHeight: '1.5em' // Pour l'alignement
                    }}
                  >
                    {team.name}
                  </Typography>
                  
                  {/* Pays */}
                  <Typography variant="body2" color="text.secondary">
                    {team.country}
                  </Typography>
                  
                  {/* Informations supplémentaires si disponibles */}
                  {team.founded && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Fondé en {team.founded}
                    </Typography>
                  )}
                  
                  {team.code && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        mt: 1, 
                        display: 'inline-block',
                        px: 1,
                        py: 0.5,
                        bgcolor: 'grey.100',
                        borderRadius: 1,
                        fontWeight: 600
                      }}
                    >
                      {team.code}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
      
      {/* Indicateur de données en temps réel */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          ✨ Données en temps réel via API Football
        </Typography>
      </Box>
    </div>
  );
}