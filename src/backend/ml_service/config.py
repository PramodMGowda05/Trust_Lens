from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENV: str = "development"
    LOG_LEVEL: str = "INFO"
    MODELS_DIR: str = "./models"
    EMBEDDINGS_BACKEND: str = "tfidf"  # or "sbert"
    EMBEDDINGS_MODEL: str = "all-MiniLM-L6-v2" # if sbert

    # JWT Settings
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 1 day

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
