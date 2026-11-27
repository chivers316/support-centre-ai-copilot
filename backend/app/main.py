from pathlib import Path
from fastapi import FastAPI, UploadFile, File
from app.services.pdf_service import extract_text
from app.services.chunk_service import chunk_text
from app.services.vector_store import add_chunks
from app.routes.chat import router as chat_router
from fastapi.middleware.cors import CORSMiddleware
from app.routes.documents import router as documents_router

app = FastAPI()

@app.on_event("startup")
def load_knowledge_base():
    pass

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(documents_router)

app.include_router(chat_router)

UPLOAD_FOLDER = Path("uploads")
UPLOAD_FOLDER.mkdir(exist_ok=True)


@app.get("/")
async def root():
    return {
        "message": "Support Centre AI Copilot API"
    }


@app.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...)
):
    file_path = UPLOAD_FOLDER / file.filename

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    text = extract_text(str(file_path))

    chunks = chunk_text(text)

    add_chunks(
        file.filename,
        chunks
    )

    return {
        "filename": file.filename,
        "characters": len(text),
        "chunks_created": len(chunks)
    }