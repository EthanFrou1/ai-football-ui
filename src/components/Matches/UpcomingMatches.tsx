import { Card, CardContent, Typography, Box, Avatar, Grid } from "@mui/material";
import { Link } from "react-router-dom";

const UpcomingMatches = () => {
  const upcomingMatches = [
    {
      id: 3,
      homeTeam: { id: 50, name: "Manchester City" },
      awayTeam: { id: 42, name: "Arsenal" },
      date: "2025-07-30",
      time: "17:30",
      stadium: "Etihad Stadium"
    },
    {
      id: 4,
      homeTeam: { id: 85, name: "Paris Saint-Germain" },
      awayTeam: { id: 84, name: "OGC Nice" },
      date: "2025-08-02",
      time: "21:00",
      stadium: "Parc des Princes"
    },
    {
      id: 5,
      homeTeam: { id: 541, name: "Real Madrid" },
      awayTeam: { id: 79, name: "Olympique de Marseille" },
      date: "2025-08-05",
      time: "20:00",
      stadium: "Santiago Bernabéu"
    }
  ];

  return (
    <Box mb={4}>
      <Typography variant="h6" mb={2}>Matchs à venir</Typography>
      {upcomingMatches.map((match) => (
        <Card key={match.id} sx={{ mb: 2, cursor: "pointer" }}>
          <Link to={`/match/${match.id}`} style={{ textDecoration: "none" }}>
            <CardContent>
              <Grid container alignItems="center" spacing={2}>
                {/* Équipe domicile */}
                <Grid item xs={4} sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                  <Typography variant="body1" sx={{ mr: 1 }}>
                    {match.homeTeam.name}
                  </Typography>
                  <Avatar
                    src={`https://media.api-sports.io/football/teams/${match.homeTeam.id}.png`}
                    alt={match.homeTeam.name}
                    sx={{ width: 32, height: 32 }}
                  />
                </Grid>
                
                {/* VS et infos */}
                <Grid item xs={4} sx={{ textAlign: "center" }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    VS
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {match.date} - {match.time}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {match.stadium}
                  </Typography>
                </Grid>
                
                {/* Équipe extérieure */}
                <Grid item xs={4} sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar
                    src={`https://media.api-sports.io/football/teams/${match.awayTeam.id}.png`}
                    alt={match.awayTeam.name}
                    sx={{ width: 32, height: 32, mr: 1 }}
                  />
                  <Typography variant="body1">
                    {match.awayTeam.name}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Link>
        </Card>
      ))}
    </Box>
  );
};

export default UpcomingMatches;