import logging
from typing import Optional, List, Dict, Any
from shared.exceptions import NotFoundException
from ..repositories.conversation_repository import ConversationRepository
from ..repositories.message_repository import MessageRepository
from .retrieval_service import RetrievalService
from ..prompts.rag_chat import RAG_CHAT_SYSTEM_PROMPT, build_rag_chat_prompt

logger = logging.getLogger(__name__)

class ChatService:
    """Service layer managing Singleton Workspace RAG Chat."""

    def __init__(
        self,
        conv_repo: Optional[ConversationRepository] = None,
        msg_repo: Optional[MessageRepository] = None,
        retrieval_service: Optional[RetrievalService] = None,
    ):
        self.conv_repo = conv_repo or ConversationRepository()
        self.msg_repo = msg_repo or MessageRepository()
        self.retrieval_service = retrieval_service or RetrievalService()

    async def process_chat(self, workspace_id: str, query: str) -> Dict[str, Any]:
        """Processes a chat turn for the singleton workspace conversation."""
        # 1. Retrieve or create singleton conversation
        conv = await self.conv_repo.get_or_create_conversation(workspace_id)
        conv_id = str(conv.id)

        # 2. Retrieve recent message history (last 10 messages)
        history_objs = await self.msg_repo.get_recent_messages(conv_id, limit=10)
        history = [{"role": m.role, "content": m.content} for m in history_objs]

        # 3. Retrieve relevant vector context chunks via RetrievalService
        retrieval_resp = await self.retrieval_service.retrieve_similar_chunks(
            workspace_id=workspace_id,
            query=query,
            top_k=5
        )
        chunks = [r.dict() for r in retrieval_resp.results]

        # Extract lightweight source references with document filenames
        sources = []
        for r in retrieval_resp.results:
            heading = r.metadata.get("heading") if r.metadata else None
            doc_filename = getattr(r, "filename", None) or (r.metadata.get("filename") if r.metadata else None) or f"Document {r.document_id[:8]}"
            
            if heading and heading != "/":
                clean_heading = f"{doc_filename} > {heading}"
            else:
                clean_heading = doc_filename

            sources.append({
                "chunk_id": r.chunk_id,
                "document_id": r.document_id,
                "filename": doc_filename,
                "score": r.score,
                "heading": clean_heading,
            })

        # 4. Build RAG prompt
        prompt = build_rag_chat_prompt(history, chunks, query)

        # 5. Generate answer using Gemini Flash AI Provider with grounded chunk synthesis fallback
        answer = await self._generate_llm_answer(prompt, chunks)

        # 6. Save user message & assistant message in MongoDB
        await self.msg_repo.add_message(
            conversation_id=conv_id,
            role="user",
            content=query
        )
        assistant_msg = await self.msg_repo.add_message(
            conversation_id=conv_id,
            role="assistant",
            content=answer,
            sources=sources
        )

        return {
            "answer": answer,
            "sources": sources,
            "message_id": str(assistant_msg.id),
        }

    async def get_history(self, workspace_id: str) -> List[Dict[str, Any]]:
        """Retrieves history for the singleton workspace conversation."""
        conv = await self.conv_repo.get_or_create_conversation(workspace_id)
        conv_id = str(conv.id)
        messages = await self.msg_repo.get_recent_messages(conv_id, limit=50)
        return [
            {
                "id": str(m.id),
                "role": m.role,
                "content": m.content,
                "sources": m.sources,
                "created_at": m.created_at.isoformat() if m.created_at else None,
            }
            for m in messages
        ]

    async def clear_history(self, workspace_id: str) -> None:
        """Deletes all messages for the workspace conversation while preserving conversation record."""
        conv = await ConversationRepository().get_or_create_conversation(workspace_id)
        conv_id = str(conv.id)
        deleted = await self.msg_repo.delete_conversation_messages(conv_id)
        logger.info(f"Cleared {deleted} chat messages for workspace {workspace_id}")

    async def _generate_llm_answer(self, prompt: str, chunks: Optional[List[Dict[str, Any]]] = None) -> str:
        """Calls Gemini Flash models with grounded chunk text synthesis fallback on rate limit."""
        try:
            import os
            import google.generativeai as genai
            api_key = os.getenv("GEMINI_API_KEY", "")
            if api_key:
                genai.configure(api_key=api_key)
            primary_model = os.getenv("LLM_PRIMARY_MODEL", "models/gemini-3.6-flash")
            raw_models = [primary_model, "models/gemini-3.6-flash", "models/gemini-3.5-flash", "models/gemini-flash-latest"]
            models_to_try = []
            for rm in raw_models:
                m_name = rm if rm.startswith("models/") else f"models/{rm}"
                if m_name not in models_to_try:
                    models_to_try.append(m_name)

            for m_name in models_to_try:
                try:
                    model = genai.GenerativeModel(
                        model_name=m_name,
                        system_instruction=RAG_CHAT_SYSTEM_PROMPT
                    )
                    res = model.generate_content(prompt)
                    if res and res.text:
                        return res.text.strip()
                except Exception as exc:
                    err_str = str(exc).lower()
                    if "429" in err_str or "quota" in err_str or "rate limit" in err_str:
                        logger.warning(f"RAG model '{m_name}' hit rate limit ({exc}). Switching to next model...")
                        continue
                    else:
                        logger.warning(f"RAG model '{m_name}' notice: {exc}")
                        continue

            # Fallback: Extract and synthesize answer directly from retrieved vector chunks
            return self._synthesize_fallback_from_chunks(chunks)

        except Exception as exc:
            logger.warning(f"Gemini RAG answer generation notice: {exc}")
            return self._synthesize_fallback_from_chunks(chunks)

    def _synthesize_fallback_from_chunks(self, chunks: Optional[List[Dict[str, Any]]]) -> str:
        """Extracts and formats grounded text directly from retrieved document chunks when AI models are rate limited."""
        if not chunks:
            return "Based on your uploaded workspace documents, no specific matching sections were found for this query."
        
        valid_chunks = [c for c in chunks if c.get("content") and not c.get("content").startswith("Retrieved vector chunk")]
        if not valid_chunks:
            valid_chunks = chunks

        extracted_texts = []
        for c in valid_chunks[:3]:
            content = c.get("content", "").strip()
            if content:
                extracted_texts.append(content)

        if not extracted_texts:
            return "Based on your uploaded workspace documents, no matching text passages were retrieved."

        combined = "\n\n".join(extracted_texts[:2])
        return f"Based on your uploaded workspace research documents:\n\n{combined}"
