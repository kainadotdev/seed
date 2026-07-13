from fastapi import APIRouter
from app.schemas import ChatRequest, ChatResponse
from app.ai_engine import generate_reply

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(payload: ChatRequest) -> ChatResponse:
    """Endpoint de conversa com a IA de uma Seed (ou conversa global).

    Usa `app.ai_engine`, que já entende intenção (checklist, plano, resumo,
    melhoria, transformação, perguntas de desenvolvimento) e responde com
    base no conteúdo real da Seed e em pistas de memória enviadas pelo
    backend (Seeds parecidas antigas, Seeds paradas há muito tempo).

    A IA nunca decide sozinha: ela sugere, pergunta e organiza — quem decide
    é sempre o usuário.
    """
    reply = generate_reply(payload)
    return ChatResponse(reply=reply)
