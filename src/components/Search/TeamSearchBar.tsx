import { useState } from "react";
import { TextField, Box, Typography, Card, CardContent, Avatar } from "@mui/material";
import { Link } from "react-router-dom";

const mockTeams = [
  { id: 85, name: "Paris Saint-Germain", country: "France" },
  { id: 79, name: "Olympique de Marseille", country: "France" },
  { id: 80, name: "Olympique Lyonnais", country: "France" },
  { id: 84, name: "OGC Nice", country: "France" },
  { id: 541, name: "Real Madrid", country: "Spain" },
  { id: 529, name: "FC Barcelona", country: "Spain" },
  { id: 50, name: "Manchester City", country: "England" },
  { id: 42, name: "Arsenal", country: "England" },
];

const TeamSearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTeams, setFilteredTeams] = useState<typeof mockTeams>([]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.length > 1) {
      const filtered = mockTeams.filter(team =>
        team.name.toLowerCase().includes(value.toLowerCase()) ||
        team.country.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredTeams(filtered);
    } else {
      setFilteredTeams([]);
    }
  };

  return (
    <Box mb={6}>
      <Typography variant="h5" mb={2} fontWeight="bold">
        Recherche d'équipe
      </Typography>
      <TextField
        fullWidth
        placeholder="Entrez un nom d'équipe..."
        variant="outlined"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        sx={{ mb: 2 }}
      />
      
      {/* Résultats de recherche */}
      {filteredTeams.length > 0 && (
        <Box sx={{ maxHeight: 300, overflow: "auto" }}>
          {filteredTeams.map((team) => (
            <Card key={team.id} sx={{ mb: 1 }}>
              <CardContent sx={{ py: 1 }}>
                <Link 
                  to={`/team/${team.id}`} 
                  style={{ textDecoration: "none", display: "flex", alignItems: "center" }}
                >
                  <Avatar
                    src={`https://media.api-sports.io/football/teams/${team.id}.png`}
                    alt={team.name}
                    sx={{ width: 32, height: 32, mr: 2 }}
                  />
                  <Box>
                    <Typography variant="body1" color="text.primary">
                      {team.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {team.country}
                    </Typography>
                  </Box>
                </Link>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
      
      {searchTerm.length > 1 && filteredTeams.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Aucune équipe trouvée pour "{searchTerm}"
        </Typography>
      )}
    </Box>
  );
};

export default TeamSearchBar;