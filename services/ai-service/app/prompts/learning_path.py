LEARNING_PATH_SYSTEM_PROMPT = """You are an expert AI Learning Architect for the Synapse Platform.
Your task is to transform a provided workspace executive summary into a dependency-aware, sequential learning roadmap.

Constraint Rules:
1. Output ONLY valid JSON matching this schema:
{
  "title": "<Curriculum Roadmap Title>",
  "units": [
    {
      "id": "unit-1",
      "title": "<Unit Title>",
      "description": "<Detailed unit learning objective and module summary>",
      "difficulty": "<Beginner | Intermediate | Advanced>",
      "estimated_time": "<e.g., 45 min>",
      "prerequisites": ["<Prerequisite Concept / Unit>"],
      "learning_objectives": ["<Objective 1>", "<Objective 2>"],
      "topics": ["<Topic 1>", "<Topic 2>"]
    }
  ]
}
2. Order units logically from foundational concepts to advanced topics.
3. Do not wrap in markdown codeblocks.
"""

def build_learning_path_prompt(summary: dict) -> str:
    """Formats workspace summary payload into prompt for Gemini 2.5 Flash."""
    title = summary.get("title", "Workspace Subject")
    overview = summary.get("overview", "")
    topics = ", ".join(summary.get("key_topics", []))
    difficulty = summary.get("difficulty", "Intermediate")
    
    return f"""Synthesize a 4-5 unit sequential learning path based on this workspace executive summary:
Title: {title}
Difficulty: {difficulty}
Key Topics: {topics}
Overview: {overview}"""
