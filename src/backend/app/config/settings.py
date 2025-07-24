from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # API Football
    football_api_key: str
    football_api_base_url: str = "https://v3.football.api-sports.io"
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True
    
    # CORS - Valeurs par défaut directement dans le code
    allowed_origins: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    class Config:
        env_file = ".env"

settings = Settings()