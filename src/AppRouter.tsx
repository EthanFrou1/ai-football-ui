import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LeagueProvider } from "./contexts/LeagueContext";
import Home from "./pages/Home";
import LeagueSelector from "./pages/LeagueSelector";
import LeagueDashboard from "./pages/LeagueDashboard";
import Teams from "./pages/Teams";
import TeamDetails from "./pages/TeamDetails";
import Matches from "./pages/Matches";
import MatchDetails from "./pages/MatchDetails";
import Standings from "./pages/Standings";
import NotFound from "./pages/NotFound";
import Header from './components/UI/Header';
import { useParams } from 'react-router-dom';

// Composant pour rediriger vers standings
function LeagueRedirect() {
    const { leagueId } = useParams();
    return <Navigate to={`/league/${leagueId}/standings`} replace />;
}

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Page d'accueil de présentation */}
                <Route path="/" element={<Home />} />
                
                {/* Page de sélection des championnats */}
                <Route path="/leagues" element={<LeagueSelector />} />
                
                {/* Dashboard du championnat - redirige vers standings */}
                <Route path="/league/:leagueId" element={
                    <LeagueProvider>
                        <LeagueRedirect />
                    </LeagueProvider>
                } />
                
                {/* Pages avec header et contexte - ROUTES PLATES */}
                <Route path="/league/:leagueId/standings" element={
                    <LeagueProvider>
                        <Header />
                        <Standings />
                    </LeagueProvider>
                } />
                
                <Route path="/league/:leagueId/teams" element={
                    <LeagueProvider>
                        <Header />
                        <Teams />
                    </LeagueProvider>
                } />
                
                <Route path="/league/:leagueId/team/:teamId" element={
                    <LeagueProvider>
                        <Header />
                        <TeamDetails />
                    </LeagueProvider>
                } />
                
                <Route path="/league/:leagueId/matches" element={
                    <LeagueProvider>
                        <Header />
                        <Matches />
                    </LeagueProvider>
                } />
                
                <Route path="/league/:leagueId/match/:matchId" element={
                    <LeagueProvider>
                        <Header />
                        <MatchDetails />
                    </LeagueProvider>
                } />
                
                {/* 404 */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}