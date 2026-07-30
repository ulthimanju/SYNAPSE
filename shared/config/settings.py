from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class PostgresSettings(BaseModel):
    """PostgreSQL Connection Settings."""
    host: str = Field(default="postgres", validation_alias="POSTGRES_HOST")
    port: int = Field(default=5432, validation_alias="POSTGRES_PORT")
    user: str = Field(default="synapse_user", validation_alias="POSTGRES_USER")
    password: str = Field(default="synapse_password", validation_alias="POSTGRES_PASSWORD")
    db_name: str = Field(default="synapse_identity", validation_alias="POSTGRES_DB")
    db_vectors: str = Field(default="synapse_vectors", validation_alias="VECTORS_DB_NAME")

    @property
    def url(self) -> str:
        return f"postgresql+asyncpg://{self.user}:{self.password}@{self.host}:{self.port}/{self.db_name}"

class MongoSettings(BaseModel):
    """MongoDB Connection Settings."""
    uri: str = Field(default="mongodb://root:examplepassword@mongodb:27017", validation_alias="MONGODB_URI")
    db_name: str = Field(default="synapse_workspace", validation_alias="MONGODB_DB_NAME")

class RedisSettings(BaseModel):
    """Redis Cache Settings."""
    host: str = Field(default="redis", validation_alias="REDIS_HOST")
    port: int = Field(default=6379, validation_alias="REDIS_PORT")
    db: int = Field(default=0, validation_alias="REDIS_DB")

    @property
    def url(self) -> str:
        return f"redis://{self.host}:{self.port}/{self.db}"

class RabbitMQSettings(BaseModel):
    """RabbitMQ Messaging Settings."""
    host: str = Field(default="rabbitmq", validation_alias="RABBITMQ_HOST")
    port: int = Field(default=5672, validation_alias="RABBITMQ_PORT")
    user: str = Field(default="synapse", validation_alias="RABBITMQ_USER")
    password: str = Field(default="synapse_pass", validation_alias="RABBITMQ_PASSWORD")

    @property
    def url(self) -> str:
        return f"amqp://{self.user}:{self.password}@{self.host}:{self.port}/"

class MinIOSettings(BaseModel):
    """MinIO Object Storage Settings."""
    endpoint: str = Field(default="minio:9000", validation_alias="MINIO_ENDPOINT")
    access_key: str = Field(default="minioadmin", validation_alias="MINIO_ACCESS_KEY")
    secret_key: str = Field(default="minioadminpassword", validation_alias="MINIO_SECRET_KEY")
    bucket_name: str = Field(default="synapse-documents", validation_alias="MINIO_BUCKET_NAME")
    secure: bool = Field(default=False, validation_alias="MINIO_SECURE")

class AISettings(BaseModel):
    """Third-Party AI & Provider Model Stack Settings."""
    llm_provider: str = Field(default="google", validation_alias="LLM_PROVIDER")
    gemini_api_key: str = Field(default="", validation_alias="GEMINI_API_KEY")
    openai_api_key: str = Field(default="", validation_alias="OPENAI_API_KEY")
    llama_cloud_api_key: str = Field(default="", validation_alias="LLAMA_CLOUD_API_KEY")
    huggingface_api_key: str = Field(default="", validation_alias="HUGGINGFACE_API_KEY")
    jina_api_key: str = Field(default="", validation_alias="JINA_API_KEY")

    llm_primary_model: str = Field(default="gemini-flash-latest", validation_alias="LLM_PRIMARY_MODEL")
    llm_vision_model: str = Field(default="gemini-flash-latest", validation_alias="LLM_VISION_MODEL")
    embedding_model: str = Field(default="gemini-embedding-001", validation_alias="EMBEDDING_MODEL")
    embedding_dimensions: int = Field(default=1024, validation_alias="EMBEDDING_DIMENSIONS")
    reranker_model: str = Field(default="jina-reranker-v2-base-multilingual", validation_alias="RERANKER_MODEL")

class Settings(BaseSettings):
    """Central Configuration for Synapse Services using Pydantic Settings."""
    service_name: str = Field(default="synapse-service", validation_alias="SERVICE_NAME")
    environment: str = Field(default="development", validation_alias="ENVIRONMENT")
    log_level: str = Field(default="INFO", validation_alias="LOG_LEVEL")

    identity_service_url: str = Field(default="http://identity-service:8001", validation_alias="IDENTITY_SERVICE_URL")
    workspace_service_url: str = Field(default="http://workspace-service:8002", validation_alias="WORKSPACE_SERVICE_URL")
    document_service_url: str = Field(default="http://document-service:8003", validation_alias="DOCUMENT_SERVICE_URL")
    ai_service_url: str = Field(default="http://ai-service:8004", validation_alias="AI_SERVICE_URL")
    rag_service_url: str = Field(default="http://rag-service:8005", validation_alias="RAG_SERVICE_URL")

    postgres: PostgresSettings = Field(default_factory=PostgresSettings)
    mongodb: MongoSettings = Field(default_factory=MongoSettings)
    redis: RedisSettings = Field(default_factory=RedisSettings)
    rabbitmq: RabbitMQSettings = Field(default_factory=RabbitMQSettings)
    minio: MinIOSettings = Field(default_factory=MinIOSettings)
    ai: AISettings = Field(default_factory=AISettings)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def is_development(self) -> bool:
        return self.environment.lower() == "development"

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    @property
    def is_testing(self) -> bool:
        return self.environment.lower() == "testing"

settings = Settings()
