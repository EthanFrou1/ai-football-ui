// src/components/Standings/LeagueStandings.tsx
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const LeagueStandings = () => {
    const standings = [
        { team: "Paris", points: 45 },
        { team: "Marseille", points: 42 },
    ];

    return (
        <Box mb={4}>
            <Typography variant="h6" mb={2}>Classement</Typography>
            {standings.map((entry, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                    <CardContent>
                        <Typography>{entry.team}</Typography>
                        <Typography variant="subtitle2" color="text.secondary">{entry.points} points</Typography>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
};

export default LeagueStandings;
