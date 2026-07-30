from typing import List, Optional, Type
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from beanie import init_beanie, Document
from shared.config.settings import settings

class MongoDatabaseManager:
    """Manager for Async Motor Client & Beanie initialization."""

    def __init__(self, uri: Optional[str] = None):
        self._uri = uri
        self._client: Optional[AsyncIOMotorClient] = None

    @property
    def uri(self) -> str:
        return self._uri or settings.mongodb.uri

    @property
    def db_name(self) -> str:
        return settings.mongodb.db_name

    @property
    def client(self) -> AsyncIOMotorClient:
        if self._client is None:
            self._client = AsyncIOMotorClient(self.uri)
        return self._client

    @property
    def db(self) -> AsyncIOMotorDatabase:
        return self.client[self.db_name]

    async def init_beanie(self, document_models: Optional[List[Type[Document]]] = None) -> None:
        """Initializes Beanie Object-Document Mapper with specified document models."""
        models = document_models or []
        await init_beanie(database=self.db, document_models=models)

    def close(self) -> None:
        if self._client is not None:
            self._client.close()
            self._client = None

# Default manager instance
mongodb_manager = MongoDatabaseManager()

def get_mongo_client(uri: Optional[str] = None) -> AsyncIOMotorClient:
    """Returns Motor Client instance."""
    if uri:
        return AsyncIOMotorClient(uri)
    return mongodb_manager.client

def get_mongo_db(uri: Optional[str] = None) -> AsyncIOMotorDatabase:
    """Returns Motor Database instance for the default database name from settings."""
    client = get_mongo_client(uri)
    return client[settings.mongodb.db_name]

async def init_mongo_beanie(
    document_models: Optional[List[Type[Document]]] = None,
    uri: Optional[str] = None
) -> None:
    """Initializes Beanie ODM using the service's settings.mongodb.db_name automatically."""
    db = get_mongo_db(uri=uri)
    models = document_models or []
    await init_beanie(database=db, document_models=models)
