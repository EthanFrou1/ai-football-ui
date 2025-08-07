# src/backend/app/api/players.py

from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from typing import Optional
import requests
from app.config.settings import settings

router = APIRouter(prefix="/players", tags=["players"])

# Configuration API Football (même que dans teams.py)
BASE_URL = "https://v3.football.api-sports.io"
headers = {
    "X-RapidAPI-Key": settings.football_api_key,
    "X-RapidAPI-Host": "v3.football.api-sports.io"
}

async def make_api_request(endpoint: str, params: dict):
    """Fonction utilitaire pour les appels API (même que teams.py)"""
    try:
        response = requests.get(
            f"{BASE_URL}/{endpoint}",
            headers=headers,
            params=params,
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ Erreur API {endpoint}: {response.status_code}")
            return {"response": []}
            
    except Exception as e:
        print(f"❌ Exception API {endpoint}: {e}")
        return {"response": []}

@router.get("/{player_id}/details")
async def get_player_details(
    player_id: int,
    league: int = Query(61, description="ID de la ligue"), 
    season: int = Query(2023, description="Année de la saison")
):
    """
    Récupérer les détails complets d'un joueur avec ses statistiques
    """
    try:
        print(f"👤 Récupération détails joueur {player_id}")
        
        # 1. Récupérer les statistiques du joueur pour la saison
        player_stats = await make_api_request("players", {
            "id": player_id,
            "league": league,
            "season": season
        })
        
        if not player_stats.get("response") or len(player_stats["response"]) == 0:
            raise HTTPException(status_code=404, detail="Joueur non trouvé")
        
        player_data = player_stats["response"][0]
        player = player_data["player"]
        statistics = player_data.get("statistics", [{}])[0] if player_data.get("statistics") else {}
        
        # 2. Informations de l'équipe actuelle
        current_team = None
        if statistics.get("team"):
            current_team = {
                "id": statistics["team"]["id"],
                "name": statistics["team"]["name"],
                "logo": statistics["team"]["logo"]
            }
        
        # 3. Statistiques de performance
        games = statistics.get("games", {})
        goals_stats = statistics.get("goals", {})
        cards = statistics.get("cards", {})
        
        performance = {
            "position": games.get("position"),
            "appearances": games.get("appearences", 0),
            "minutes": games.get("minutes", 0),
            "rating": games.get("rating"),
            "captain": games.get("captain", False),
            "goals": goals_stats.get("total", 0),
            "assists": goals_stats.get("assists", 0),
            "yellow_cards": cards.get("yellow", 0),
            "red_cards": cards.get("red", 0)
        }
        
        # 4. Statistiques calculées
        calculated_stats = {}
        if performance["appearances"] > 0:
            appearances = performance["appearances"]
            calculated_stats = {
                "goals_per_match": round(performance["goals"] / appearances, 2),
                "assists_per_match": round(performance["assists"] / appearances, 2),
                "minutes_per_match": round(performance["minutes"] / appearances, 0) if performance["minutes"] else 0,
                "goal_contribution": performance["goals"] + performance["assists"]
            }
        
        # 5. Construire la réponse complète
        result = {
            "id": player["id"],
            "name": player["name"],
            "firstname": player.get("firstname"),
            "lastname": player.get("lastname"),
            "age": player.get("age"),
            "birth_date": player.get("birth", {}).get("date"),
            "birth_place": player.get("birth", {}).get("place"),
            "birth_country": player.get("birth", {}).get("country"),
            "nationality": player.get("nationality"),
            "height": player.get("height"),
            "weight": player.get("weight"),
            "injured": player.get("injured", False),
            "photo": player.get("photo"),
            "current_team": current_team,
            "performance": performance,
            "calculated_stats": calculated_stats,
            "season": season,
            "league": league,
            "last_update": datetime.now().isoformat()
        }
        
        print(f"✅ Détails joueur {player['name']} récupérés")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur détails joueur {player_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")

@router.get("/{player_id}/details")
async def get_player_details(
    player_id: int,
    league: int = Query(61, description="ID de la ligue"), 
    season: int = Query(2023, description="Année de la saison")
):
    """
    Récupérer les détails complets d'un joueur avec ses statistiques
    """
    try:
        print(f"👤 Récupération détails joueur {player_id}")
        
        # 1. Récupérer les statistiques du joueur pour la saison
        player_stats = await make_api_request("players", {
            "id": player_id,
            "league": league,
            "season": season
        })
        
        if not player_stats.get("response") or len(player_stats["response"]) == 0:
            raise HTTPException(status_code=404, detail="Joueur non trouvé")
        
        player_data = player_stats["response"][0]
        player = player_data["player"]
        statistics = player_data.get("statistics", [{}])[0] if player_data.get("statistics") else {}
        
        # 2. Informations de l'équipe actuelle
        current_team = None
        if statistics.get("team"):
            current_team = {
                "id": statistics["team"]["id"],
                "name": statistics["team"]["name"],
                "logo": statistics["team"]["logo"]
            }
        
        # 3. Statistiques de performance
        games = statistics.get("games", {})
        goals_stats = statistics.get("goals", {})
        cards = statistics.get("cards", {})
        
        performance = {
            "position": games.get("position"),
            "appearances": games.get("appearences", 0),
            "minutes": games.get("minutes", 0),
            "rating": games.get("rating"),
            "captain": games.get("captain", False),
            "goals": goals_stats.get("total", 0),
            "assists": goals_stats.get("assists", 0),
            "yellow_cards": cards.get("yellow", 0),
            "red_cards": cards.get("red", 0)
        }
        
        # 4. Statistiques calculées
        calculated_stats = {}
        if performance["appearances"] > 0:
            appearances = performance["appearances"]
            calculated_stats = {
                "goals_per_match": round(performance["goals"] / appearances, 2),
                "assists_per_match": round(performance["assists"] / appearances, 2),
                "minutes_per_match": round(performance["minutes"] / appearances, 0) if performance["minutes"] else 0,
                "goal_contribution": performance["goals"] + performance["assists"]
            }
        
        # 5. Construire la réponse complète
        result = {
            "id": player["id"],
            "name": player["name"],
            "firstname": player.get("firstname"),
            "lastname": player.get("lastname"),
            "age": player.get("age"),
            "birth_date": player.get("birth", {}).get("date"),
            "birth_place": player.get("birth", {}).get("place"),
            "birth_country": player.get("birth", {}).get("country"),
            "nationality": player.get("nationality"),
            "height": player.get("height"),
            "weight": player.get("weight"),
            "injured": player.get("injured", False),
            "photo": player.get("photo"),
            "current_team": current_team,
            "performance": performance,
            "calculated_stats": calculated_stats,
            "season": season,
            "league": league,
            "last_update": datetime.now().isoformat()
        }
        
        print(f"✅ Détails joueur {player['name']} récupérés")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur détails joueur {player_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")

@router.get("/{player_id}/matches")
async def get_player_matches(
    player_id: int,
    league: int = Query(61, description="ID de la ligue"),
    season: int = Query(2023, description="Année de la saison"),
    limit: int = Query(10, description="Nombre de matchs")
):
    """
    Récupérer les derniers matchs joués par un joueur
    """
    try:
        print(f"⚽ Récupération matchs joueur {player_id}")
        
        # Récupérer les fixtures du joueur
        fixtures_data = await make_api_request("fixtures/players", {
            "player": player_id,
            "league": league,
            "season": season,
            "last": limit
        })
        
        matches = []
        if fixtures_data.get("response"):
            for fixture in fixtures_data["response"][:limit]:
                match_data = {
                    "id": fixture["fixture"]["id"],
                    "date": fixture["fixture"]["date"],
                    "status": fixture["fixture"]["status"]["short"],
                    "home_team": {
                        "id": fixture["teams"]["home"]["id"],
                        "name": fixture["teams"]["home"]["name"],
                        "logo": fixture["teams"]["home"]["logo"]
                    },
                    "away_team": {
                        "id": fixture["teams"]["away"]["id"],
                        "name": fixture["teams"]["away"]["name"],
                        "logo": fixture["teams"]["away"]["logo"]
                    },
                    "score": {
                        "home": fixture["goals"]["home"],
                        "away": fixture["goals"]["away"]
                    }
                }
                matches.append(match_data)
        
        return {
            "player_id": player_id,
            "matches": matches,
            "total": len(matches),
            "season": season,
            "league": league
        }
        
    except Exception as e:
        print(f"❌ Erreur matchs joueur {player_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")

@router.get("/{player_id}/transfers")
async def get_player_transfers(player_id: int):
    """
    Récupérer l'historique des transferts d'un joueur
    """
    try:
        print(f"🔄 Récupération transferts joueur {player_id}")
        
        transfers_data = await make_api_request("transfers", {
            "player": player_id
        })
        
        transfers = []
        if transfers_data.get("response"):
            for transfer_item in transfers_data["response"]:
                for transfer in transfer_item.get("transfers", []):
                    transfer_data = {
                        "date": transfer.get("date"),
                        "type": transfer.get("type"),
                        "from_team": {
                            "id": transfer["teams"]["in"]["id"] if transfer.get("teams", {}).get("in") else None,
                            "name": transfer["teams"]["in"]["name"] if transfer.get("teams", {}).get("in") else None,
                            "logo": transfer["teams"]["in"]["logo"] if transfer.get("teams", {}).get("in") else None
                        } if transfer.get("teams", {}).get("in") else None,
                        "to_team": {
                            "id": transfer["teams"]["out"]["id"] if transfer.get("teams", {}).get("out") else None,
                            "name": transfer["teams"]["out"]["name"] if transfer.get("teams", {}).get("out") else None,
                            "logo": transfer["teams"]["out"]["logo"] if transfer.get("teams", {}).get("out") else None
                        } if transfer.get("teams", {}).get("out") else None
                    }
                    transfers.append(transfer_data)
        
        return {
            "player_id": player_id,
            "transfers": transfers,
            "total": len(transfers)
        }
        
    except Exception as e:
        print(f"❌ Erreur transferts joueur {player_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")

@router.get("/search")
async def search_players(
    q: str = Query(..., description="Terme de recherche"),
    league: Optional[int] = Query(None, description="ID de la ligue pour filtrer")
):
    """
    Rechercher des joueurs par nom
    """
    try:
        print(f"🔍 Recherche joueurs: {q}")
        
        search_params = {"search": q}
        if league:
            search_params["league"] = league
            search_params["season"] = 2023
            
        players_data = await make_api_request("players", search_params)
        
        players = []
        if players_data.get("response"):
            for player_item in players_data["response"][:20]:  # Limite à 20 résultats
                player = player_item["player"]
                statistics = player_item.get("statistics", [{}])[0] if player_item.get("statistics") else {}
                
                # Équipe actuelle
                current_team = None
                if statistics.get("team"):
                    current_team = {
                        "id": statistics["team"]["id"],
                        "name": statistics["team"]["name"],
                        "logo": statistics["team"]["logo"]
                    }
                
                player_result = {
                    "id": player["id"],
                    "name": player["name"],
                    "age": player.get("age"),
                    "nationality": player.get("nationality"),
                    "photo": player.get("photo"),
                    "current_team": current_team,
                    "performance": {
                        "position": statistics.get("games", {}).get("position"),
                        "goals": statistics.get("goals", {}).get("total", 0),
                        "assists": statistics.get("goals", {}).get("assists", 0),
                        "appearances": statistics.get("games", {}).get("appearences", 0)
                    } if statistics else None
                }
                players.append(player_result)
        
        return {
            "query": q,
            "players": players,
            "total": len(players)
        }
        
    except Exception as e:
        print(f"❌ Erreur recherche joueurs: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la recherche: {str(e)}")

@router.post("/compare")
async def compare_players(
    request: dict,
    league: int = Query(61, description="ID de la ligue"),
    season: int = Query(2023, description="Année de la saison")
):
    """
    Comparer plusieurs joueurs
    """
    try:
        player_ids = request.get("player_ids", [])
        if not player_ids or len(player_ids) < 2:
            raise HTTPException(status_code=400, detail="Au moins 2 joueurs sont requis pour la comparaison")
        
        print(f"📊 Comparaison joueurs: {player_ids}")
        
        players = []
        for player_id in player_ids[:5]:  # Limite à 5 joueurs max
            try:
                player_details = await get_player_details(player_id, league, season)
                players.append(player_details)
            except:
                # Continuer même si un joueur n'est pas trouvé
                pass
        
        return {
            "players": players,
            "total": len(players),
            "comparison_date": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur comparaison joueurs: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la comparaison: {str(e)}")