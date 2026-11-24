# app/test_rag.py

from app.services.rag_service import generate_answer

answer = generate_answer(
    "When did Stephen complete the course?"
)

print(answer)
