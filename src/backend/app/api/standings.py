from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from app.services.football_api import football_service

router = APIRouter(prefix="/standings", tags=["standings"])

@router.get("/{league_id}")
async def get_league_standings(
    league_id: int,
    season: int = Query(2024, description="Saison")
):
    """
    Récupérer le classement d'une ligue avec les vraies données
    """
    try:
        # Appel à l'API Football
        data = await football_service._make_request("standings", {
            "league": league_id,
            "season": season
        })
        
        if not data.get("response"):
            raise HTTPException(status_code=404, detail="Classement non trouvé")
        
        league_data = data["response"][0]
        
        # Vérifier s'il y a des standings
        if not league_data["league"]["standings"]:
            raise HTTPException(status_code=404, detail="Aucun classement disponible")
            
        standings_data = league_data["league"]["standings"][0]  # Premier groupe (championnat principal)
        
        # Transformer les données pour le frontend
        standings = []
        for entry in standings_data:
            standings.append({
                "rank": entry["rank"],
                "team": {
                    "id": entry["team"]["id"],
                    "name": entry["team"]["name"],
                    "logo": entry["team"]["logo"]
                },
                "points": entry["points"],
                "goalsDiff": entry["goalsDiff"],
                "group": entry["group"],
                "form": entry["form"],
                "status": entry["status"],
                "description": entry["description"],
                "all": {
                    "played": entry["all"]["played"],
                    "win": entry["all"]["win"],
                    "draw": entry["all"]["draw"],
                    "lose": entry["all"]["lose"],
                    "goals": {
                        "for": entry["all"]["goals"]["for"],
                        "against": entry["all"]["goals"]["against"]
                    }
                },
                "home": {
                    "played": entry["home"]["played"],
                    "win": entry["home"]["win"],
                    "draw": entry["home"]["draw"],
                    "lose": entry["home"]["lose"],
                    "goals": {
                        "for": entry["home"]["goals"]["for"],
                        "against": entry["home"]["goals"]["against"]
                    }
                },
                "away": {
                    "played": entry["away"]["played"],
                    "win": entry["away"]["win"],
                    "draw": entry["away"]["draw"],
                    "lose": entry["away"]["lose"],
                    "goals": {
                        "for": entry["away"]["goals"]["for"],
                        "against": entry["away"]["goals"]["against"]
                    }
                },
                "update": entry["update"]
            })
        
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
            "standings": standings,
            "last_update": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erreur API standings: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")

@router.get("/{league_id}/summary")
async def get_standings_summary(
    league_id: int,
    season: int = Query(2024, description="Saison")
):
    """
    Récupérer un résumé du classement (top 3, stats globales)
    """
    try:
        # Récupérer le classement complet
        full_standings = await get_league_standings(league_id, season)
        standings = full_standings["standings"]
        
        if not standings:
            raise HTTPException(status_code=404, detail="Aucune donnée de classement")
        
        # Calculer les statistiques
        total_teams = len(standings)
        total_matches_played = sum(team["all"]["played"] for team in standings)
        total_goals = sum(team["all"]["goals"]["for"] for team in standings)
        
        # Moyennes
        avg_matches_per_team = total_matches_played / total_teams if total_teams > 0 else 0
        avg_goals_per_match = total_goals / (total_matches_played / 2) if total_matches_played > 0 else 0
        
        # Leader et équipes de queue
        leader = standings[0] if standings else None
        relegation_zone = standings[-3:] if len(standings) >= 3 else []
        
        return {
            "league": full_standings["league"],
            "summary": {
                "total_teams": total_teams,
                "matches_played_average": round(avg_matches_per_team, 1),
                "goals_per_match": round(avg_goals_per_match, 2),
                "leader": leader,
                "top_3": standings[:3],
                "relegation_zone": relegation_zone
            },
            "last_update": full_standings["last_update"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")