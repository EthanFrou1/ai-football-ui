from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from app.config.settings import settings
from app.api.teams import router as teams_router
from app.api.matches import router as matches_router

from app.api.standings import router as standings_router 

# Créer l'application FastAPI
app = FastAPI(
    title="Football API Backend",
    description="API Backend pour l'application Football avec React",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuration CORS pour permettre les requêtes depuis le frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Middleware pour gérer les erreurs globalement
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Erreur interne du serveur: {str(exc)}"}
    )

# Routes principales
@app.get("/")
async def root():
    """
    Endpoint de base pour vérifier que l'API fonctionne
    """
    return {
        "message": "🚀 Football API Backend is running!",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "teams": "/teams",
            "matches": "/matches",
            "standings": "/standings"  # ← NOUVEAU
        }
    }

@app.get("/health")
async def health_check():
    """
    Endpoint de vérification de la santé de l'API
    """
    return {
        "status": "healthy",
        "api_version": "1.0.0",
        "football_api": "connected" if settings.football_api_key else "not configured"
    }

# Inclure les routers
app.include_router(teams_router, prefix="/api")
app.include_router(matches_router, prefix="/api")
app.include_router(standings_router, prefix="/api")  # ← NOUVEAU

# Point d'entrée pour le développement
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info"
    )