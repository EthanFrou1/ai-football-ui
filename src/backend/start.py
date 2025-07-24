#!/usr/bin/env python3
"""
Script de démarrage pour le backend Football API
"""
import os
import sys
import subprocess
from pathlib import Path

def check_python_version():
    """Vérifier la version de Python"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ requis")
        sys.exit(1)
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor}")

def check_env_file():
    """Vérifier si le fichier .env existe"""
    env_file = Path(".env")
    if not env_file.exists():
        print("❌ Fichier .env manquant")
        print("📝 Créez un fichier .env avec votre clé API:")
        print("FOOTBALL_API_KEY=your_api_key_here")
        return False
    print("✅ Fichier .env trouvé")
    return True

def install_dependencies():
    """Installer les dépendances"""
    print("📦 Installation des dépendances...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dépendances installées")
        return True
    except subprocess.CalledProcessError:
        print("❌ Erreur lors de l'installation des dépendances")
        return False

def start_server():
    """Démarrer le serveur"""
    print("🚀 Démarrage du serveur...")
    try:
        subprocess.call([sys.executable, "-m", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"])
    except KeyboardInterrupt:
        print("\n👋 Arrêt du serveur")

def main():
    """Fonction principale"""
    print("🏈 Football API Backend")
    print("=" * 30)
    
    # Vérifications
    check_python_version()
    
    if not check_env_file():
        return
    
    # Installation des dépendances
    if not install_dependencies():
        return
    
    # Démarrage du serveur
    print("\n🌐 Serveur disponible sur:")
    print("   - Local: http://localhost:8000")
    print("   - Docs: http://localhost:8000/docs")
    print("   - ReDoc: http://localhost:8000/redoc")
    print("\n⚡ Appuyez sur Ctrl+C pour arrêter")
    
    start_server()

if __name__ == "__main__":
    main()