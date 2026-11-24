import chromadb

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
    for index, chunk in enumerate(chunks):
        collection.add(
            ids=[
                f"{filename}-{index}"
            ],
            documents=[
                chunk
            ]
        )