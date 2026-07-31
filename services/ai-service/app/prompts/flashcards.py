from typing import List, Dict, Any

FLASHCARDS_SYSTEM_PROMPT = """You are an expert AI Learning & Memory Specialist for the Synapse Platform.
Your task is to transform a provided workspace learning path and RAG-retrieved document context into high-quality, grounded conceptual flashcards.

Constraint Rules:
1. Output ONLY valid JSON matching this schema:
{
  "flashcards": [
    {
      "id": "card-1",
      "unit_id": "<Originating Unit ID>",
      "question": "<Conceptual Question>",
      "answer": "<Concise, precise answer>",
      "difficulty": "<Easy | Medium | Hard>",
      "tags": ["<Tag 1>", "<Tag 2>"]
    }
  ]
}
2. Ensure flashcards are grounded directly in the RAG retrieved source content.
3. Keep answers concise, clear, and unambiguous.
4. Do not wrap in markdown codeblocks.
"""

def build_flashcards_prompt(learning_path: dict, rag_chunks: List[Dict[str, Any]] = None) -> str:
    """Formats learning path payload and RAG grounding context into prompt for Gemini."""
    title = learning_path.get("title", "Workspace Subject")
    units = learning_path.get("units", [])
    
    formatted_units = []
    for u in units:
        u_id = u.get("id", "unit-1")
        u_title = u.get("title", "")
        u_topics = ", ".join(u.get("topics", []))
        u_objs = ", ".join(u.get("learning_objectives", []))
        formatted_units.append(f"Unit ID: {u_id} | Title: {u_title}\nTopics: {u_topics}\nObjectives: {u_objs}\n")
    
    units_text = "\n".join(formatted_units)

    formatted_chunks = []
    if rag_chunks:
        for idx, chunk in enumerate(rag_chunks, start=1):
            filename = chunk.get("filename", f"Source #{idx}")
            score = chunk.get("score", 0.0)
            content = chunk.get("content", "")
            formatted_chunks.append(f"--- RAG Grounding Chunk #{idx} ({filename}, Score: {score}) ---\n{content}\n")
    
    chunks_text = "\n\n".join(formatted_chunks) if formatted_chunks else "No specific RAG chunks retrieved."

    return f"""Generate 6-8 conceptual flashcards based on this learning roadmap and RAG Grounding Context:

=========================
LEARNING ROADMAP
=========================
Roadmap Title: {title}
{units_text}

=========================
RAG GROUNDING CONTEXT (Primary Source of Truth)
=========================
{chunks_text}
"""
