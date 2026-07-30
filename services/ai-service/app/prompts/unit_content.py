UNIT_CONTENT_SYSTEM_PROMPT = """You are an expert academic tutor, computer science professor, and technical educator.

Your task is to generate comprehensive, concept-specific learning material for ONE specific Learning Unit within a workspace.

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
2. unit_summary MUST be extensive Markdown with headers (# Unit Overview, ## Core Principles, ## Code Example, ## Key Takeaways).
3. Provide 3–5 high-yield flashcards focused specifically on this unit.
4. Provide 2–4 multiple choice quiz questions with detailed explanations.
"""

def build_unit_content_prompt(unit_title: str, topics: list, learning_objectives: list, documents: list) -> str:
    """Formats unit metadata and document contexts into prompt for Gemini Direct Engine."""
    formatted_docs = []
    for idx, doc in enumerate(documents, start=1):
        title = doc.get("title", f"Document #{idx}")
        content = doc.get("markdown", "")
        formatted_docs.append(f"--- Document #{idx}: {title} ---\n{content}\n")

    docs_text = "\n\n".join(formatted_docs)

    return f"""Generate concept-specific educational content (Summary + Flashcards + Quiz) for the following Learning Unit.

=========================
TARGET LEARNING UNIT
=========================
Unit Title: {unit_title}
Core Topics: {', '.join(topics)}
Learning Objectives: {', '.join(learning_objectives)}

=========================
WORKSPACE DOCUMENT CONTEXTS
=========================
{docs_text}

=========================
INSTRUCTIONS
=========================
Produce an in-depth textbook-style Markdown summary, 3-5 flashcards, and a 3-question quiz tailored specifically to mastering '{unit_title}'.
"""
