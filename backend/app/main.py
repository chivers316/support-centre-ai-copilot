from pathlib import Path
from fastapi import FastAPI, UploadFile, File
from app.services.pdf_service import extract_text

app = FastAPI()

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

    return {
        "filename": file.filename,
        "characters": len(text),
        "preview": text[:500]
    }