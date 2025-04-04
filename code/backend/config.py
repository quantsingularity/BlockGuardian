from pydantic import BaseSettings

class Settings(BaseSettings):
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    MONGODB_URI: str = "mongodb://localhost:27017"
    ETHSCAN_API_KEY: str = ""
    
    class Config:
        env_file = ".env"

settings = Settings()