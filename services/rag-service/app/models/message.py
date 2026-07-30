from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from beanie import Document, Indexed
from pydantic import Field

class ChatMessage(Document):
    """Beanie MongoDB Model for Chat Messages within a Singleton Conversation."""
    conversation_id: Indexed(str) = Field(..., description="Target conversation ID string")
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message text content")
    sources: List[Dict[str, Any]] = Field(default_factory=list, description="Retrieved source chunk references")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "messages"
