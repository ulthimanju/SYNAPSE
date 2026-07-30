import asyncio
import logging
from ..events.consumers import EventConsumer

logger = logging.getLogger(__name__)

async def run_worker():
    """Runs the document processing background worker loop."""
    logger.info("Starting Document Processing Background Worker...")
    consumer = EventConsumer()
    await consumer.start_listening()

if __name__ == "__main__":
    asyncio.run(run_worker())
