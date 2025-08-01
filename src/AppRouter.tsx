// src/AppRouter.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LeagueProvider } from "./contexts/LeagueContext";
import Home from "./pages/Home";
import LeagueSelector from "./pages/LeagueSelector";
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
                
                {/* Routes globales (ancien système) */}
                <Route path="/matches" element={
                    <>
                        <Header />
                        <Matches />
                    </>
                } />
                
                <Route path="/teams" element={
                    <>
                        <Teams />
                    </>
                } />
                
                <Route path="/teams/:id" element={
                    <>
                        <TeamDetails />
                    </>
                } />
                
                <Route path="/match/:id" element={
                    <>
                        <Header />
                        <MatchDetails />
                    </>
                } />
                
                {/* Dashboard du championnat - redirige vers standings */}
                <Route path="/league/:leagueId" element={
                    <LeagueProvider>
                        <LeagueRedirect />
                    </LeagueProvider>
                } />
                
                {/* Pages avec header et contexte - ROUTES PLATES */}
                <Route path="/league/:leagueId/standings" element={
                    <LeagueProvider>
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
                        <TeamDetails />
                    </LeagueProvider>
                } />
                
                <Route path="/league/:leagueId/matches" element={
                    <LeagueProvider>
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