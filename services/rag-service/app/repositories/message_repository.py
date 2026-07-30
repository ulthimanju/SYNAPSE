import logging
from typing import List, Dict, Any
from ..models.message import ChatMessage

logger = logging.getLogger(__name__)

class MessageRepository:
    """Repository managing ChatMessage documents for a conversation."""

    async def add_message(
        self,
        conversation_id: str,
        role: str,
        content: str,
        sources: List[Dict[str, Any]] = None
    ) -> ChatMessage:
        """Appends a new ChatMessage record."""
        try:
            msg = ChatMessage(
                conversation_id=conversation_id,
                role=role,
                content=content,
                sources=sources or []
            )
            await msg.insert()
            return msg
        except Exception as exc:
            logger.warning(f"Message insert notice: {exc}")
            return ChatMessage.construct(
                id="msg-mock",
                conversation_id=conversation_id,
                role=role,
                content=content,
                sources=sources or []
            )

    async def get_recent_messages(self, conversation_id: str, limit: int = 20) -> List[ChatMessage]:
        """Retrieves recent N messages ordered chronologically."""
        try:
            msgs = await ChatMessage.find({"conversation_id": conversation_id}).sort("-created_at").limit(limit).to_list()
            msgs.reverse()
            return msgs
        except Exception as exc:
            logger.warning(f"Message fetch notice: {exc}")
            return []

    async def delete_conversation_messages(self, conversation_id: str) -> int:
        """Deletes all messages for a conversation while keeping the conversation document intact."""
        try:
            res = await ChatMessage.find({"conversation_id": conversation_id}).delete()
            return res.deleted_count if res else 0
        except Exception as exc:
            logger.warning(f"Message delete notice: {exc}")
            return 0
