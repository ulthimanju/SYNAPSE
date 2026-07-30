FLASHCARDS_SYSTEM_PROMPT = """You are an expert AI Learning & Memory Specialist for the Synapse Platform.
Your task is to transform a provided workspace learning path into a set of high-quality, conceptual flashcards.

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
2. Ensure every learning unit has at least 2 conceptual flashcards.
3. Keep answers concise, clear, and unambiguous.
4. Do not wrap in markdown codeblocks.
"""

def build_flashcards_prompt(learning_path: dict) -> str:
    """Formats learning path payload into prompt for Gemini 2.5 Flash."""
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
    return f"Generate 6-8 conceptual flashcards based on this learning roadmap:\nRoadmap Title: {title}\n\n{units_text}"
