QUIZZES_SYSTEM_PROMPT = """You are an expert AI Assessment & Examination Specialist for the Synapse Platform.
Your task is to generate a 5-6 question multiple-choice quiz based on the provided workspace learning path units and study flashcards.

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
3. Vary question difficulty across the assessment.
4. Do not wrap in markdown codeblocks.
"""

def build_quizzes_prompt(workspace_id: str, learning_path: dict, flashcards: list) -> str:
    """Formats learning path and flashcards into prompt for Gemini 2.5 Flash."""
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

    units_text = "\n".join(formatted_units)
    cards_text = "\n".join(formatted_cards)
    
    return f"""Generate a multiple-choice quiz for Workspace '{workspace_id}' (Subject: {lp_title}).

Learning Roadmap Units:
{units_text}

Study Concept Flashcards Context:
{cards_text}"""
