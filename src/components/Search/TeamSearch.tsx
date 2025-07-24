import { useState } from "react";
import { TextField, Typography, Box, Button } from "@mui/material";

const TeamSearch = () => {
    const [teamName, setTeamName] = useState("");

    const handleSearch = () => {
        console.log("Recherche :", teamName);
        // On branchera l'API ici plus tard
    };

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
                Rechercher une équipe :
            </Typography>
            <TextField
                label="Nom du club"
                variant="outlined"
                fullWidth
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
            />
            <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleSearch}>
                Rechercher
            </Button>
        </Box>
    );
};

export default TeamSearch;
