from abc import ABC, abstractmethod
from typing import Optional, Any, AsyncGenerator

class BaseAIProvider(ABC):
    """Abstract Base Class defining provider-agnostic AI capabilities."""

    @abstractmethod
    async def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
    ) -> str:
        """Generates standard natural language text response."""
        pass

    @abstractmethod
    async def generate_structured(
        self,
        prompt: str,
        schema: Any,
        system_instruction: Optional[str] = None,
    ) -> Any:
        """Generates Pydantic/JSON structured response matching schema."""
        pass

    @abstractmethod
    async def generate_stream(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
    ) -> AsyncGenerator[str, None]:
        """Streams text response tokens asynchronously."""
        pass
