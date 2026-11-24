from app.services.chunk_service import chunk_text

sample = """
Hello world
""" * 1000

chunks = chunk_text(sample)

print(len(chunks))