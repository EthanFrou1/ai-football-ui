import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LeagueProvider } from "./contexts/LeagueContext";
import LeagueSelector from "./pages/LeagueSelector";
import LeagueDashboard from "./pages/LeagueDashboard";
import Teams from "./pages/Teams";
import TeamDetails from "./pages/TeamDetails";
import Matches from "./pages/Matches";
import MatchDetails from "./pages/MatchDetails";
import Standings from "./pages/Standings";
// import Stats from "./pages/Stats";
import NotFound from "./pages/NotFound";
import Header from './components/UI/Header';

export default function AppRouter() {
    return (
        <BrowserRouter>
            <LeagueProvider>
                <Routes>
                    {/* Page d'accueil - Sélection championnat */}
                    <Route path="/" element={<LeagueSelector />} />
                    
                    {/* Dashboard du championnat */}
                    <Route path="/league/:leagueId" element={<LeagueDashboard />} />
                    
                    {/* Pages avec contexte de championnat */}
                    <Route path="/league/:leagueId/*" element={<LeagueLayout />} />
                    
                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </LeagueProvider>
        </BrowserRouter>
    );
}

// Layout avec header pour les pages de championnat
function LeagueLayout() {
    return (
        <>
            <Header />
            <Routes>
                {/* Classement */}
                <Route path="standings" element={<Standings />} />
                
                {/* Équipes */}
                <Route path="teams" element={<Teams />} />
                <Route path="team/:teamId" element={<TeamDetails />} />
                
                {/* Matchs */}
                <Route path="matches" element={<Matches />} />
                <Route path="match/:matchId" element={<MatchDetails />} />
                
                {/* Statistiques */}
                {/* <Route path="stats" element={<Stats />} /> */}
            </Routes>
        </>
    );
}