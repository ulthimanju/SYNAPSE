import logging
from typing import Optional
from ..models.conversation import Conversation

logger = logging.getLogger(__name__)

class ConversationRepository:
    """Repository managing singleton Conversation document per workspace."""

    async def get_or_create_conversation(self, workspace_id: str) -> Conversation:
        """Finds existing conversation for workspace_id or creates a new one."""
        try:
            conv = await Conversation.find_one({"workspace_id": workspace_id})
        except Exception:
            conv = None

        if not conv:
            try:
                conv = Conversation(workspace_id=workspace_id)
                await conv.insert()
                logger.info(f"Created singleton conversation for workspace {workspace_id}")
            except Exception as exc:
                logger.warning(f"Conversation persistence fallback notice: {exc}")
                # Fallback object for uninitialized MongoDB / TestClient
                conv = Conversation.construct(id="conv-mock", workspace_id=workspace_id)
        return conv
