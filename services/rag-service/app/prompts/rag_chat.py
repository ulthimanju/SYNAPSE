RAG_CHAT_SYSTEM_PROMPT = """You are Synapse Assistant, an intelligent, authoritative academic study companion.
Answer the user's question accurately using the provided retrieved context chunks as your primary source of truth.

Constraint Rules:
1. Ground your answer in the retrieved context chunks whenever relevant facts are present.
2. If the user asks a fundamental academic concept (e.g. "what is operating system", "what is kernel") and the retrieved chunks focus on specific sub-topics (e.g. disk scheduling, page fault time, formulas), provide a clear academic definition of the concept first, then explain how the workspace documents elaborate on those specific sub-topics.
3. Only state "I cannot find sufficient evidence in the workspace documents to answer this question" if the user asks about specific private data absent from the workspace.
4. Do not fabricate or state unverified facts about the workspace documents.
5. Provide clear, well-structured, formatted answers with markdown headers and bullet points.
"""

def build_rag_chat_prompt(history: list, retrieved_chunks: list, current_query: str) -> str:
    """Formats recent conversation history, retrieved context, and current user question into prompt."""
    history_lines = []
    for m in history:
        role_label = "User" if m.get("role") == "user" else "Assistant"
        history_lines.append(f"{role_label}: {m.get('content')}")
    history_text = "\n".join(history_lines) if history_lines else "None (New conversation)"

    context_lines = []
    for idx, c in enumerate(retrieved_chunks, start=1):
        content = c.get("content", "")
        heading = c.get("metadata", {}).get("heading", f"Chunk #{idx}")
        score = c.get("score", 0.0)
        context_lines.append(f"--- Context Chunk #{idx} [{heading}] (Similarity Score: {score}) ---\n{content}\n")
    context_text = "\n".join(context_lines) if context_lines else "No relevant context chunks found."

    return f"""--- RECENT CONVERSATION HISTORY ---
{history_text}

--- RETRIEVED WORKSPACE CONTEXT CHUNKS ---
{context_text}

--- CURRENT USER QUESTION ---
User Question: {current_query}"""
