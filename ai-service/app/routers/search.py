from fastapi import APIRouter
from app.schemas import SemanticSearchRequest, SemanticSearchResponse

router = APIRouter(prefix="/search", tags=["search"])


@router.post("", response_model=SemanticSearchResponse)
async def semantic_search(payload: SemanticSearchRequest) -> SemanticSearchResponse:
    """Busca semântica sobre as Seeds do usuário.

    Etapa atual: retorna lista vazia (placeholder do contrato de API).

    Próxima etapa: embutir `payload.query`, comparar via similaridade de
    cosseno (pgvector) contra os embeddings das Seeds do usuário e retornar
    os IDs mais relevantes, que o backend NestJS usará para montar a resposta
    final com os dados completos das Seeds.
    """
    return SemanticSearchResponse(results=[])
