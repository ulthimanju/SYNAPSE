import json
import logging
import asyncio
import aio_pika
from typing import Optional
from shared.config import settings
from ..services.processing_service import DocumentProcessingService

logger = logging.getLogger(__name__)

class EventConsumer:
    """RabbitMQ Background Event Consumer."""

    def __init__(self, rabbitmq_url: Optional[str] = None):
        self.rabbitmq_url = rabbitmq_url or settings.rabbitmq.url
        self.processor = DocumentProcessingService()

    async def start_listening(self) -> None:
        """Connects to RabbitMQ and starts consuming document.uploaded queue."""
        try:
            connection = await aio_pika.connect_robust(self.rabbitmq_url)
            channel = await connection.channel()
            queue = await channel.declare_queue("document.uploaded", durable=True)

            logger.info("EventConsumer connected to RabbitMQ. Listening on queue 'document.uploaded'...")

            async with queue.iterator() as queue_iter:
                async for message in queue_iter:
                    async with message.process():
                        try:
                            data = json.loads(message.body.decode("utf-8"))
                            logger.info(f"Received event: {data.get('event')} for document {data.get('document_id')}")
                            await self.processor.process_document_event(data)
                        except Exception as exc:
                            logger.error(f"Error processing RabbitMQ message: {exc}", exc_info=exc)
        except Exception as exc:
            logger.warning(f"RabbitMQ consumer connection warning: {exc}")
