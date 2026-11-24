from app.services.vector_store import collection

collection.add(
    ids=["1"],
    documents=[
        "Stephen completed the Recognising and Managing Anaphylaxis course on 29 October 2026."
    ]
)

results = collection.query(
    query_texts=[
        "When did Stephen complete the course?"
    ],
    n_results=1
)

print(results)