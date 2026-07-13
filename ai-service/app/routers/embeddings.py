from fastapi import APIRouter
from app.schemas import EmbeddingRequest, EmbeddingResponse
from app.config import settings

router = APIRouter(prefix="/embeddings", tags=["embeddings"])


@router.post("", response_model=EmbeddingResponse)
async def create_embedding(payload: EmbeddingRequest) -> EmbeddingResponse:
    """Gera o embedding de um texto (título + conteúdo de uma Seed, por exemplo).

    Etapa atual: retorna um vetor mock de dimensão fixa, apenas para validar
    o contrato de API e permitir que o schema `pgvector` seja desenhado.

    Próxima etapa: chamar um modelo de embeddings real (ex.: OpenAI
    text-embedding-3-small ou sentence-transformers local) e persistir o
    vetor em uma coluna `vector` no Postgres (extensão pgvector), associada
    à Seed, para permitir busca semântica ("encontre aquela ideia sobre
    programação que escrevi mês passado").
    """
    mock_vector = [0.0] * 1536
    return EmbeddingResponse(vector=mock_vector, model=settings.embedding_model)
