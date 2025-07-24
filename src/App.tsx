import { Container, Typography } from "@mui/material";
import TeamSearch from "./components/Search/TeamSearch";

function App() {
    return (
        <Container maxWidth="sm" sx={{ mt: 5 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                ⚽ Projet IA + Football
            </Typography>
            <TeamSearch />
        </Container>
    );
}

export default App;
