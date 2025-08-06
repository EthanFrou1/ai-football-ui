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
    """Fonction utilitaire pour les appels API avec retry automatique - AMÉLIORÉE"""
    try:
        print(f"🔍 API Call: {endpoint} avec params: {params}")
        
        response = requests.get(
            f"{BASE_URL}/{endpoint}",
            headers=headers,
            params=params,
            timeout=30
        )
        
        print(f"📡 Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Response OK - {len(data.get('response', []))} items")
            return data
        elif response.status_code == 429:
            print("⚠️ Rate limit atteint - attendre")
            raise HTTPException(status_code=429, detail="Rate limit API atteint")
        else:
            print(f"❌ Erreur API {endpoint}: {response.status_code}")
            return {"response": []}
            
    except requests.exceptions.Timeout:
        print(f"⏰ Timeout API {endpoint}")
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
    league: int = Query(61, description="ID de la ligue"),  # ← Rendre optionnel
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
                
                # Statistiques de performance - CORRECTION ICI
                "performance": {
                    "position": games.get("position"),
                    "appearances": games.get("appearences", 0) or 0,  # ← CORRIGER
                    "minutes": games.get("minutes", 0) or 0,
                    "rating": games.get("rating"),
                    "captain": games.get("captain", False),
                    
                    # Buts et passes
                    "goals": goals_stats.get("total", 0) or 0,
                    "assists": goals_stats.get("assists", 0) or 0,
                    "saves": goals_stats.get("saves", 0) or 0,
                    
                    # Cartons
                    "yellow_cards": cards.get("yellow", 0) or 0,
                    "red_cards": cards.get("red", 0) or 0,
                },
                
                # Calculs personnalisés
                "calculated_stats": {}
            }
            
            # CORRECTION : Vérifier que appearances n'est pas None
            appearances = player_data["performance"]["appearances"]
            if appearances and appearances > 0:  # ← CORRIGER ICI
                player_data["calculated_stats"] = {
                    "goals_per_match": round(player_data["performance"]["goals"] / appearances, 2),
                    "assists_per_match": round(player_data["performance"]["assists"] / appearances, 2),
                    "minutes_per_match": round(player_data["performance"]["minutes"] / appearances, 0) if player_data["performance"]["minutes"] else 0,
                    "goal_contribution": player_data["performance"]["goals"] + player_data["performance"]["assists"]
                }
            
            detailed_players.append(player_data)
        
        # Trier par nombre d'apparitions (avec gestion des None)
        detailed_players.sort(key=lambda x: x["performance"]["appearances"] or 0, reverse=True)
        
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
    league: int = Query(61, description="ID de la ligue"), 
    season: int = Query(2023, description="Année de la saison")
):
    """
    Endpoint combiné pour récupérer TOUTES les informations d'une équipe
    Combine les détails de base + statistiques + joueurs
    """
    try:
        print(f"🔥 Profil complet équipe {team_id} - Ligue {league}, Saison {season}")
        
        # 1. Détails de base de l'équipe
        team_data = await make_api_request("teams", {"id": team_id})
        
        if not team_data.get("response"):
            raise HTTPException(status_code=404, detail="Équipe non trouvée")
        
        team_info = team_data["response"][0]
        team = team_info["team"]
        venue = team_info.get("venue", {})
        
        print(f"✅ Équipe trouvée: {team['name']}")
        
        # 2. CLASSEMENT pour obtenir la VRAIE position
        print(f"🏆 Récupération classement ligue {league}")
        standings_data = await make_api_request("standings", {
            "league": league,
            "season": season
        })
        
        current_position = None
        standing_stats = {}
        
        if standings_data.get("response"):
            for league_standing in standings_data["response"]:
                for standing_group in league_standing.get("league", {}).get("standings", []):
                    for team_standing in standing_group:
                        if team_standing["team"]["id"] == team_id:
                            current_position = team_standing["rank"]
                            standing_stats = {
                                "position": team_standing["rank"],
                                "points": team_standing["points"],
                                "matches_played": team_standing["all"]["played"],
                                "wins": team_standing["all"]["win"],
                                "draws": team_standing["all"]["draw"],
                                "losses": team_standing["all"]["lose"],
                                "goals_for": team_standing["all"]["goals"]["for"],
                                "goals_against": team_standing["all"]["goals"]["against"],
                                "goal_difference": team_standing["goalsDiff"],
                                "form": team_standing.get("form", "")
                            }
                            break
        
        print(f"📊 Position trouvée: {current_position}")
        
        # 3. STATISTIQUES DÉTAILLÉES (optionnel)
        try:
            stats_response = await get_team_statistics(team_id, league, season)
        except:
            stats_response = {"error": "Statistiques non disponibles"}
        
        # 4. JOUEURS PRINCIPAUX - AVEC DEBUG
        print(f"👥 DÉBUT Debug récupération joueurs équipe {team_id}")
        print(f"🧪 DEBUG: Tentative récupération joueurs pour team={team_id}, league={league}, season={season}")
        
        players_data = await make_api_request("players", {
            "team": team_id,
            "league": league,
            "season": season
        })
        
        # DEBUG LOGS DÉTAILLÉS
        print(f"🧪 DEBUG: Réponse players_data keys: {list(players_data.keys()) if players_data else 'None'}")
        print(f"🧪 DEBUG: Response items: {len(players_data.get('response', [])) if players_data else 0}")
        print(f"🧪 DEBUG: Raw response (first 300 chars): {str(players_data)[:300]}")
        
        if players_data.get("response"):
            if players_data['response']:
                first_player = players_data['response'][0]
                
        simplified_players = []
        if players_data.get("response"):
            print(f"👥 {len(players_data['response'])} joueurs trouvés - Traitement en cours...")
            
            # Prendre les 20 premiers joueurs avec statistiques
            for i, player_item in enumerate(players_data["response"][:20]):
                player = player_item["player"]
                statistics = player_item.get("statistics", [])
                
                if statistics:
                    stat = statistics[0]
                    games = stat.get("games", {})
                    goals_stats = stat.get("goals", {})
                    
                    appearances = games.get("appearences", 0) or 0
                    goals = goals_stats.get("total", 0) or 0
                    assists = goals_stats.get("assists", 0) or 0
                    
                    simplified_players.append({
                        "id": player["id"],
                        "name": player["name"],
                        "age": player.get("age"),
                        "nationality": player.get("nationality"),
                        "height": player.get("height"),
                        "weight": player.get("weight"),
                        "photo": player.get("photo"),
                        "injured": player.get("injured", False),
                        "position": games.get("position"),
                        "appearances": appearances,
                        "goals": goals,
                        "assists": assists,
                        "minutes": games.get("minutes", 0) or 0,
                        "rating": games.get("rating")
                    })
                else:
                    # Ajouter le joueur même sans stats
                    simplified_players.append({
                        "id": player["id"],
                        "name": player["name"],
                        "age": player.get("age"),
                        "nationality": player.get("nationality"),
                        "height": player.get("height"),
                        "weight": player.get("weight"),
                        "photo": player.get("photo"),
                        "injured": player.get("injured", False),
                        "position": None,
                        "appearances": 0,
                        "goals": 0,
                        "assists": 0,
                        "minutes": 0,
                        "rating": None
                    })
        else:
            print(f"🧪 DEBUG: Aucun joueur dans la réponse API")
        
        # Trier joueurs par apparitions (avec gestion des None)
        simplified_players.sort(key=lambda x: x.get("appearances", 0) or 0, reverse=True)
        
        # 5. CONSTRUIRE LA RÉPONSE COMPLÈTE - AVEC current_season
        complete_profile = {
            # Informations de base
            "id": team["id"],
            "name": team["name"],
            "logo": team["logo"],
            "country": team["country"],
            "code": team.get("code"),
            "founded": team.get("founded"),
            "national": team.get("national", False),
            
            # STRUCTURE current_season
            "current_season": {
                "league": league,
                "season": season,
                "position": current_position,
                "points": standing_stats.get("points", 0),
                "matches_played": standing_stats.get("matches_played", 0),
                "wins": standing_stats.get("wins", 0),
                "draws": standing_stats.get("draws", 0),
                "losses": standing_stats.get("losses", 0),
                "goals_for": standing_stats.get("goals_for", 0),
                "goals_against": standing_stats.get("goals_against", 0),
                "goal_difference": standing_stats.get("goal_difference", 0),
                "form": standing_stats.get("form", "")
            },
            
            # Informations du stade
            "venue": {
                "name": venue.get("name"),
                "city": venue.get("city"),
                "capacity": venue.get("capacity"),
                "surface": venue.get("surface"),
                "address": venue.get("address"),
                "image": venue.get("image")
            } if venue else None,
            
            # Statistiques détaillées
            "detailed_statistics": stats_response,
            
            # Joueurs
            "players": simplified_players,
            "players_count": len(simplified_players),
            
            # Métadonnées
            "last_update": datetime.now().isoformat(),
            "debug_info": {
                "api_calls_made": 4,
                "players_api_response_length": len(players_data.get('response', [])) if players_data else 0,
                "players_processed": len(simplified_players)
            }
        }
        
        print(f"✅ Profil complet généré - Position: {current_position}, Joueurs: {len(simplified_players)}")
        return complete_profile
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur complète équipe {team_id}: {e}")
        import traceback
        print(f"📍 Traceback: {traceback.format_exc()}")
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



@router.get("/{team_id}/players")
async def get_team_with_players(
    team_id: int, 
    season: int = Query(2023, description="Saison"),
    league: int = Query(61, description="Ligue") # AJOUT DU PARAMÈTRE LEAGUE
):
    """CORRIGÉ - Récupérer une équipe avec ses détails et joueurs + POSITION RÉELLE"""
    try:
        # Utiliser le nouvel endpoint complet corrigé
        complete_data = await get_team_complete_profile(team_id, league, season)
        
        # Adapter au format attendu par le frontend existant
        result = {
            "id": complete_data["id"],
            "name": complete_data["name"],
            "logo": complete_data["logo"],
            "country": complete_data["country"],
            "code": complete_data.get("code"),
            "founded": complete_data.get("founded"),
            "national": complete_data.get("national", False),
            
            # CORRECTION: Position réelle
            "position": complete_data["current_season"]["position"],
            "points": complete_data["current_season"].get("points"),
            "matches_played": complete_data["current_season"].get("matches_played"),
        }
        
        # Ajouter les infos du stade (comme avant)
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
        
        # Simplifier les joueurs pour compatibilité (comme avant)
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
                    "injured": player.get("injured", False),
                    "position": player.get("position"),
                    "appearances": player.get("appearances", 0),
                    "goals": player.get("goals", 0),
                    "assists": player.get("assists", 0)
                })
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur API team details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")

# ============= ENDPOINT DE DEBUG AJOUTÉ =============
@router.get("/{team_id}/debug")
async def debug_team_data(team_id: int, league: int = 61, season: int = 2023):
    """Endpoint de debug pour voir les données brutes"""
    try:
        # Test appel basique
        team_data = await make_api_request("teams", {"id": team_id})
        standings_data = await make_api_request("standings", {"league": league, "season": season})
        
        return {
            "team_data": team_data,
            "standings_snippet": {
                "found": bool(standings_data.get("response")),
                "leagues_count": len(standings_data.get("response", [])),
                "first_league": standings_data.get("response", [{}])[0].get("league", {}).get("name") if standings_data.get("response") else None
            },
            "api_key_valid": len(headers.get("X-RapidAPI-Key", "")) > 10
        }
    except Exception as e:
        return {"error": str(e)}
    
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