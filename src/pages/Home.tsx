import UpcomingMatches from "../components/Matches/UpcomingMatches";
import RecentMatches from "../components/Matches/RecentMatches";
import LeagueStandings from "../components/Standings/LeagueStandings";
import TeamSearchBar from "../components/Search/TeamSearchBar";
import TabsContainer from "../components/UI/TabsContainer";

export default function Home() {
    return (
        <div style={{ padding: "2rem" }}>
            <TeamSearchBar />

            <TabsContainer
                tabs={[
                    { label: "Matchs à venir", content: <UpcomingMatches /> },
                    { label: "Matchs récents", content: <RecentMatches /> },
                    { label: "Classement", content: <LeagueStandings /> },
                ]}
            />
        </div>
    );
}
