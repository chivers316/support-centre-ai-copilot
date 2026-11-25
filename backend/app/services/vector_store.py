import chromadb
import uuid

client = chromadb.PersistentClient(
    path="./chroma"
)

collection = client.get_or_create_collection(
    name="documents"
)

def add_chunks(
    filename: str,
    chunks: list[str]
):
    ids = [
        str(uuid.uuid4())
        for _ in chunks
    ]

    metadatas = [
        {
            "source": filename
        }
        for _ in chunks
    ]

    collection.add(
        ids=ids,
        documents=chunks,
        metadatas=metadatas
    )