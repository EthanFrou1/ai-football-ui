# backend/app/api/matches.py - VERSION CORRIGÉE
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import requests
from datetime import datetime, timedelta
from app.config.settings import settings

router = APIRouter()

# Configuration API Football
BASE_URL = "https://v3.football.api-sports.io"
headers = {
    "X-RapidAPI-Key": settings.football_api_key,
    "X-RapidAPI-Host": "v3.football.api-sports.io"
}

def filter_matches_by_date(matches, days_back=30, days_forward=30):
    """
    Filtrer les matchs par date côté Python (puisque last/next non disponible)
    """
    now = datetime.now()
    date_start = now - timedelta(days=days_back)
    date_end = now + timedelta(days=days_forward)
    
    recent_matches = []
    upcoming_matches = []
    live_matches = []
    
    for match in matches:
        match_date = datetime.fromtimestamp(match['fixture']['timestamp'])
        
        # Matchs live
        if match['fixture']['status']['short'] in ['1H', '2H', 'HT', 'ET', 'P', 'LIVE']:
            live_matches.append(match)
        
        # Matchs récents (terminés dans les X derniers jours)
        elif (match['fixture']['status']['short'] in ['FT', 'AET', 'PEN'] and 
              date_start <= match_date <= now):
            recent_matches.append(match)
        
        # Matchs à venir (programmés dans les X prochains jours)
        elif (match['fixture']['status']['short'] in ['NS', 'TBD'] and 
              now <= match_date <= date_end):
            upcoming_matches.append(match)
    
    # Trier par date
    recent_matches.sort(key=lambda x: x['fixture']['timestamp'], reverse=True)
    upcoming_matches.sort(key=lambda x: x['fixture']['timestamp'])
    
    return {
        'recent': recent_matches[:10],  # Limiter à 10
        'upcoming': upcoming_matches[:10],  # Limiter à 10
        'live': live_matches
    }

# ============= ENDPOINTS SPÉCIFIQUES - ORDRE CRITIQUE ! =============
# ⚠️ CRITICAL: Ces endpoints DOIVENT être définis AVANT l'endpoint avec {match_id}
# Sinon FastAPI confond "live", "recent", "upcoming" avec des IDs de match

@router.get("/matches/live")
async def get_live_matches(
    league: Optional[int] = Query(None, description="ID de la ligue (optionnel)")
):
    """
    Récupérer les matchs en direct (FONCTIONNE EN PLAN GRATUIT)
    ⚠️ ENDPOINT DÉFINI EN PREMIER pour éviter la confusion avec /matches/{match_id}
    """
    try:
        print(f"🔴 Endpoint live appelé avec league={league}")
        
        # Le paramètre 'live=all' fonctionne en plan gratuit
        api_params = {"live": "all"}
        
        # Filtrer par ligue si spécifié
        if league and isinstance(league, int):
            api_params["league"] = league
            print(f"🎯 Filtrage par ligue: {league}")
        
        print(f"📡 Appel API live avec params: {api_params}")
        
        response = requests.get(
            f"{BASE_URL}/fixtures",
            headers=headers,
            params=api_params,
            timeout=30
        )
        
        print(f"📊 Réponse API: status={response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ Erreur API: {response.status_code} - {response.text}")
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Erreur API Football: {response.status_code}"
            )
        
        data = response.json()
        
        print(f"✅ Matchs live récupérés: {len(data.get('response', []))}")
        
        return data
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur récupération matchs live: {e}")
        # Retourner une réponse vide au lieu de lever une exception
        return {
            "get": "fixtures",
            "parameters": {"live": "all"},
            "errors": {},
            "results": 0,
            "response": []
        }

@router.get("/matches/recent")
async def get_recent_matches(
    league: int = Query(..., description="ID de la ligue"),
    season: int = Query(2023, description="Année de la saison"),
    limit: int = Query(10, description="Nombre max de matchs")
):
    """
    Récupérer les matchs récents (CONTOURNEMENT PLAN GRATUIT)
    ⚠️ ENDPOINT DÉFINI AVANT /matches/{match_id} pour éviter la confusion
    """
    try:
        print(f"📅 Récupération matchs récents: league={league}, season={season}")
        
        # Récupérer tous les matchs de la saison (seul paramètre disponible)
        api_params = {
            "league": league,
            "season": season
        }
        
        response = requests.get(
            f"{BASE_URL}/fixtures",
            headers=headers,
            params=api_params,
            timeout=30
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Erreur API Football: {response.status_code}"
            )
        
        data = response.json()
        
        if "response" not in data:
            return {"response": [], "get": "fixtures", "parameters": api_params}
        
        # Filtrer les matchs côté serveur
        filtered = filter_matches_by_date(data["response"])
        
        print(f"✅ Matchs récents filtrés: {len(filtered['recent'][:limit])}")
        
        # Retourner seulement les matchs récents
        return {
            "get": "fixtures",
            "parameters": api_params,
            "errors": data.get("errors", {}),
            "results": len(filtered['recent'][:limit]),
            "response": filtered['recent'][:limit]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur récupération matchs récents: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/matches/upcoming")
async def get_upcoming_matches(
    league: int = Query(..., description="ID de la ligue"),
    season: int = Query(2023, description="Année de la saison"),
    limit: int = Query(10, description="Nombre max de matchs")
):
    """
    Récupérer les matchs à venir (CONTOURNEMENT PLAN GRATUIT)
    ⚠️ ENDPOINT DÉFINI AVANT /matches/{match_id} pour éviter la confusion
    """
    try:
        print(f"⏰ Récupération matchs à venir: league={league}, season={season}")
        
        api_params = {
            "league": league,
            "season": season
        }
        
        response = requests.get(
            f"{BASE_URL}/fixtures",
            headers=headers,
            params=api_params,
            timeout=30
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Erreur API Football: {response.status_code}"
            )
        
        data = response.json()
        
        if "response" not in data:
            return {"response": [], "get": "fixtures", "parameters": api_params}
        
        # Filtrer les matchs côté serveur
        filtered = filter_matches_by_date(data["response"])
        
        print(f"✅ Matchs à venir filtrés: {len(filtered['upcoming'][:limit])}")
        
        # Retourner seulement les matchs à venir
        return {
            "get": "fixtures",
            "parameters": api_params,
            "errors": data.get("errors", {}),
            "results": len(filtered['upcoming'][:limit]),
            "response": filtered['upcoming'][:limit]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur récupération matchs à venir: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============= ENDPOINT POUR DÉTAILS D'UN MATCH SPÉCIFIQUE =============
# ⚠️ IMPORTANT: Défini APRÈS l'endpoint /matches/live

@router.get("/matches/{match_id}")
async def get_match_details(match_id: int):
    """
    Récupère les détails d'un match spécifique par son ID
    ⚠️ Défini après /matches/live pour éviter la confusion
    """
    try:
        print(f"🎯 Récupération détails match ID: {match_id}")
        
        # Appel à l'API Football pour récupérer un match spécifique
        api_params = {"id": match_id}
        
        response = requests.get(
            f"{BASE_URL}/fixtures",
            headers=headers,
            params=api_params,
            timeout=30
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Erreur API Football: {response.status_code}"
            )
        
        data = response.json()
        
        # Vérifier si le match existe
        if not data.get("response") or len(data["response"]) == 0:
            raise HTTPException(
                status_code=404,
                detail=f"Match {match_id} non trouvé"
            )
        
        print(f"✅ Détails du match {match_id} récupérés")
        
        return data
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur récupération détails match {match_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la récupération du match: {str(e)}"
        )

# ============= AUTRES ENDPOINTS UTILITAIRES =============

@router.get("/matches/by-date")
async def get_matches_by_date(
    league: int = Query(..., description="ID de la ligue"),
    date: str = Query(..., description="Date (YYYY-MM-DD)"),
    season: int = Query(2023, description="Année de la saison")
):
    """
    Récupérer les matchs d'une date spécifique (ALTERNATIVE PLAN GRATUIT)
    ⚠️ ENDPOINT DÉFINI AVANT /matches/{match_id} pour éviter la confusion
    """
    try:
        print(f"📅 Récupération matchs du {date}: league={league}")
        
        # Utiliser le paramètre 'date' qui fonctionne en plan gratuit
        api_params = {
            "league": league,
            "season": season,
            "date": date  # Format: 2023-12-25
        }
        
        response = requests.get(
            f"{BASE_URL}/fixtures",
            headers=headers,
            params=api_params,
            timeout=30
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Erreur API Football: {response.status_code}"
            )
        
        data = response.json()
        
        print(f"✅ Matchs du {date} récupérés: {len(data.get('response', []))}")
        
        return data
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur récupération matchs par date: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/matches")
async def get_matches_optimized(
    league: int = Query(..., description="ID de la ligue"),
    season: int = Query(2023, description="Année de la saison"),
    filter_type: Optional[str] = Query("all", description="Type de filtre: all, recent, upcoming, live")
):
    """
    Endpoint optimisé pour le plan gratuit
    Récupère tous les matchs puis filtre côté serveur
    ⚠️ ENDPOINT DÉFINI AVANT /matches/{match_id} pour éviter la confusion
    """
    try:
        print(f"🎯 Récupération matchs optimisés: league={league}, filter={filter_type}")
        
        # UN SEUL APPEL API pour récupérer tous les matchs
        api_params = {
            "league": league,
            "season": season
        }
        
        response = requests.get(
            f"{BASE_URL}/fixtures",
            headers=headers,
            params=api_params,
            timeout=30
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Erreur API Football: {response.status_code}"
            )
        
        data = response.json()
        
        if "response" not in data:
            return {"response": [], "get": "fixtures", "parameters": api_params}
        
        # Filtrer selon le type demandé
        if filter_type == "all":
            # Retourner tous les matchs
            filtered_response = data["response"]
        else:
            # Filtrer par type
            filtered = filter_matches_by_date(data["response"])
            
            if filter_type == "recent":
                filtered_response = filtered['recent']
            elif filter_type == "upcoming":
                filtered_response = filtered['upcoming']
            elif filter_type == "live":
                filtered_response = filtered['live']
            else:
                filtered_response = data["response"]
        
        print(f"✅ Matchs filtrés ({filter_type}): {len(filtered_response)}")
        
        return {
            "get": "fixtures",
            "parameters": api_params,
            "errors": data.get("errors", {}),
            "results": len(filtered_response),
            "response": filtered_response,
            "filter_applied": filter_type
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur récupération matchs: {e}")
        raise HTTPException(status_code=500, detail=str(e))