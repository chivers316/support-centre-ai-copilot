from pathlib import Path

from fastapi import APIRouter, HTTPException

router = APIRouter()

UPLOAD_FOLDER = Path("uploads")


@router.get("/documents")
def get_documents():

    files = []

    if UPLOAD_FOLDER.exists():

        for file in UPLOAD_FOLDER.glob("*.pdf"):

            files.append(file.name)

    return {
        "documents": sorted(files)
    }


@router.delete("/documents/{filename}")
def delete_document(filename: str):

    file_path = UPLOAD_FOLDER / filename

    if not file_path.exists():

        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    file_path.unlink()

    return {
        "message": f"{filename} deleted"
    }