import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Configurações centralizadas do ai-service.

    Nenhuma chave de provedor de IA é usada ainda — os campos abaixo
    já preparam o terreno para a próxima etapa (LLM real + embeddings).
    """

    port: int = int(os.getenv("PORT", "8000"))
    database_url: str = os.getenv("DATABASE_URL", "")  # mesmo Postgres do backend (via pgvector)
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    embedding_model: str = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")


settings = Settings()
