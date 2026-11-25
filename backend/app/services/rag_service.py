from app.services.vector_store import collection

from openai import OpenAI
from dotenv import load_dotenv

import os

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)


def retrieve_context(question: str):

    results = collection.query(
        query_texts=[question],
        n_results=3
    )

    documents = results["documents"][0]
    metadatas = results["metadatas"][0]

    print("DOCUMENTS FOUND:")
    print(documents)

    print("METADATAS FOUND:")
    print(metadatas)

    source = None

    if metadatas:
        first_metadata = metadatas[0]

        if first_metadata and "source" in first_metadata:
            source = first_metadata["source"]

    return {
        "context": "\n\n".join(documents),
        "source": source
    }


def generate_answer(question: str):

    result = retrieve_context(question)

    context = result["context"]
    source = result["source"]

    prompt = f"""
You are a support centre AI assistant.

Answer the user's question in a complete sentence using only the supplied context.

If the answer cannot be found in the context, say:

'I could not find that information in the uploaded documents.'

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