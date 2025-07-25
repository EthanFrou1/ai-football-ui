# backend/app/api/matches.py
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import requests
import os
from datetime import datetime, timedelta

router = APIRouter()

# Configuration API Football
API_KEY = os.getenv("FOOTBALL_API_KEY", "your_api_key_here")
BASE_URL = "https://v3.football.api-sports.io"

headers = {
    "X-RapidAPI-Key": API_KEY,
    "X-RapidAPI-Host": "v3.football.api-sports.io"
}

@router.get("/matches")
async def get_matches(
    league: int = Query(..., description="ID de la ligue"),
    season: int = Query(..., description="Année de la saison"),
    last: Optional[int] = Query(None, description="Nombre de derniers matchs"),
    next: Optional[int] = Query(None, description="Nombre de prochains matchs"),
    from_date: Optional[str] = Query(None, description="Date de début (YYYY-MM-DD)"),
    to_date: Optional[str] = Query(None, description="Date de fin (YYYY-MM-DD)"),
    team: Optional[int] = Query(None, description="ID de l'équipe"),
    status: Optional[str] = Query(None, description="Statut des matchs (NS, FT, LIVE, etc.)")
):
    """
    Récupère les matchs d'une ligue pour une saison donnée
    
    Paramètres:
    - league: ID de la ligue (ex: 39 pour Premier League)
    - season: Année de la saison (ex: 2023)
    - last: Nombre de derniers matchs à récupérer
    - next: Nombre de prochains matchs à récupérer
    - from_date: Date de début au format YYYY-MM-DD
    - to_date: Date de fin au format YYYY-MM-DD
    - team: Filtrer par équipe (ID de l'équipe)
    - status: Filtrer par statut (NS, FT, LIVE, PST, CANC, etc.)
    """
    
    try:
        # Construction des paramètres pour l'API Football
        api_params = {
            "league": league,
            "season": season
        }
        
        # Ajouter les paramètres optionnels
        if last:
            api_params["last"] = last
        if next:
            api_params["next"] = next
        if from_date:
            api_params["from"] = from_date
        if to_date:
            api_params["to"] = to_date
        if team:
            api_params["team"] = team
        if status:
            api_params["status"] = status
        
        # Si aucune période spécifiée, récupérer les matchs de la saison
        if not any([last, next, from_date, to_date]):
            # Par défaut, récupérer tous les matchs de la saison
            pass
        
        # Appel à l'API Football
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
        
        # Vérifier la structure de réponse
        if "response" not in data:
            raise HTTPException(
                status_code=500,
                detail="Format de réponse API inattendu"
            )
        
        # Log pour debug
        print(f"✅ Matchs récupérés: {len(data['response'])} matchs pour ligue {league}, saison {season}")
        
        return data
        
    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=504,
            detail="Timeout lors de l'appel à l'API Football"
        )
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=503,
            detail=f"Erreur de connexion à l'API Football: {str(e)}"
        )
    except Exception as e:
        print(f"❌ Erreur dans get_matches: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur interne du serveur: {str(e)}"
        )

@router.get("/matches/recent")
async def get_recent_matches(
    league: int = Query(..., description="ID de la ligue"),
    season: int = Query(..., description="Année de la saison"),
    limit: int = Query(10, description="Nombre de matchs récents à récupérer")
):
    """
    Récupère les matchs récents d'une ligue
    """
    return await get_matches(league=league, season=season, last=limit)

@router.get("/matches/upcoming")
async def get_upcoming_matches(
    league: int = Query(..., description="ID de la ligue"),
    season: int = Query(..., description="Année de la saison"),
    limit: int = Query(10, description="Nombre de prochains matchs à récupérer")
):
    """
    Récupère les prochains matchs d'une ligue
    """
    return await get_matches(league=league, season=season, next=limit)

@router.get("/matches/live")
async def get_live_matches(
    league: Optional[int] = Query(None, description="ID de la ligue (optionnel)")
):
    """
    Récupère les matchs en cours
    """
    try:
        api_params = {
            "live": "all"
        }
        
        if league:
            api_params["league"] = league
        
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
        
        print(f"✅ Matchs en cours récupérés: {len(data.get('response', []))} matchs")
        
        return data
        
    except Exception as e:
        print(f"❌ Erreur dans get_live_matches: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la récupération des matchs en cours: {str(e)}"
        )

@router.get("/matches/by-date")
async def get_matches_by_date(
    date: str = Query(..., description="Date des matchs (YYYY-MM-DD)"),
    league: Optional[int] = Query(None, description="ID de la ligue (optionnel)")
):
    """
    Récupère les matchs d'une date spécifique
    """
    try:
        # Vérifier le format de la date
        try:
            datetime.strptime(date, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Format de date invalide. Utilisez YYYY-MM-DD"
            )
        
        api_params = {
            "date": date
        }
        
        if league:
            api_params["league"] = league
        
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
        
        print(f"✅ Matchs du {date} récupérés: {len(data.get('response', []))} matchs")
        
        return data
        
    except Exception as e:
        print(f"❌ Erreur dans get_matches_by_date: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la récupération des matchs: {str(e)}"
        )

@router.get("/matches/{match_id}")
async def get_match_details(match_id: int):
    """
    Récupère les détails d'un match spécifique
    """
    try:
        response = requests.get(
            f"{BASE_URL}/fixtures",
            headers=headers,
            params={"id": match_id},
            timeout=30
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Erreur API Football: {response.status_code}"
            )
        
        data = response.json()
        
        if not data.get("response"):
            raise HTTPException(
                status_code=404,
                detail=f"Match {match_id} non trouvé"
            )
        
        print(f"✅ Détails du match {match_id} récupérés")
        
        return data
        
    except Exception as e:
        print(f"❌ Erreur dans get_match_details: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la récupération du match: {str(e)}"
        )