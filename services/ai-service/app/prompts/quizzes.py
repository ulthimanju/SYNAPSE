from typing import List, Dict, Any

QUIZZES_SYSTEM_PROMPT = """You are an expert AI Assessment & Examination Specialist for the Synapse Platform.
Your task is to generate a multiple-choice quiz based on RAG-retrieved document context and learning path units.

Constraint Rules:
1. Output ONLY valid JSON matching this schema:
{
  "workspace_id": "<Workspace ID>",
  "questions": [
    {
      "id": "q-1",
      "unit_id": "<Originating Unit ID>",
      "type": "multiple_choice",
      "question": "<Multiple Choice Question Text>",
      "options": [
        "<Option A>",
        "<Option B>",
        "<Option C>",
        "<Option D>"
      ],
      "correct_answer": "<Exact string matching one of the options>",
      "explanation": "<Clear detailed explanation why this answer is correct>",
      "difficulty": "<Easy | Medium | Hard>",
      "learning_objective": "<Target Learning Objective>"
    }
  ]
}
2. Ensure options are distinct and plausible distractors are provided.
3. Questions and explanations MUST be grounded directly in the RAG retrieved source content.
4. Do not wrap in markdown codeblocks.
"""

def build_quizzes_prompt(workspace_id: str, learning_path: dict, flashcards: list, rag_chunks: List[Dict[str, Any]] = None) -> str:
    """Formats learning path, flashcards, and RAG grounding context into prompt for Gemini."""
    lp_title = learning_path.get("title", "Workspace Subject")
    units = learning_path.get("units", [])
    
    formatted_units = []
    for u in units:
        u_id = u.get("id", "unit-1")
        u_title = u.get("title", "")
        u_objs = ", ".join(u.get("learning_objectives", []))
        formatted_units.append(f"Unit ID: {u_id} | Title: {u_title}\nObjectives: {u_objs}\n")
    
    formatted_cards = []
    for c in flashcards[:5]:
        formatted_cards.append(f"Q: {c.get('question')} -> A: {c.get('answer')}")

    formatted_chunks = []
    if rag_chunks:
        for idx, chunk in enumerate(rag_chunks, start=1):
            filename = chunk.get("filename", f"Source #{idx}")
            score = chunk.get("score", 0.0)
            content = chunk.get("content", "")
            formatted_chunks.append(f"--- RAG Grounding Chunk #{idx} ({filename}, Score: {score}) ---\n{content}\n")

    units_text = "\n".join(formatted_units)
    cards_text = "\n".join(formatted_cards) if formatted_cards else "N/A"
    chunks_text = "\n\n".join(formatted_chunks) if formatted_chunks else "No specific RAG chunks retrieved."
    
    return f"""Generate a multiple-choice quiz for Workspace '{workspace_id}' (Subject: {lp_title}) using RAG Grounding Context.

=========================
LEARNING ROADMAP UNITS
=========================
{units_text}

=========================
RAG GROUNDING CONTEXT (Primary Source of Truth)
=========================
{chunks_text}

=========================
STUDY CONCEPT FLASHCARDS CONTEXT
=========================
{cards_text}
"""
