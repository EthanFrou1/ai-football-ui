import httpx
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime, date
from app.config.settings import settings
from app.models.team import Team, TeamDetail, TeamWithPlayers, Player
from app.models.match import Match, MatchDetail, MatchPreview, MatchScore, MatchGoal, MatchStats, TeamBase

class FootballAPIService:
    def __init__(self):
        self.base_url = settings.football_api_base_url
        self.headers = {
            "X-RapidAPI-Key": settings.football_api_key,
            "X-RapidAPI-Host": "v3.football.api-sports.io"
        }
    
    async def _make_request(self, endpoint: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Faire une requête à l'API Football"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/{endpoint}",
                    headers=self.headers,
                    params=params or {},
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                print(f"Erreur API: {e}")
                return {"response": []}
    
    async def search_teams(self, query: str, country: str = None) -> List[Team]:
        """Rechercher des équipes par nom"""
        params = {"search": query}
        if country:
            params["country"] = country
            
        data = await self._make_request("teams", params)
        teams = []
        
        for item in data.get("response", []):
            team_data = item.get("team", {})
            teams.append(Team(
                id=team_data.get("id"),
                name=team_data.get("name"),
                country=team_data.get("country"),
                logo=team_data.get("logo"),
                founded=team_data.get("founded"),
                national=team_data.get("national", False),
                code=team_data.get("code")
            ))
        
        return teams
    
    async def get_team_by_id(self, team_id: int) -> Optional[TeamDetail]:
        """Récupérer les détails d'une équipe par ID"""
        data = await self._make_request("teams", {"id": team_id})
        
        if not data.get("response"):
            return None
            
        item = data["response"][0]
        team_data = item.get("team", {})
        venue_data = item.get("venue", {})
        
        return TeamDetail(
            id=team_data.get("id"),
            name=team_data.get("name"),
            country=team_data.get("country"),
            logo=team_data.get("logo"),
            founded=team_data.get("founded"),
            national=team_data.get("national", False),
            code=team_data.get("code"),
            venue_id=venue_data.get("id"),
            venue_name=venue_data.get("name"),
            venue_address=venue_data.get("address"),
            venue_city=venue_data.get("city"),
            venue_capacity=venue_data.get("capacity"),
            venue_surface=venue_data.get("surface"),
            venue_image=venue_data.get("image")
        )
    
    async def get_team_players(self, team_id: int, season: int = 2024) -> List[Player]:
        """Récupérer les joueurs d'une équipe"""
        data = await self._make_request("players", {
            "team": team_id,
            "season": season
        })
        
        players = []
        for item in data.get("response", []):
            player_data = item.get("player", {})
            players.append(Player(
                id=player_data.get("id"),
                name=player_data.get("name"),
                firstname=player_data.get("firstname"),
                lastname=player_data.get("lastname"),
                age=player_data.get("age"),
                birth_date=player_data.get("birth", {}).get("date"),
                birth_place=player_data.get("birth", {}).get("place"),
                birth_country=player_data.get("birth", {}).get("country"),
                nationality=player_data.get("nationality"),
                height=player_data.get("height"),
                weight=player_data.get("weight"),
                injured=player_data.get("injured", False),
                photo=player_data.get("photo")
            ))
        
        return players
    
    async def get_matches_by_date(self, match_date: date = None) -> List[MatchPreview]:
        """Récupérer les matchs par date"""
        if not match_date:
            match_date = date.today()
            
        data = await self._make_request("fixtures", {
            "date": match_date.strftime("%Y-%m-%d")
        })
        
        matches = []
        for item in data.get("response", []):
            fixture = item.get("fixture", {})
            teams = item.get("teams", {})
            goals = item.get("goals", {})
            
            matches.append(MatchPreview(
                id=fixture.get("id"),
                date=datetime.fromtimestamp(fixture.get("timestamp")),
                status=fixture.get("status", {}).get("long", ""),
                home_team=TeamBase(
                    id=teams.get("home", {}).get("id"),
                    name=teams.get("home", {}).get("name"),
                    country="",  # Pas toujours disponible dans cette endpoint
                    logo=teams.get("home", {}).get("logo")
                ),
                away_team=TeamBase(
                    id=teams.get("away", {}).get("id"),
                    name=teams.get("away", {}).get("name"),
                    country="",
                    logo=teams.get("away", {}).get("logo")
                ),
                score=MatchScore(
                    home=goals.get("home"),
                    away=goals.get("away")
                )
            ))
        
        return matches
    
    async def get_match_by_id(self, match_id: int) -> Optional[MatchDetail]:
        """Récupérer les détails d'un match par ID"""
        # Récupérer les infos de base du match
        fixture_data = await self._make_request("fixtures", {"id": match_id})
        
        if not fixture_data.get("response"):
            return None
            
        item = fixture_data["response"][0]
        fixture = item.get("fixture", {})
        league = item.get("league", {})
        teams = item.get("teams", {})
        goals = item.get("goals", {})
        
        # Récupérer les statistiques et événements en parallèle
        stats_task = self._make_request("fixtures/statistics", {"fixture": match_id})
        events_task = self._make_request("fixtures/events", {"fixture": match_id})
        
        stats_data, events_data = await asyncio.gather(stats_task, events_task)
        
        # Parser les buts
        match_goals = []
        for event in events_data.get("response", []):
            if event.get("type") == "Goal":
                match_goals.append(MatchGoal(
                    time_elapsed=event.get("time", {}).get("elapsed", 0),
                    team_id=event.get("team", {}).get("id"),
                    team_name=event.get("team", {}).get("name"),
                    player_id=event.get("player", {}).get("id"),
                    player_name=event.get("player", {}).get("name"),
                    assist_id=event.get("assist", {}).get("id") if event.get("assist") else None,
                    assist_name=event.get("assist", {}).get("name") if event.get("assist") else None,
                    type=event.get("detail", "Goal")
                ))
        
        # Parser les statistiques
        match_stats = []
        for team_stat in stats_data.get("response", []):
            team_info = team_stat.get("team", {})
            statistics = team_stat.get("statistics", [])
            
            # Convertir les stats en dict pour faciliter l'accès
            stats_dict = {stat.get("type"): stat.get("value") for stat in statistics}
            
            match_stats.append(MatchStats(
                team_id=team_info.get("id"),
                team_name=team_info.get("name"),
                shots_on_goal=self._safe_int(stats_dict.get("Shots on Goal")),
                shots_off_goal=self._safe_int(stats_dict.get("Shots off Goal")),
                total_shots=self._safe_int(stats_dict.get("Total Shots")),
                blocked_shots=self._safe_int(stats_dict.get("Blocked Shots")),
                shots_inside_box=self._safe_int(stats_dict.get("Shots insidebox")),
                shots_outside_box=self._safe_int(stats_dict.get("Shots outsidebox")),
                fouls=self._safe_int(stats_dict.get("Fouls")),
                corner_kicks=self._safe_int(stats_dict.get("Corner Kicks")),
                offsides=self._safe_int(stats_dict.get("Offsides")),
                ball_possession=stats_dict.get("Ball Possession"),
                yellow_cards=self._safe_int(stats_dict.get("Yellow Cards")),
                red_cards=self._safe_int(stats_dict.get("Red Cards")),
                goalkeeper_saves=self._safe_int(stats_dict.get("Goalkeeper Saves")),
                total_passes=self._safe_int(stats_dict.get("Total passes")),
                passes_accurate=self._safe_int(stats_dict.get("Passes accurate")),
                passes_percentage=stats_dict.get("Passes %")
            ))
        
        return MatchDetail(
            id=fixture.get("id"),
            referee=fixture.get("referee"),
            timezone=fixture.get("timezone", "UTC"),
            date=datetime.fromtimestamp(fixture.get("timestamp")),
            timestamp=fixture.get("timestamp"),
            status_long=fixture.get("status", {}).get("long", ""),
            status_short=fixture.get("status", {}).get("short", ""),
            status_elapsed=fixture.get("status", {}).get("elapsed"),
            league_id=league.get("id"),
            league_name=league.get("name"),
            league_country=league.get("country"),
            league_logo=league.get("logo"),
            league_flag=league.get("flag"),
            season=league.get("season"),
            round=league.get("round"),
            home_team=TeamBase(
                id=teams.get("home", {}).get("id"),
                name=teams.get("home", {}).get("name"),
                country="",
                logo=teams.get("home", {}).get("logo")
            ),
            away_team=TeamBase(
                id=teams.get("away", {}).get("id"),
                name=teams.get("away", {}).get("name"),
                country="",
                logo=teams.get("away", {}).get("logo")
            ),
            score=MatchScore(
                home=goals.get("home"),
                away=goals.get("away")
            ),
            venue_id=fixture.get("venue", {}).get("id"),
            venue_name=fixture.get("venue", {}).get("name"),
            venue_city=fixture.get("venue", {}).get("city"),
            goals=match_goals,
            statistics=match_stats
        )
    
    def _safe_int(self, value) -> Optional[int]:
        """Convertir une valeur en int de manière sécurisée"""
        if value is None:
            return None
        try:
            return int(value)
        except (ValueError, TypeError):
            return None

# Instance globale du service
football_service = FootballAPIService()