from fastapi import FastAPI
from app.routers import chat, embeddings, search

app = FastAPI(
    title="Seed AI Service",
    description=(
        "Serviço de IA do Seed. Isolado do backend principal (NestJS) para "
        "permitir evolução independente do stack de IA (Python/embeddings/"
        "modelos), sem acoplar a aplicação transacional."
    ),
    version="0.1.0",
)

app.include_router(chat.router)
app.include_router(embeddings.router)
app.include_router(search.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "seed-ai-service"}
