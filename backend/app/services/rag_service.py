from app.services.vector_store import collection

from openai import OpenAI
from dotenv import load_dotenv

import os

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)


def retrieve_context(question: str, selected_documents: list[str] = []):
    
    results = collection.query(
        query_texts=[question],
        n_results=10
    )

    documents_found = results["documents"][0]
    metadatas = results["metadatas"][0]

    print("DOCUMENTS FOUND:")
    print(documents_found)

    print("SELECTED DOCUMENTS:")
    print(selected_documents)

    print("METADATAS FOUND:")
    print(metadatas)

    filtered_documents = []
    filtered_metadatas = []

    if selected_documents:

        for doc, metadata in zip(
            documents_found,
            metadatas
        ):

            if (
                metadata and
                metadata.get("source") in selected_documents
            ):
                filtered_documents.append(doc)
                filtered_metadatas.append(metadata)

        documents_found = filtered_documents
        metadatas = filtered_metadatas

    source = None

    if metadatas:
        first_metadata = metadatas[0]

        if (
            first_metadata and
            "source" in first_metadata
        ):
            source = first_metadata["source"]

    return {
        "context": "\n\n".join(documents_found),
        "source": source
    }


def generate_answer(question: str, documents: list[str] = [], history: list = []):

    history_text = ""

    for message in history[-6:]:

        history_text += (
            f"{message['role']}: "
            f"{message['content']}\n"
        )

    result = retrieve_context(question, documents)

    context = result["context"]
    source = result["source"]

    prompt = f"""
You are a support centre AI assistant.

Use both the supplied context and the conversation history.

Answer the user's question in a complete sentence.

If the answer cannot be found in the context, say:

'I could not find that information in the uploaded documents.'

Conversation History:

{history_text}

Context:
{context}

Question:
{question}
"""

    response = client.chat.completions.create(
        model="openrouter/free",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return {
        "answer": response.choices[0].message.content,
        "source": source
    }