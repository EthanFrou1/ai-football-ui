// src/components/Matches/RecentMatches.tsx
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const RecentMatches = () => {
    const results = [
        { teamA: "Paris", teamB: "Marseille", score: "2 - 1" },
        { teamA: "Lyon", teamB: "Nice", score: "1 - 3" },
    ];

    return (
        <Box mb={4}>
            <Typography variant="h6" mb={2}>Matchs récents</Typography>
            {results.map((match, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                    <CardContent>
                        <Typography>{match.teamA} vs {match.teamB}</Typography>
                        <Typography variant="subtitle2" color="text.secondary">{match.score}</Typography>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
};

export default RecentMatches;
