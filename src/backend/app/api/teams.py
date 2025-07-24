from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.team import Team, TeamDetail, TeamWithPlayers
from app.services.football_api import football_service

router = APIRouter(prefix="/teams", tags=["teams"])

@router.get("/search", response_model=List[Team])
async def search_teams(
    q: str = Query(..., description="Nom de l'équipe à rechercher"),
    country: Optional[str] = Query(None, description="Filtrer par pays")
):
    """
    Rechercher des équipes par nom
    """
    try:
        teams = await football_service.search_teams(q, country)
        return teams
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la recherche: {str(e)}")

@router.get("/{team_id}", response_model=TeamDetail)
async def get_team(team_id: int):
    """
    Récupérer les détails d'une équipe par son ID
    """
    try:
        team = await football_service.get_team_by_id(team_id)
        if not team:
            raise HTTPException(status_code=404, detail="Équipe non trouvée")
        return team
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")

@router.get("/{team_id}/players", response_model=TeamWithPlayers)
async def get_team_with_players(
    team_id: int,
    season: int = Query(2024, description="Saison")
):
    """
    Récupérer une équipe avec ses joueurs
    """
    try:
        # Récupérer les infos de l'équipe et les joueurs en parallèle
        import asyncio
        team_task = football_service.get_team_by_id(team_id)
        players_task = football_service.get_team_players(team_id, season)
        
        team, players = await asyncio.gather(team_task, players_task)
        
        if not team:
            raise HTTPException(status_code=404, detail="Équipe non trouvée")
        
        # Convertir TeamDetail en TeamWithPlayers
        team_with_players = TeamWithPlayers(
            **team.dict(),
            players=players
        )
        
        return team_with_players
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")

@router.get("/", response_model=List[Team])
async def get_popular_teams():
    """
    Récupérer une liste d'équipes populaires (équipes françaises par défaut)
    """
    try:
        # Liste des équipes populaires françaises
        popular_team_ids = [85, 79, 80, 84, 81, 77]  # PSG, OM, OL, Nice, Monaco, Lille
        teams = []
        
        import asyncio
        tasks = [football_service.get_team_by_id(team_id) for team_id in popular_team_ids]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for result in results:
            if isinstance(result, TeamDetail):
                teams.append(Team(
                    id=result.id,
                    name=result.name,
                    country=result.country,
                    logo=result.logo,
                    founded=result.founded,
                    national=result.national,
                    code=result.code
                ))
        
        return teams
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")