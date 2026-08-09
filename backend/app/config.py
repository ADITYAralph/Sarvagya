import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    NVIDIA_API_KEY: str = os.getenv("NVIDIA_API_KEY", "")
    NVIDIA_BASE_URL: str = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
    NVIDIA_MODEL_NAME: str = os.getenv("NVIDIA_MODEL_NAME", "meta/llama-3.3-70b-instruct")
    
    PORT: int = int(os.getenv("PORT", 8000))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    
    CORS_ORIGINS: list = [
        origin.strip() 
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",") 
        if origin.strip()
    ]
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sarvagya.db")

settings = Settings()
