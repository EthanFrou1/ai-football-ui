import { useState } from "react";
import { Box, Typography, Card, CardContent, Divider, Tabs, Tab, Avatar, Grid } from "@mui/material";
import { Link } from "react-router-dom";

const allMatches = [
  {
    id: 1,
    homeTeam: { id: 85, name: "Paris Saint-Germain", score: 2 },
    awayTeam: { id: 80, name: "Olympique Lyonnais", score: 1 },
    date: "2025-07-27",
    time: "21:00",
    status: "Terminé"
  },
  {
    id: 2,
    homeTeam: { id: 541, name: "Real Madrid", score: 3 },
    awayTeam: { id: 529, name: "FC Barcelona", score: 1 },
    date: "2025-07-28",
    time: "20:00",
    status: "Terminé"
  },
  {
    id: 3,
    homeTeam: { id: 50, name: "Manchester City", score: null },
    awayTeam: { id: 42, name: "Arsenal", score: null },
    date: "2025-07-30",
    time: "17:30",
    status: "À venir"
  },
  {
    id: 4,
    homeTeam: { id: 85, name: "Paris Saint-Germain", score: null },
    awayTeam: { id: 84, name: "OGC Nice", score: null },
    date: "2025-08-02",
    time: "21:00",
    status: "À venir"
  }
];

export default function Matches() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (_: any, newValue: number) => {
    setCurrentTab(newValue);
  };

  const getFilteredMatches = () => {
    switch (currentTab) {
      case 0: // Tous
        return allMatches;
      case 1: // Terminés
        return allMatches.filter(match => match.status === "Terminé");
      case 2: // À venir
        return allMatches.filter(match => match.status === "À venir");
      default:
        return allMatches;
    }
  };

  const filteredMatches = getFilteredMatches();

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Matchs
      </Typography>

      {/* Onglets de filtrage */}
      <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label={`Tous (${allMatches.length})`} />
        <Tab label={`Terminés (${allMatches.filter(m => m.status === "Terminé").length})`} />
        <Tab label={`À venir (${allMatches.filter(m => m.status === "À venir").length})`} />
      </Tabs>

      <Divider sx={{ mb: 3 }} />

      {/* Liste des matchs */}
      {filteredMatches.map((match) => (
        <Card key={match.id} sx={{ mb: 2 }}>
          <Link to={`/match/${match.id}`} style={{ textDecoration: "none" }}>
            <CardContent>
              <Grid container alignItems="center" spacing={2}>
                {/* Équipe domicile */}
                <Grid item xs={4} sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                  <Typography variant="h6" sx={{ mr: 1 }}>
                    {match.homeTeam.name}
                  </Typography>
                  <Avatar
                    src={`https://media.api-sports.io/football/teams/${match.homeTeam.id}.png`}
                    alt={match.homeTeam.name}
                    sx={{ width: 40, height: 40 }}
                  />
                </Grid>
                
                {/* Score ou VS */}
                <Grid item xs={4} sx={{ textAlign: "center" }}>
                  {match.status === "Terminé" ? (
                    <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                      {match.homeTeam.score} - {match.awayTeam.score}
                    </Typography>
                  ) : (
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      VS
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {match.date} - {match.time}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      px: 1, 
                      py: 0.5, 
                      borderRadius: 1, 
                      backgroundColor: match.status === "Terminé" ? "success.light" : "primary.light",
                      color: "white"
                    }}
                  >
                    {match.status}
                  </Typography>
                </Grid>
                
                {/* Équipe extérieure */}
                <Grid item xs={4} sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar
                    src={`https://media.api-sports.io/football/teams/${match.awayTeam.id}.png`}
                    alt={match.awayTeam.name}
                    sx={{ width: 40, height: 40, mr: 1 }}
                  />
                  <Typography variant="h6">
                    {match.awayTeam.name}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Link>
        </Card>
      ))}

      {filteredMatches.length === 0 && (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
          Aucun match trouvé pour cette catégorie
        </Typography>
      )}
    </Box>
  );
}