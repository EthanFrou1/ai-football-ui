from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from .team import TeamBase

class MatchScore(BaseModel):
    home: Optional[int] = None
    away: Optional[int] = None

class MatchGoal(BaseModel):
    time_elapsed: int
    team_id: int
    team_name: str
    player_id: int
    player_name: str
    assist_id: Optional[int] = None
    assist_name: Optional[str] = None
    type: str  # "Goal", "Penalty", etc.

class MatchStats(BaseModel):
    team_id: int
    team_name: str
    shots_on_goal: Optional[int] = None
    shots_off_goal: Optional[int] = None  
    total_shots: Optional[int] = None
    blocked_shots: Optional[int] = None
    shots_inside_box: Optional[int] = None
    shots_outside_box: Optional[int] = None
    fouls: Optional[int] = None
    corner_kicks: Optional[int] = None
    offsides: Optional[int] = None
    ball_possession: Optional[str] = None
    yellow_cards: Optional[int] = None
    red_cards: Optional[int] = None
    goalkeeper_saves: Optional[int] = None
    total_passes: Optional[int] = None
    passes_accurate: Optional[int] = None
    passes_percentage: Optional[str] = None

class MatchBase(BaseModel):
    id: int
    referee: Optional[str] = None
    timezone: str = "UTC"
    date: datetime
    timestamp: int
    status_long: str
    status_short: str
    status_elapsed: Optional[int] = None

class Match(MatchBase):
    league_id: int
    league_name: str
    league_country: str
    league_logo: Optional[str] = None
    league_flag: Optional[str] = None
    season: int
    round: str
    
    home_team: TeamBase
    away_team: TeamBase
    
    score: MatchScore
    
class MatchDetail(Match):
    venue_id: Optional[int] = None
    venue_name: Optional[str] = None
    venue_city: Optional[str] = None
    
    goals: List[MatchGoal] = []
    statistics: List[MatchStats] = []
    
class MatchPreview(BaseModel):
    id: int
    date: datetime
    status: str
    home_team: TeamBase
    away_team: TeamBase
    score: MatchScore