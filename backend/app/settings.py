from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    postgres_user: str = "finuser"
    postgres_password: str = "finpassword"
    postgres_db: str = "fincompliance"
    postgres_host: str = "postgres"
    postgres_port: int = 5432

    mongo_url: str = "mongodb://mongo:27017"
    mongo_db: str = "fincompliance"

    chroma_host: str = "chroma"
    chroma_port: int = 8000
    chroma_collection: str = "compliance_policies_v1"

    event_service_url: str = "http://event-service:3001"

    ollama_base_url: str = "http://host.docker.internal:11434"
    ollama_model: str = "gemma3:4b"
    ollama_embedding_model: str = "embeddinggemma"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()
