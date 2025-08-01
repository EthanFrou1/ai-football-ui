# backend/app/api/teams.py - VERSION ENRICHIE AVEC STATISTIQUES
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import requests
from datetime import datetime
from app.config.settings import settings

router = APIRouter(prefix="/teams", tags=["teams"])

# Configuration API Football
BASE_URL = "https://v3.football.api-sports.io"
headers = {
    "X-RapidAPI-Key": settings.football_api_key,
    "X-RapidAPI-Host": "v3.football.api-sports.io"
}

async def make_api_request(endpoint: str, params: dict):
    """Fonction utilitaire pour les appels API"""
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

@router.get("/{team_id}/statistics")
async def get_team_statistics(
    team_id: int, 
    league: int = Query(..., description="ID de la ligue"),
    season: int = Query(2023, description="Année de la saison")
):
    """
    Récupérer les statistiques complètes d'une équipe
    Combine plusieurs endpoints de l'API Football pour des données enrichies
    """
    try:
        print(f"📊 Récupération statistiques équipe {team_id} - Ligue {league}, Saison {season}")
        
        # 1. Statistiques d'équipe principales
        team_stats = await make_api_request("teams/statistics", {
            "team": team_id,
            "league": league,
            "season": season
        })
        
        # 2. Classement pour contexte
        standings = await make_api_request("standings", {
            "league": league,
            "season": season
        })
        
        # 3. Matchs récents pour la forme
        fixtures = await make_api_request("fixtures", {
            "team": team_id,
            "league": league,
            "season": season,
            "last": 10
        })
        
        # 4. Meilleurs buteurs de l'équipe
        top_scorers = await make_api_request("players/topscorers", {
            "team": team_id,
            "league": league,
            "season": season
        })
        
        # Construire la réponse enrichie
        result = {
            "team_id": team_id,
            "league": league,
            "season": season,
            "last_update": datetime.now().isoformat(),
        }
        
        # Traitement des statistiques principales
        if team_stats.get("response"):
            stats = team_stats["response"]
            
            # Statistiques générales
            result["general_stats"] = {
                "matches_played": stats.get("fixtures", {}).get("played", {}).get("total", 0),
                "wins": stats.get("fixtures", {}).get("wins", {}).get("total", 0),
                "draws": stats.get("fixtures", {}).get("draws", {}).get("total", 0),
                "losses": stats.get("fixtures", {}).get("loses", {}).get("total", 0),
                "goals_for": stats.get("goals", {}).get("for", {}).get("total", {}).get("total", 0),
                "goals_against": stats.get("goals", {}).get("against", {}).get("total", {}).get("total", 0),
            }
            
            # Performance domicile/extérieur
            result["home_away_stats"] = {
                "home": {
                    "played": stats.get("fixtures", {}).get("played", {}).get("home", 0),
                    "wins": stats.get("fixtures", {}).get("wins", {}).get("home", 0),
                    "draws": stats.get("fixtures", {}).get("draws", {}).get("home", 0),
                    "losses": stats.get("fixtures", {}).get("loses", {}).get("home", 0),
                    "goals_for": stats.get("goals", {}).get("for", {}).get("total", {}).get("home", 0),
                    "goals_against": stats.get("goals", {}).get("against", {}).get("total", {}).get("home", 0),
                },
                "away": {
                    "played": stats.get("fixtures", {}).get("played", {}).get("away", 0),
                    "wins": stats.get("fixtures", {}).get("wins", {}).get("away", 0),
                    "draws": stats.get("fixtures", {}).get("draws", {}).get("away", 0),
                    "losses": stats.get("fixtures", {}).get("loses", {}).get("away", 0),
                    "goals_for": stats.get("goals", {}).get("for", {}).get("total", {}).get("away", 0),
                    "goals_against": stats.get("goals", {}).get("against", {}).get("total", {}).get("away", 0),
                }
            }
            
            # Statistiques avancées
            result["advanced_stats"] = {
                "biggest_wins": {
                    "home": stats.get("biggest", {}).get("wins", {}).get("home"),
                    "away": stats.get("biggest", {}).get("wins", {}).get("away")
                },
                "biggest_losses": {
                    "home": stats.get("biggest", {}).get("loses", {}).get("home"),
                    "away": stats.get("biggest", {}).get("loses", {}).get("away")
                },
                "clean_sheets": {
                    "home": stats.get("clean_sheet", {}).get("home", 0),
                    "away": stats.get("clean_sheet", {}).get("away", 0),
                    "total": stats.get("clean_sheet", {}).get("total", 0)
                },
                "failed_to_score": {
                    "home": stats.get("failed_to_score", {}).get("home", 0),
                    "away": stats.get("failed_to_score", {}).get("away", 0),
                    "total": stats.get("failed_to_score", {}).get("total", 0)
                }
            }
        
        # Traitement du classement
        if standings.get("response"):
            for standing_group in standings["response"]:
                for team_standing in standing_group["league"]["standings"][0]:
                    if team_standing["team"]["id"] == team_id:
                        result["league_position"] = {
                            "position": team_standing["rank"],
                            "points": team_standing["points"],
                            "goal_diff": team_standing["goalsDiff"],
                            "form": team_standing["form"],
                            "description": team_standing["description"]
                        }
                        break
        
        # Traitement de la forme récente (5 derniers matchs)
        if fixtures.get("response"):
            recent_form = []
            for match in fixtures["response"][-5:]:  # 5 derniers matchs
                team_goals = 0
                opponent_goals = 0
                
                if match["teams"]["home"]["id"] == team_id:
                    team_goals = match["goals"]["home"] or 0
                    opponent_goals = match["goals"]["away"] or 0
                else:
                    team_goals = match["goals"]["away"] or 0
                    opponent_goals = match["goals"]["home"] or 0
                
                if team_goals > opponent_goals:
                    result_char = "W"
                elif team_goals < opponent_goals:
                    result_char = "L"
                else:
                    result_char = "D"
                
                recent_form.append({
                    "result": result_char,
                    "score": f"{team_goals}-{opponent_goals}",
                    "opponent": match["teams"]["away"]["name"] if match["teams"]["home"]["id"] == team_id else match["teams"]["home"]["name"],
                    "date": match["fixture"]["date"]
                })
            
            result["recent_form"] = recent_form
        
        # Traitement des meilleurs buteurs
        if top_scorers.get("response"):
            result["top_scorers"] = []
            for scorer in top_scorers["response"][:5]:  # Top 5
                player = scorer["player"]
                stats_data = scorer["statistics"][0] if scorer.get("statistics") else {}
                
                result["top_scorers"].append({
                    "id": player["id"],
                    "name": player["name"],
                    "photo": player.get("photo"),
                    "age": player.get("age"),
                    "nationality": player.get("nationality"),
                    "goals": stats_data.get("goals", {}).get("total", 0),
                    "assists": stats_data.get("goals", {}).get("assists", 0),
                    "matches": stats_data.get("games", {}).get("appearences", 0),
                    "position": stats_data.get("games", {}).get("position")
                })
        
        # Calcul de métriques personnalisées
        general = result.get("general_stats", {})
        if general.get("matches_played", 0) > 0:
            result["calculated_metrics"] = {
                "win_percentage": round((general.get("wins", 0) / general["matches_played"]) * 100, 1),
                "goals_per_match": round(general.get("goals_for", 0) / general["matches_played"], 2),
                "goals_conceded_per_match": round(general.get("goals_against", 0) / general["matches_played"], 2),
                "goal_difference": general.get("goals_for", 0) - general.get("goals_against", 0),
                "points_projection": round((general.get("wins", 0) * 3 + general.get("draws", 0)) / general["matches_played"] * 38, 0) if general["matches_played"] > 0 else 0
            }
        
        print(f"✅ Statistiques complètes récupérées pour l'équipe {team_id}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur statistiques équipe {team_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des statistiques: {str(e)}")

@router.get("/{team_id}/players/detailed")
async def get_team_players_detailed(
    team_id: int, 
    league: int = Query(..., description="ID de la ligue"),
    season: int = Query(2023, description="Année de la saison")
):
    """
    Récupérer les statistiques détaillées des joueurs d'une équipe
    """
    try:
        print(f"👥 Récupération joueurs détaillés équipe {team_id}")
        
        # Appel pour les joueurs avec statistiques
        players_data = await make_api_request("players", {
            "team": team_id,
            "league": league,
            "season": season
        })
        
        if not players_data.get("response"):
            return {"players": [], "total": 0}
        
        detailed_players = []
        
        for player_item in players_data["response"]:
            player = player_item["player"]
            statistics = player_item.get("statistics", [{}])[0] if player_item.get("statistics") else {}
            
            # Statistiques de jeu
            games = statistics.get("games", {})
            goals_stats = statistics.get("goals", {})
            cards = statistics.get("cards", {})
            
            player_data = {
                "id": player["id"],
                "name": player["name"],
                "age": player.get("age"),
                "nationality": player.get("nationality"),
                "height": player.get("height"),
                "weight": player.get("weight"),
                "photo": player.get("photo"),
                "injured": player.get("injured", False),
                
                # Statistiques de performance
                "performance": {
                    "position": games.get("position"),
                    "appearances": games.get("appearences", 0),
                    "minutes": games.get("minutes", 0),
                    "rating": games.get("rating"),
                    "captain": games.get("captain", False),
                    
                    # Buts et passes
                    "goals": goals_stats.get("total", 0),
                    "assists": goals_stats.get("assists", 0),
                    "saves": goals_stats.get("saves", 0),
                    
                    # Cartons
                    "yellow_cards": cards.get("yellow", 0),
                    "red_cards": cards.get("red", 0),
                },
                
                # Calculs personnalisés
                "calculated_stats": {}
            }
            
            # Calculs personnalisés
            if player_data["performance"]["appearances"] > 0:
                appearances = player_data["performance"]["appearances"]
                player_data["calculated_stats"] = {
                    "goals_per_match": round(player_data["performance"]["goals"] / appearances, 2),
                    "assists_per_match": round(player_data["performance"]["assists"] / appearances, 2),
                    "minutes_per_match": round(player_data["performance"]["minutes"] / appearances, 0) if player_data["performance"]["minutes"] else 0,
                    "goal_contribution": player_data["performance"]["goals"] + player_data["performance"]["assists"]
                }
            
            detailed_players.append(player_data)
        
        # Trier par nombre d'apparitions
        detailed_players.sort(key=lambda x: x["performance"]["appearances"], reverse=True)
        
        print(f"✅ {len(detailed_players)} joueurs détaillés récupérés")
        
        return {
            "players": detailed_players,
            "total": len(detailed_players),
            "last_update": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur joueurs détaillés équipe {team_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des joueurs: {str(e)}")

@router.get("/{team_id}/complete")
async def get_team_complete_profile(
    team_id: int,
    league: int = Query(..., description="ID de la ligue"), 
    season: int = Query(2023, description="Année de la saison")
):
    """
    Endpoint combiné pour récupérer TOUTES les informations d'une équipe
    Combine les détails de base + statistiques + joueurs
    """
    try:
        print(f"🔥 Profil complet équipe {team_id}")
        
        # 1. Détails de base de l'équipe
        team_data = await make_api_request("teams", {"id": team_id})
        
        if not team_data.get("response"):
            raise HTTPException(status_code=404, detail="Équipe non trouvée")
        
        team_info = team_data["response"][0]
        team = team_info["team"]
        venue = team_info["venue"]
        
        # 2. Statistiques complètes (réutiliser l'endpoint existant)
        try:
            stats_response = await get_team_statistics(team_id, league, season)
        except:
            stats_response = {"error": "Statistiques non disponibles"}
        
        # 3. Joueurs simplifiés (les 15 principaux)
        players_data = await make_api_request("players", {
            "team": team_id,
            "league": league,
            "season": season
        })
        
        simplified_players = []
        if players_data.get("response"):
            for player_item in players_data["response"][:15]:
                player = player_item["player"]
                statistics = player_item.get("statistics", [{}])[0] if player_item.get("statistics") else {}
                
                simplified_players.append({
                    "id": player["id"],
                    "name": player["name"],
                    "age": player.get("age"),
                    "nationality": player.get("nationality"),
                    "height": player.get("height"),
                    "weight": player.get("weight"),
                    "photo": player.get("photo"),
                    "injured": player.get("injured", False),
                    "position": statistics.get("games", {}).get("position"),
                    "appearances": statistics.get("games", {}).get("appearences", 0),
                    "goals": statistics.get("goals", {}).get("total", 0),
                    "assists": statistics.get("goals", {}).get("assists", 0)
                })
        
        # Construire la réponse complète
        complete_profile = {
            # Informations de base
            "id": team["id"],
            "name": team["name"],
            "logo": team["logo"],
            "country": team["country"],
            "code": team["code"],
            "founded": team["founded"],
            "national": team["national"],
            
            # Informations du stade
            "venue": {
                "name": venue.get("name"),
                "city": venue.get("city"),
                "capacity": venue.get("capacity"),
                "surface": venue.get("surface"),
                "address": venue.get("address"),
                "image": venue.get("image")
            } if venue else None,
            
            # Statistiques complètes
            "statistics": stats_response,
            
            # Joueurs
            "players": simplified_players,
            "players_count": len(simplified_players),
            
            # Métadonnées
            "league": league,
            "season": season,
            "last_update": datetime.now().isoformat()
        }
        
        print(f"✅ Profil complet récupéré pour {team['name']}")
        return complete_profile
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur profil complet équipe {team_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération du profil: {str(e)}")

# ============= ENDPOINTS EXISTANTS (CONSERVATION) =============

@router.get("/search")
async def search_teams(
    q: str = Query(..., description="Nom de l'équipe à rechercher"),
    country: Optional[str] = Query(None, description="Filtrer par pays")
):
    """Rechercher des équipes par nom"""
    try:
        params = {"search": q}
        if country:
            params["country"] = country
            
        data = await make_api_request("teams", params)
        
        teams = []
        for item in data.get("response", []):
            team_data = item.get("team", {})
            teams.append({
                "id": team_data.get("id"),
                "name": team_data.get("name"),
                "country": team_data.get("country"),
                "logo": team_data.get("logo"),
                "founded": team_data.get("founded"),
                "national": team_data.get("national", False),
                "code": team_data.get("code")
            })
        
        return teams
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la recherche: {str(e)}")

@router.get("/{team_id}")
async def get_team(team_id: int):
    """Récupérer les détails d'une équipe par son ID"""
    try:
        team_data = await make_api_request("teams", {"id": team_id})
        
        if not team_data.get("response"):
            raise HTTPException(status_code=404, detail="Équipe non trouvée")
        
        team_info = team_data["response"][0]
        team = team_info["team"]
        venue = team_info["venue"]
        
        return {
            "id": team["id"],
            "name": team["name"],
            "logo": team["logo"],
            "country": team["country"],
            "code": team["code"],
            "founded": team["founded"],
            "national": team["national"],
            "venue": venue
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")

@router.get("/{team_id}/players")
async def get_team_with_players(team_id: int, season: int = Query(2023, description="Saison")):
    """Récupérer une équipe avec ses détails et joueurs (ANCIEN ENDPOINT - CONSERVATION)"""
    try:
        # Utiliser le nouvel endpoint complet mais retourner dans l'ancien format
        complete_data = await get_team_complete_profile(team_id, 61, season)  # Default Ligue 1
        
        # Adapter au format attendu par le frontend existant
        result = {
            "id": complete_data["id"],
            "name": complete_data["name"],
            "logo": complete_data["logo"],
            "country": complete_data["country"],
            "code": complete_data["code"],
            "founded": complete_data["founded"],
            "national": complete_data["national"],
        }
        
        # Ajouter les infos du stade
        if complete_data["venue"]:
            venue = complete_data["venue"]
            result.update({
                "venue_name": venue.get("name"),
                "venue_city": venue.get("city"),
                "venue_capacity": venue.get("capacity"),
                "venue_surface": venue.get("surface"),
                "venue_address": venue.get("address"),
                "venue_image": venue.get("image")
            })
        
        # Simplifier les joueurs pour compatibilité
        if complete_data["players"]:
            result["players"] = []
            for player in complete_data["players"]:
                result["players"].append({
                    "id": player["id"],
                    "name": player["name"],
                    "age": player.get("age"),
                    "nationality": player.get("nationality"),
                    "height": player.get("height"),
                    "weight": player.get("weight"),
                    "photo": player.get("photo"),
                    "injured": player.get("injured", False)
                })
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur API team details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")

# Endpoint pour équipes par championnat (EXISTANT)
@router.get("/")
async def get_teams_by_league(
    league: int = Query(..., description="ID de la ligue"),
    season: int = Query(..., description="Année de la saison")
):
    """Récupère toutes les équipes d'un championnat avec leurs données enrichies du classement"""
    try:
        data = await make_api_request("standings", {
            "league": league,
            "season": season
        })
        
        if not data.get("response"):
            raise HTTPException(status_code=404, detail="Classement non trouvé")
        
        league_data = data["response"][0]
        
        if not league_data["league"]["standings"]:
            raise HTTPException(status_code=404, detail="Aucun classement disponible")
            
        standings_data = league_data["league"]["standings"][0]
        
        teams = []
        for entry in standings_data:
            team_data = {
                "id": entry["team"]["id"],
                "name": entry["team"]["name"],
                "logo": entry["team"]["logo"],
                "country": league_data["league"]["country"],
                
                "position": entry["rank"],
                "points": entry["points"],
                "goalsDiff": entry["goalsDiff"],
                "form": entry["form"],
                "status": entry["status"],
                "description": entry["description"],
                
                "played": entry["all"]["played"],
                "wins": entry["all"]["win"],
                "draws": entry["all"]["draw"],
                "losses": entry["all"]["lose"],
                "goals_for": entry["all"]["goals"]["for"],
                "goals_against": entry["all"]["goals"]["against"],
                
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
        print(f"❌ Erreur API teams: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des équipes: {str(e)}")

@router.get("/popular")
async def get_popular_teams():
    """Récupérer une liste d'équipes populaires (équipes françaises par défaut)"""
    try:
        popular_team_ids = [85, 79, 80, 84, 81, 77]  # PSG, OM, OL, Nice, Monaco, Lille
        teams = []
        
        for team_id in popular_team_ids:
            try:
                team_data = await make_api_request("teams", {"id": team_id})
                if team_data.get("response"):
                    team_info = team_data["response"][0]["team"]
                    teams.append({
                        "id": team_info["id"],
                        "name": team_info["name"],
                        "country": team_info["country"],
                        "logo": team_info["logo"],
                        "founded": team_info["founded"],
                        "national": team_info["national"],
                        "code": team_info["code"]
                    })
            except Exception as e:
                print(f"❌ Erreur équipe populaire {team_id}: {e}")
                continue
        
        return teams
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")