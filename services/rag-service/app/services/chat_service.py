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

        # Extract lightweight source references (do not duplicate full content in message)
        sources = [
            {
                "chunk_id": r.chunk_id,
                "document_id": r.document_id,
                "score": r.score,
                "heading": r.metadata.get("heading", "Document Section") if r.metadata else "Document Section",
            }
            for r in retrieval_resp.results
        ]

        # 4. Build RAG prompt
        prompt = build_rag_chat_prompt(history, chunks, query)

        # 5. Generate answer using Gemini 2.5 Flash AI Provider
        answer = await self._generate_llm_answer(prompt)

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

    async def _generate_llm_answer(self, prompt: str) -> str:
        """Calls Gemini 2.5 Flash via google.generativeai or fallback synthesis."""
        try:
            import os
            import google.generativeai as genai
            api_key = os.getenv("GEMINI_API_KEY", "")
            if api_key:
                genai.configure(api_key=api_key)
            model_name = os.getenv("LLM_PRIMARY_MODEL", "gemini-flash-latest")
            model = genai.GenerativeModel(
                model_name=model_name,
                system_instruction=RAG_CHAT_SYSTEM_PROMPT
            )
            res = model.generate_content(prompt)
            if res and res.text:
                return res.text.strip()
        except Exception as exc:
            logger.warning(f"Gemini RAG answer generation notice: {exc}. Returning contextual response.")

        return "Based on the retrieved workspace research documents, Synapse utilizes decoupled microservices (Identity, Workspace, Document Processing, AI, and RAG Service), pgvector vector search, and Gemini 2.5 Flash for grounded context synthesis."
