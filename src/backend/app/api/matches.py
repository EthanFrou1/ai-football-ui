from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import date, datetime, timedelta
from app.models.match import MatchPreview, MatchDetail
from app.services.football_api import football_service

router = APIRouter(prefix="/matches", tags=["matches"])

@router.get("/today", response_model=List[MatchPreview])
async def get_today_matches():
    """
    Récupérer les matchs d'aujourd'hui
    """
    try:
        matches = await football_service.get_matches_by_date(date.today())
        return matches
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")

@router.get("/by-date", response_model=List[MatchPreview])
async def get_matches_by_date(
    match_date: str = Query(..., description="Date au format YYYY-MM-DD")
):
    """
    Récupérer les matchs d'une date spécifique
    """
    try:
        # Parser la date
        parsed_date = datetime.strptime(match_date, "%Y-%m-%d").date()
        matches = await football_service.get_matches_by_date(parsed_date)
        return matches
    except ValueError:
        raise HTTPException(status_code=400, detail="Format de date invalide. Utilisez YYYY-MM-DD")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")

@router.get("/upcoming", response_model=List[MatchPreview])
async def get_upcoming_matches(
    days: int = Query(7, description="Nombre de jours à partir d'aujourd'hui", ge=1, le=30)
):
    """
    Récupérer les matchs à venir pour les prochains jours
    """
    try:
        all_matches = []
        current_date = date.today()
        
        # Récupérer les matchs pour chaque jour
        import asyncio
        tasks = []
        for i in range(days):
            target_date = current_date + timedelta(days=i)
            tasks.append(football_service.get_matches_by_date(target_date))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for result in results:
            if isinstance(result, list):
                all_matches.extend(result)
        
        # Filtrer les matchs à venir uniquement
        now = datetime.now()
        upcoming_matches = [
            match for match in all_matches 
            if match.date > now and match.status.lower() in ["not started", "à disputer", "match postponed"]
        ]
        
        # Trier par date
        upcoming_matches.sort(key=lambda x: x.date)
        
        return upcoming_matches[:20]  # Limiter à 20 matchs
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")

@router.get("/recent", response_model=List[MatchPreview])
async def get_recent_matches(
    days: int = Query(7, description="Nombre de jours avant aujourd'hui", ge=1, le=30)
):
    """
    Récupérer les matchs récents des derniers jours
    """
    try:
        all_matches = []
        current_date = date.today()
        
        # Récupérer les matchs pour chaque jour passé
        import asyncio
        tasks = []
        for i in range(1, days + 1):
            target_date = current_date - timedelta(days=i)
            tasks.append(football_service.get_matches_by_date(target_date))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for result in results:
            if isinstance(result, list):
                all_matches.extend(result)
        
        # Filtrer les matchs terminés uniquement
        finished_matches = [
            match for match in all_matches 
            if match.status.lower() in ["match finished", "après prolongation", "aux tirs au but", "terminé"]
        ]
        
        # Trier par date (plus récent en premier)
        finished_matches.sort(key=lambda x: x.date, reverse=True)
        
        return finished_matches[:20]  # Limiter à 20 matchs
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")

@router.get("/{match_id}", response_model=MatchDetail)
async def get_match(match_id: int):
    """
    Récupérer les détails complets d'un match par son ID
    """
    try:
        match = await football_service.get_match_by_id(match_id)
        if not match:
            raise HTTPException(status_code=404, detail="Match non trouvé")
        return match
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")

@router.get("/team/{team_id}", response_model=List[MatchPreview])
async def get_team_matches(
    team_id: int,
    season: int = Query(2024, description="Saison"),
    last: int = Query(10, description="Nombre de derniers matchs", ge=1, le=50)
):
    """
    Récupérer les derniers matchs d'une équipe
    """
    try:
        # Cette endpoint nécessiterait une implémentation spécifique dans le service
        # Pour l'instant, on retourne une liste vide avec un message
        raise HTTPException(
            status_code=501, 
            detail="Fonctionnalité à implémenter - récupération des matchs par équipe"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")