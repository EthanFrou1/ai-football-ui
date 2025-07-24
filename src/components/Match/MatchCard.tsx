import { Card, CardContent, Typography } from "@mui/material";

interface MatchCardProps {
  teamA: string;
  teamB: string;
  date: string;
}

export default function MatchCard({ teamA, teamB, date }: MatchCardProps) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">{teamA} vs {teamB}</Typography>
        <Typography variant="body2" color="text.secondary">{date}</Typography>
      </CardContent>
    </Card>
  );
}
