from fastapi import APIRouter
from httpcore import request
from pydantic import BaseModel

from app.services.rag_service import generate_answer

router = APIRouter()


class ChatRequest(BaseModel):
    question: str
    documents: list[str] = []
    history: list = []


@router.post("/chat")
def chat(request: ChatRequest):

    print("=" * 50)
    print("CHAT REQUEST")
    print("Question:", request.question)
    print("Documents:", request.documents)
    print("=" * 50)

    return generate_answer(
        request.question,
        request.documents,
        request.history

    )