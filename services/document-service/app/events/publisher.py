import json
import logging
import aio_pika
from typing import Dict, Any, Optional
from shared.config import settings

logger = logging.getLogger(__name__)

class EventPublisher:
    """RabbitMQ Event Publisher for Document Processing Events."""

    def __init__(self, rabbitmq_url: str | None = None):
        self.rabbitmq_url = rabbitmq_url or settings.rabbitmq.url

    async def _publish(self, queue_name: str, payload: Dict[str, Any]) -> bool:
        try:
            connection = await aio_pika.connect_robust(self.rabbitmq_url)
            async with connection:
                channel = await connection.channel()
                await channel.declare_queue(queue_name, durable=True)
                
                await channel.default_exchange.publish(
                    aio_pika.Message(
                        body=json.dumps(payload).encode("utf-8"),
                        delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
                    ),
                    routing_key=queue_name,
                )
                logger.info(f"Published {payload.get('event')} event for doc ID: {payload.get('document_id')}")
                return True
        except Exception as exc:
            logger.warning(f"RabbitMQ publish event deferred/warning for {queue_name}: {exc}")
            return False

    async def publish_document_uploaded(
        self,
        document_id: str,
        workspace_id: str,
        storage_key: str,
        uploaded_by: str
    ) -> bool:
        payload = {
            "event": "document.uploaded",
            "document_id": document_id,
            "workspace_id": workspace_id,
            "storage_key": storage_key,
            "uploaded_by": uploaded_by,
        }
        return await self._publish("document.uploaded", payload)

    async def publish_document_completed(
        self,
        document_id: str,
        workspace_id: str,
    ) -> bool:
        payload = {
            "event": "document.completed",
            "document_id": document_id,
            "workspace_id": workspace_id,
            "status": "completed",
        }
        return await self._publish("document.completed", payload)

    async def publish_document_chunked(
        self,
        document_id: str,
        workspace_id: str,
        chunk_count: int,
    ) -> bool:
        payload = {
            "event": "document.chunked",
            "document_id": document_id,
            "workspace_id": workspace_id,
            "chunk_count": chunk_count,
        }
        return await self._publish("document.chunked", payload)

    async def publish_document_embedded(
        self,
        document_id: str,
        workspace_id: str,
        embedding_count: int,
    ) -> bool:
        payload = {
            "event": "document.embedded",
            "document_id": document_id,
            "workspace_id": workspace_id,
            "embedding_count": embedding_count,
        }
        return await self._publish("document.embedded", payload)

    async def publish_document_failed(
        self,
        document_id: str,
        workspace_id: str,
        reason: str,
    ) -> bool:
        payload = {
            "event": "document.failed",
            "document_id": document_id,
            "workspace_id": workspace_id,
            "status": "failed",
            "reason": reason,
        }
        return await self._publish("document.failed", payload)
