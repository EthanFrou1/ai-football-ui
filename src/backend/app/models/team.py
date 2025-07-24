from pydantic import BaseModel
from typing import Optional, List

class TeamBase(BaseModel):
    id: int
    name: str
    country: str
    logo: Optional[str] = None

class Team(TeamBase):
    founded: Optional[int] = None
    national: bool = False
    code: Optional[str] = None

class TeamDetail(Team):
    venue_id: Optional[int] = None
    venue_name: Optional[str] = None
    venue_address: Optional[str] = None
    venue_city: Optional[str] = None
    venue_capacity: Optional[int] = None
    venue_surface: Optional[str] = None
    venue_image: Optional[str] = None

class Player(BaseModel):
    id: int
    name: str
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    age: Optional[int] = None
    birth_date: Optional[str] = None
    birth_place: Optional[str] = None
    birth_country: Optional[str] = None
    nationality: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    injured: bool = False
    photo: Optional[str] = None
    
class PlayerStats(BaseModel):
    position: Optional[str] = None
    number: Optional[int] = None
    appearances: Optional[int] = None
    goals: Optional[int] = None
    assists: Optional[int] = None
    yellow_cards: Optional[int] = None
    red_cards: Optional[int] = None

class TeamWithPlayers(TeamDetail):
    players: List[Player] = []