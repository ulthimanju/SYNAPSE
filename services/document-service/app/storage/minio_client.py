import io
import uuid
import logging
from typing import Optional, BinaryIO
from minio import Minio
from minio.error import S3Error
from shared.config import settings

logger = logging.getLogger(__name__)

class MinIOStorageService:
    """MinIO Object Storage Service for file uploads and object management."""

    def __init__(
        self,
        endpoint: Optional[str] = None,
        access_key: Optional[str] = None,
        secret_key: Optional[str] = None,
        bucket_name: Optional[str] = None,
        secure: Optional[bool] = None,
    ):
        self.endpoint = endpoint or settings.minio.endpoint
        self.access_key = access_key or settings.minio.access_key
        self.secret_key = secret_key or settings.minio.secret_key
        self.bucket_name = bucket_name or settings.minio.bucket_name
        self.secure = secure if secure is not None else settings.minio.secure

        self._client: Optional[Minio] = None

    @property
    def client(self) -> Minio:
        if self._client is None:
            self._client = Minio(
                endpoint=self.endpoint,
                access_key=self.access_key,
                secret_key=self.secret_key,
                secure=self.secure,
            )
        return self._client

    def ensure_bucket(self) -> None:
        """Ensures the target bucket exists in MinIO."""
        try:
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
                logger.info(f"Created MinIO bucket: {self.bucket_name}")
        except Exception as exc:
            logger.warning(f"MinIO bucket check warning: {exc}")

    def generate_storage_key(self, workspace_id: str, filename: str) -> str:
        """Generates unique storage key for object storage."""
        unique_prefix = str(uuid.uuid4().hex)[:12]
        safe_filename = filename.replace(" ", "_")
        return f"workspaces/{workspace_id}/{unique_prefix}_{safe_filename}"

    def upload_file(
        self,
        storage_key: str,
        data: BinaryIO,
        length: int,
        content_type: str = "application/octet-stream"
    ) -> str:
        """Uploads binary file stream to MinIO."""
        self.ensure_bucket()
        self.client.put_object(
            bucket_name=self.bucket_name,
            object_name=storage_key,
            data=data,
            length=length,
            content_type=content_type,
        )
        return storage_key

    def delete_file(self, storage_key: str) -> bool:
        """Deletes object from MinIO."""
        try:
            self.client.remove_object(self.bucket_name, storage_key)
            return True
        except S3Error as exc:
            logger.warning(f"MinIO delete warning for {storage_key}: {exc}")
            return False
