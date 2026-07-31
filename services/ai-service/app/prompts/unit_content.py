from typing import Optional, List, Dict, Any

UNIT_CONTENT_SYSTEM_PROMPT = """You are an expert academic tutor, computer science professor, and technical educator.

Your task is to generate comprehensive, concept-specific learning material for ONE specific Learning Unit using RAG-retrieved document context as your primary grounding source of truth.

Your response MUST be valid JSON only matching this schema:

{
  "unit_summary": "# Markdown concept synthesis explaining the core theory, mechanics, code examples, best practices, and key takeaways specifically for this unit",
  "flashcards": [
    {
      "question": "string",
      "answer": "string",
      "difficulty": "Easy | Medium | Hard",
      "tags": ["string"]
    }
  ],
  "quiz": {
    "title": "Unit Concept Mastery Quiz",
    "questions": [
      {
        "id": "q1",
        "type": "multiple_choice",
        "question": "string",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct_answer": "Option A",
        "explanation": "string",
        "difficulty": "Easy | Medium | Hard"
      }
    ]
  }
}

Rules:
1. Output valid JSON only.
2. unit_summary MUST be extensive Markdown grounded in the RAG retrieved context with headers (# Unit Overview, ## Core Principles, ## Code Example, ## Key Takeaways).
3. Provide 3–5 high-yield flashcards focused specifically on this unit.
4. Provide 2–4 multiple choice quiz questions with detailed explanations.
"""

def build_unit_content_prompt(
    unit_title: str,
    topics: List[str],
    learning_objectives: List[str],
    rag_chunks: List[Dict[str, Any]],
    position: Optional[str] = None
) -> str:
    """Formats unit metadata and RAG-retrieved grounding chunks into prompt for Gemini."""
    formatted_chunks = []
    for idx, chunk in enumerate(rag_chunks, start=1):
        filename = chunk.get("filename", f"Source #{idx}")
        score = chunk.get("score", 0.0)
        content = chunk.get("content", "")
        formatted_chunks.append(f"--- RAG Retrieved Chunk #{idx} (Source: {filename}, Similarity Score: {score}) ---\n{content}\n")

    chunks_text = "\n\n".join(formatted_chunks) if formatted_chunks else "No specific RAG chunks retrieved. Rely on unit metadata."
    pos_info = f"Position in Roadmap: {position}\n" if position else ""

    return f"""Generate concept-specific educational content (Summary + Flashcards + Quiz) for the following Learning Unit using RAG Grounding Context.

=========================
TARGET LEARNING UNIT
=========================
Unit Title: {unit_title}
{pos_info}Core Topics: {', '.join(topics)}
Learning Objectives: {', '.join(learning_objectives)}

=========================
RAG GROUNDING CONTEXT (Primary Source of Truth)
=========================
{chunks_text}

=========================
INSTRUCTIONS
=========================
Produce an in-depth textbook-style Markdown summary, 3-5 flashcards, and a 3-question quiz tailored specifically to mastering '{unit_title}' grounded strictly on the RAG retrieved context above.
"""
