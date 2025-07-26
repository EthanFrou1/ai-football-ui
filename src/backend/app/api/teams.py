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

# À ajouter dans backend/app/api/teams.py

@router.get("/{team_id}/players")
async def get_team_with_players(team_id: int, season: int = Query(2023, description="Saison")):
    """
    Récupérer une équipe avec ses détails et joueurs
    """
    try:
        # Appel à l'API Football pour les détails de l'équipe
        team_data = await football_service._make_request("teams", {
            "id": team_id
        })
        
        if not team_data.get("response") or len(team_data["response"]) == 0:
            raise HTTPException(status_code=404, detail="Équipe non trouvée")
        
        team_info = team_data["response"][0]
        team = team_info["team"]
        venue = team_info["venue"]
        
        # Appel pour les joueurs (optionnel)
        players_data = []
        try:
            players_response = await football_service._make_request("players", {
                "team": team_id,
                "season": season
            })
            
            if players_response.get("response"):
                players_data = players_response["response"][:15]  # Limiter à 15 joueurs
        except Exception as e:
            print(f"Erreur lors de la récupération des joueurs: {e}")
            # Continue sans les joueurs
        
        # Construire la réponse
        result = {
            "id": team["id"],
            "name": team["name"],
            "logo": team["logo"],
            "country": team["country"],
            "code": team["code"],
            "founded": team["founded"],
            "national": team["national"],
        }
        
        # Ajouter les infos du stade si disponibles
        if venue:
            result.update({
                "venue_name": venue.get("name"),
                "venue_city": venue.get("city"),
                "venue_capacity": venue.get("capacity"),
                "venue_surface": venue.get("surface"),
                "venue_address": venue.get("address"),
                "venue_image": venue.get("image")
            })
        
        # Ajouter les joueurs si disponibles
        if players_data:
            result["players"] = []
            for player_item in players_data:
                player = player_item["player"]
                statistics = player_item.get("statistics", [{}])[0] if player_item.get("statistics") else {}
                
                result["players"].append({
                    "id": player["id"],
                    "name": player["name"],
                    "age": player.get("age"),
                    "nationality": player.get("nationality"),
                    "height": player.get("height"),
                    "weight": player.get("weight"),
                    "photo": player.get("photo"),
                    "injured": player.get("injured", False),
                    "position": statistics.get("games", {}).get("position") if statistics else None
                })
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erreur API team details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")

# NOUVEAU: Endpoint pour récupérer toutes les équipes d'un championnat
@router.get("/")
async def get_teams_by_league(
    league: int = Query(..., description="ID de la ligue"),
    season: int = Query(..., description="Année de la saison")
):
    """
    Récupère toutes les équipes d'un championnat avec leurs données enrichies du classement
    
    Paramètres:
    - league: ID de la ligue (ex: 61 pour Ligue 1, 39 pour Premier League)
    - season: Année de la saison (ex: 2023)
    
    Retourne les équipes avec leurs données de classement (position, points, etc.)
    """
    try:
        # Appel à l'API Football pour récupérer le classement (qui contient toutes les équipes)
        data = await football_service._make_request("standings", {
            "league": league,
            "season": season
        })
        
        if not data.get("response"):
            raise HTTPException(status_code=404, detail="Classement non trouvé")
        
        league_data = data["response"][0]
        
        # Vérifier s'il y a des standings
        if not league_data["league"]["standings"]:
            raise HTTPException(status_code=404, detail="Aucun classement disponible")
            
        standings_data = league_data["league"]["standings"][0]  # Premier groupe (championnat principal)
        
        # Transformer les données pour avoir toutes les équipes avec leurs stats
        teams = []
        for entry in standings_data:
            team_data = {
                "id": entry["team"]["id"],
                "name": entry["team"]["name"],
                "logo": entry["team"]["logo"],
                "country": league_data["league"]["country"],
                
                # Données du classement
                "position": entry["rank"],
                "points": entry["points"],
                "goalsDiff": entry["goalsDiff"],
                "form": entry["form"],
                "status": entry["status"],
                "description": entry["description"],
                
                # Statistiques complètes
                "played": entry["all"]["played"],
                "wins": entry["all"]["win"],
                "draws": entry["all"]["draw"],
                "losses": entry["all"]["lose"],
                "goals_for": entry["all"]["goals"]["for"],
                "goals_against": entry["all"]["goals"]["against"],
                
                # Statistiques domicile/extérieur
                "home": {
                    "played": entry["home"]["played"],
                    "wins": entry["home"]["win"],
                    "draws": entry["home"]["draw"],
                    "losses": entry["home"]["lose"],
                    "goals_for": entry["home"]["goals"]["for"],
                    "goals_against": entry["home"]["goals"]["against"]
                },
                "away": {
                    "played": entry["away"]["played"],
                    "wins": entry["away"]["win"],
                    "draws": entry["away"]["draw"],
                    "losses": entry["away"]["lose"],
                    "goals_for": entry["away"]["goals"]["for"],
                    "goals_against": entry["away"]["goals"]["against"]
                },
                
                "last_update": entry["update"]
            }
            teams.append(team_data)
        
        # Métadonnées de la ligue
        league_info = {
            "id": league_data["league"]["id"],
            "name": league_data["league"]["name"],
            "country": league_data["league"]["country"],
            "logo": league_data["league"]["logo"],
            "flag": league_data["league"]["flag"],
            "season": league_data["league"]["season"]
        }
        
        return {
            "league": league_info,
            "teams": teams,
            "total": len(teams),
            "last_update": league_data["league"]["standings"][0][0]["update"] if teams else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erreur API teams: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des équipes: {str(e)}")

# Garde l'ancien endpoint pour les équipes populaires (compatibilité)
@router.get("/popular")
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