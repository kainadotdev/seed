from typing import Optional, List
from pydantic import BaseModel


class ChatRequest(BaseModel):
    user_id: str
    seed_id: Optional[str] = None
    message: str
    seed_title: Optional[str] = None
    seed_content: Optional[str] = None
    seed_type: Optional[str] = None
    seed_status: Optional[str] = None
    seed_tags: List[str] = []
    memory_hints: List[str] = []


class ChatResponse(BaseModel):
    reply: str


class EmbeddingRequest(BaseModel):
    text: str


class EmbeddingResponse(BaseModel):
    vector: List[float]
    model: str


class SemanticSearchRequest(BaseModel):
    user_id: str
    query: str
    limit: int = 10


class SemanticSearchResult(BaseModel):
    seed_id: str
    score: float


class SemanticSearchResponse(BaseModel):
    results: List[SemanticSearchResult]
