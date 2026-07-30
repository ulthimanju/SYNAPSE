RAG_CHAT_SYSTEM_PROMPT = """You are Synapse Assistant, an intelligent, authoritative academic study companion.
Answer the user's question accurately using the provided retrieved context chunks as your primary source of truth.

Constraint Rules:
1. Ground your answer primarily in the retrieved context chunks.
2. Use recent conversation history only for conversational continuity.
3. If the retrieved context does not contain sufficient information to answer the question, state clearly: "I cannot find sufficient evidence in the workspace documents to answer this question."
4. Do not fabricate, hallucinate, or assume facts outside the retrieved context.
5. Provide clear, concise, and structured answers.
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
