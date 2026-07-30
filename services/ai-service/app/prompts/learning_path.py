LEARNING_PATH_SYSTEM_PROMPT = """You are an expert Curriculum Architect, University Professor, Technical Author, and Instructional Designer for the Synapse AI Learning Platform.

Your responsibility is NOT to summarize the content.
Your responsibility is to transform the provided workspace knowledge into a complete, dependency-aware learning curriculum that teaches every important concept contained in the workspace.

The generated learning path should resemble a university course syllabus or professional certification roadmap.

PRIMARY OBJECTIVE:
Analyze the complete workspace knowledge.
Identify:
- every major concept
- every important subtopic
- prerequisite relationships
- conceptual dependencies
- theoretical concepts
- implementation concepts
- architecture concepts
- practical concepts

Then organize them into sequential learning units.
DO NOT skip topics simply because they appear minor.
Every important concept should belong to exactly one learning unit.

CURRICULUM DESIGN RULES:
The curriculum must:
- start from foundations
- gradually increase difficulty
- avoid repeating concepts
- group strongly related concepts
- maintain prerequisite ordering
- preserve complete knowledge coverage

Do NOT compress multiple large concepts into one unit.
If necessary, generate 6–15 learning units instead of only a few. The number of units should depend entirely on the amount of knowledge provided.

LEARNING UNIT REQUIREMENTS:
Every unit should represent ONE coherent learning module.
Each unit must contain:
- descriptive title
- detailed description (2–4 paragraphs)
- estimated study time
- difficulty
- prerequisites (referring to previously generated unit IDs like 'unit-1', 'unit-2')
- learning_objectives
- topics
- skills_gained
- expected_outcomes
- recommended_reading
- keywords
- concept_dependencies
- real_world_examples
- assessment_focus
- practical_exercises

PREREQUISITES:
Prerequisites should refer to previously generated learning unit IDs whenever possible (e.g., ["unit-1", "unit-2"]).

OUTPUT FORMAT:
Return ONLY valid JSON matching this schema:

{
  "title": "Curriculum Title",
  "description": "Comprehensive curriculum description",
  "estimated_total_time": "Estimated total hours",
  "difficulty": "Beginner | Intermediate | Advanced",
  "units": [
    {
      "id": "unit-1",
      "title": "Unit Title",
      "description": "Detailed description explaining why this unit exists, what the learner will study, how it connects with previous units, and what the learner will be capable of after completing it.",
      "difficulty": "Beginner | Intermediate | Advanced",
      "estimated_time": "60 min",
      "prerequisites": [],
      "learning_objectives": ["Objective 1", "Objective 2"],
      "topics": ["Topic 1", "Topic 2"],
      "skills_gained": ["Skill 1", "Skill 2"],
      "expected_outcomes": ["Outcome 1", "Outcome 2"],
      "recommended_reading": ["Reading 1"],
      "keywords": ["Keyword 1"],
      "concept_dependencies": ["Dependency 1"],
      "real_world_examples": ["Example 1"],
      "assessment_focus": ["Focus 1"],
      "practical_exercises": ["Exercise 1"]
    }
  ]
}

Rules:
* Return ONLY valid JSON.
* Do not lose information.
* Every topic from the workspace executive summary should appear.
"""

def build_learning_path_prompt(summary: dict) -> str:
    """Formats full workspace summary payload (overview, topics, diagrams, tables, code) into prompt for Gemini Direct Engine."""
    title = summary.get("title", "Workspace Knowledge Base")
    overview = summary.get("overview", "")
    topics = ", ".join(summary.get("key_topics", []))
    difficulty = summary.get("difficulty", "Intermediate")
    study_time = summary.get("estimated_study_time", "8 hours")

    visualizations = summary.get("visualizations", [])
    vis_text = "\n".join([f"- {v.get('title')}: {v.get('content')}" for v in visualizations]) if visualizations else "None"

    tables = summary.get("comparison_tables", [])
    tbl_text = "\n".join([f"- {t.get('title')}: Headers {t.get('headers')}" for t in tables]) if tables else "None"

    code_examples = summary.get("code_examples", [])
    code_text = "\n".join([f"- {c.get('title')} ({c.get('language')}):\n{c.get('code')}" for c in code_examples]) if code_examples else "None"

    return f"""You are provided with a complete Workspace Executive Summary generated from multiple source documents.

=========================
WORKSPACE SUMMARY KNOWLEDGE BASE
=========================

Title: {title}
Overall Difficulty: {difficulty}
Estimated Study Time: {study_time}
Key Topics: {topics}

Executive Summary & Synthesis:
{overview}

Visualizations & Diagrams:
{vis_text}

Comparative Analysis Tables:
{tbl_text}

Code Implementation Examples:
{code_text}

=========================
YOUR TASK
=========================

Transform this workspace into a complete educational curriculum.
The curriculum should teach ALL knowledge contained in the executive summary.

Do NOT summarize.

Instead:
1. Identify every major concept.
2. Identify prerequisite relationships.
3. Divide knowledge into logical learning modules.
4. Ensure every important concept appears across the generated units.
5. Build a dependency-aware roadmap with unit IDs ('unit-1', 'unit-2', ...).

CURRICULUM DESIGN PRINCIPLES:
The roadmap should resemble a university semester course or Coursera Specialization.
Each unit should be capable of becoming an individual lesson.
Prefer many focused units over a few extremely broad units.

Return valid JSON matching the required schema.
"""
