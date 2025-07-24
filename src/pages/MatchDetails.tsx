import { useParams } from "react-router-dom";
import { Typography, Box, Card, CardContent, Grid, Avatar, Divider, Chip } from "@mui/material";

// Mock data pour les matchs
const mockMatchData: { [key: string]: any } = {
  1: {
    homeTeam: { id: 85, name: "Paris Saint-Germain", score: 2 },
    awayTeam: { id: 79, name: "Olympique Lyonnais", score: 1 },
    date: "2025-07-27",
    time: "21:00",
    stadium: "Parc des Princes",
    status: "Terminé",
    goals: [
      { player: "Mbappé", team: "PSG", minute: 23 },
      { player: "Lacazette", team: "OL", minute: 45 },
      { player: "Neymar", team: "PSG", minute: 78 }
    ],
    stats: {
      possession: { home: 62, away: 38 },
      shots: { home: 12, away: 8 },
      corners: { home: 7, away: 4 }
    }
  },
  2: {
    homeTeam: { id: 541, name: "Real Madrid", score: 3 },
    awayTeam: { id: 529, name: "FC Barcelona", score: 1 },
    date: "2025-07-28",
    time: "20:00", 
    stadium: "Santiago Bernabéu",
    status: "Terminé",
    goals: [
      { player: "Benzema", team: "Real", minute: 12 },
      { player: "Pedri", team: "Barça", minute: 35 },
      { player: "Vinícius", team: "Real", minute: 56 },
      { player: "Modrić", team: "Real", minute: 82 }
    ],
    stats: {
      possession: { home: 55, away: 45 },
      shots: { home: 15, away: 11 },
      corners: { home: 6, away: 8 }
    }
  }
};

export default function MatchDetails() {
  const { id } = useParams<{ id: string }>();
  const match = mockMatchData[id || ""] || {
    homeTeam: { id: 0, name: "Équipe A", score: 0 },
    awayTeam: { id: 0, name: "Équipe B", score: 0 },
    date: "2025-07-24",
    time: "20:00",
    stadium: "Stade inconnu",
    status: "À venir",
    goals: [],
    stats: { possession: { home: 50, away: 50 }, shots: { home: 0, away: 0 }, corners: { home: 0, away: 0 } }
  };

  return (
    <Box sx={{ padding: "2rem" }}>
      {/* En-tête du match */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Chip 
              label={match.status} 
              color={match.status === "Terminé" ? "success" : "primary"} 
              sx={{ mb: 2 }} 
            />
            <Typography variant="h6" color="text.secondary">
              {match.date} - {match.time} | {match.stadium}
            </Typography>
          </Box>
          
          <Grid container alignItems="center" spacing={2}>
            {/* Équipe domicile */}
            <Grid item xs={4} sx={{ textAlign: "center" }}>
              <Avatar
                src={`https://media.api-sports.io/football/teams/${match.homeTeam.id}.png`}
                alt={match.homeTeam.name}
                sx={{ width: 80, height: 80, margin: "0 auto", mb: 1 }}
              />
              <Typography variant="h6">{match.homeTeam.name}</Typography>
            </Grid>
            
            {/* Score */}
            <Grid item xs={4} sx={{ textAlign: "center" }}>
              <Typography variant="h2" sx={{ fontWeight: "bold" }}>
                {match.homeTeam.score} - {match.awayTeam.score}
              </Typography>
            </Grid>
            
            {/* Équipe extérieure */}
            <Grid item xs={4} sx={{ textAlign: "center" }}>
              <Avatar
                src={`https://media.api-sports.io/football/teams/${match.awayTeam.id}.png`}
                alt={match.awayTeam.name}
                sx={{ width: 80, height: 80, margin: "0 auto", mb: 1 }}
              />
              <Typography variant="h6">{match.awayTeam.name}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Buts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Buts du match
              </Typography>
              {match.goals.length > 0 ? (
                match.goals.map((goal: any, index: number) => (
                  <Box key={index} sx={{ mb: 2, p: 1, border: "1px solid #e0e0e0", borderRadius: 1 }}>
                    <Typography variant="body1">
                      <strong>{goal.player}</strong> ({goal.team})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {goal.minute}' minute
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Aucun but marqué
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Statistiques */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Statistiques
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Possession: {match.stats.possession.home}% - {match.stats.possession.away}%
                </Typography>
                <Box sx={{ display: "flex", height: 8, backgroundColor: "#e0e0e0", borderRadius: 1 }}>
                  <Box 
                    sx={{ 
                      width: `${match.stats.possession.home}%`, 
                      backgroundColor: "primary.main" 
                    }} 
                  />
                  <Box 
                    sx={{ 
                      width: `${match.stats.possession.away}%`, 
                      backgroundColor: "secondary.main" 
                    }} 
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Tirs:</strong> {match.stats.shots.home} - {match.stats.shots.away}
              </Typography>
              
              <Typography variant="body2">
                <strong>Corners:</strong> {match.stats.corners.home} - {match.stats.corners.away}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}