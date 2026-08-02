import os
import io
import uuid
import json
import logging
import httpx
from typing import Optional, Tuple
from shared.exceptions import ServiceUnavailableException, BadRequestException, NotFoundException, UnauthorizedException
from shared.cache.redis_client import redis_cache_manager

logger = logging.getLogger(__name__)

GOOGLE_DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files"
GOOGLE_DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart"
GOOGLE_TOKEN_URI = "https://oauth2.googleapis.com/token"

class GoogleDriveStorageService:
    """Exclusive Google Drive Storage Provider with automatic OAuth 2.0 Access Token Auto-Refresh and Retry."""

    def __init__(self):
        self.client_id = os.getenv("GOOGLE_CLIENT_ID", "")
        self.client_secret = os.getenv("GOOGLE_CLIENT_SECRET", "")

    async def get_or_create_workspace_folder(self, workspace_id: str, access_token: str) -> Tuple[str, bool]:
        """Queries Google Drive for folder named workspace_id; creates it if missing.
        Returns (folder_id, is_unauthorized_boolean).
        """
        headers = {"Authorization": f"Bearer {access_token}"}
        query = f"name='{workspace_id}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.get(GOOGLE_DRIVE_FILES_URL, headers=headers, params={"q": query})
                if res.status_code == 401:
                    return "", True
                if res.status_code == 200:
                    files = res.json().get("files", [])
                    if files:
                        return files[0]["id"], False

                # Create workspace folder in Google Drive
                folder_metadata = {
                    "name": workspace_id,
                    "mimeType": "application/vnd.google-apps.folder",
                }
                create_res = await client.post(GOOGLE_DRIVE_FILES_URL, headers=headers, json=folder_metadata)
                if create_res.status_code == 401:
                    return "", True
                if create_res.status_code in (200, 201):
                    folder_id = create_res.json().get("id")
                    if folder_id:
                        logger.info(f"Created Google Drive folder for workspace '{workspace_id}' (folder ID: {folder_id})")
                        return folder_id, False
                raise ServiceUnavailableException(f"Google Drive folder creation failed ({create_res.status_code}): {create_res.text[:200]}")
        except Exception as exc:
            logger.error(f"Google Drive folder creation error for workspace '{workspace_id}': {exc}")
            raise

    async def refresh_google_access_token(self, user_id: str, refresh_token: str) -> Optional[str]:
        """Uses long-lived Google OAuth refresh_token to acquire a fresh Google access_token."""
        if not refresh_token:
            return None
        data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(GOOGLE_TOKEN_URI, data=data)
                if res.status_code == 200:
                    new_token = res.json().get("access_token")
                    if new_token:
                        logger.info(f"🔄 [GOOGLE OAUTH REFRESH SUCCESS] Acquired fresh Google access token for user {user_id}!")
                        if user_id:
                            await redis_cache_manager.set_cache(f"gdrive_access_token:{user_id}", new_token, ttl_seconds=3500)
                        return new_token
                logger.warning(f"Google OAuth token refresh failed ({res.status_code}): {res.text[:150]}")
        except Exception as exc:
            logger.error(f"Google OAuth token refresh exception: {exc}")
        return None

    async def upload_file(
        self,
        workspace_id: str,
        filename: str,
        file_bytes: bytes,
        content_type: str = "application/octet-stream",
        auth_token: Optional[str] = None,
    ) -> str:
        """Uploads file to Google Drive if OAuth tokens present; otherwise uses MinIO S3 Object Storage."""
        google_token, refresh_token, user_id = await self._extract_google_tokens(auth_token)

        # 1. Try Google Drive if OAuth tokens present
        if google_token or refresh_token:
            try:
                is_401 = False
                if google_token:
                    folder_id, is_401 = await self.get_or_create_workspace_folder(workspace_id, google_token)
                    if not is_401 and folder_id:
                        upload_res = await self._perform_gdrive_upload(folder_id, filename, file_bytes, content_type, google_token)
                        if upload_res:
                            return upload_res
                        is_401 = True

                if (is_401 or not google_token) and refresh_token:
                    fresh_token = await self.refresh_google_access_token(user_id=user_id, refresh_token=refresh_token)
                    if fresh_token:
                        folder_id, is_401 = await self.get_or_create_workspace_folder(workspace_id, fresh_token)
                        if not is_401 and folder_id:
                            upload_res = await self._perform_gdrive_upload(folder_id, filename, file_bytes, content_type, fresh_token)
                            if upload_res:
                                return upload_res
            except Exception as exc:
                logger.warning(f"Google Drive upload notice ({exc}). Using MinIO Object Storage fallback...")

        # 2. Universal MinIO S3 Object Storage Fallback (Guarantees file upload NEVER fails)
        logger.info(f"Using MinIO Object Storage for document '{filename}' in workspace '{workspace_id}'")
        from .minio_client import MinIOStorageService
        minio_service = MinIOStorageService()
        storage_key = minio_service.generate_storage_key(workspace_id, filename)
        return minio_service.upload_file(
            storage_key=storage_key,
            data=io.BytesIO(file_bytes),
            length=len(file_bytes),
            content_type=content_type
        )

    async def _perform_gdrive_upload(self, folder_id: str, filename: str, file_bytes: bytes, content_type: str, access_token: str) -> Optional[str]:
        """Helper executing multipart POST upload to Google Drive."""
        headers = {"Authorization": f"Bearer {access_token}"}
        metadata = {"name": filename, "parents": [folder_id]}

        boundary = f"----SynapseBoundary{uuid.uuid4().hex}"
        body = (
            f"--{boundary}\r\n"
            f"Content-Type: application/json; charset=UTF-8\r\n\r\n"
            f"{json.dumps(metadata)}\r\n"
            f"--{boundary}\r\n"
            f"Content-Type: {content_type}\r\n\r\n"
        ).encode("utf-8") + file_bytes + f"\r\n--{boundary}--\r\n".encode("utf-8")

        headers["Content-Type"] = f"multipart/related; boundary={boundary}"

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post(GOOGLE_DRIVE_UPLOAD_URL, headers=headers, content=body)
                if res.status_code in (200, 201):
                    file_id = res.json().get("id")
                    if file_id:
                        logger.info(f"📁 [GDRIVE UPLOAD SUCCESS] Uploaded '{filename}' to Google Drive in folder '{folder_id}' (file ID: {file_id})")
                        return f"gdrive://{file_id}"
                if res.status_code == 401:
                    return None
                raise ServiceUnavailableException(f"Google Drive upload API status {res.status_code}: {res.text[:200]}")
        except Exception as exc:
            logger.error(f"Google Drive upload execution error for '{filename}': {exc}")
            raise

    async def get_file_bytes(self, storage_key: str, auth_token: Optional[str] = None) -> bytes:
        """Downloads raw file bytes from Google Drive or MinIO S3 Object Storage."""
        if storage_key.startswith("minio://"):
            from .minio_client import MinIOStorageService
            return MinIOStorageService().get_file_bytes(storage_key)

        google_token, refresh_token, user_id = await self._extract_google_tokens(auth_token)
        file_id = storage_key.replace("gdrive://", "").replace("minio://", "")

        # Attempt 1: Fetch with current google_token
        if google_token:
            data, is_401 = await self._perform_gdrive_download(file_id, google_token)
            if data is not None:
                return data
            if not is_401:
                raise NotFoundException(f"File ID '{file_id}' not found on Google Drive")

        # Auto-Refresh OAuth Token & Retry if 401
        if refresh_token:
            logger.info(f"🔐 Google OAuth access token expired (401) during file retrieval of '{file_id}'. Triggering automatic token refresh...")
            fresh_token = await self.refresh_google_access_token(user_id=user_id, refresh_token=refresh_token)
            if fresh_token:
                data, is_401 = await self._perform_gdrive_download(file_id, fresh_token)
                if data is not None:
                    return data

        # Fallback to MinIO if present
        from .minio_client import MinIOStorageService
        return MinIOStorageService().get_file_bytes(storage_key)

    async def _perform_gdrive_download(self, file_id: str, access_token: str) -> Tuple[Optional[bytes], bool]:
        """Helper executing GET media download from Google Drive."""
        headers = {"Authorization": f"Bearer {access_token}"}
        url = f"{GOOGLE_DRIVE_FILES_URL}/{file_id}?alt=media"

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.get(url, headers=headers)
                if res.status_code == 200:
                    return res.content, False
                if res.status_code == 401:
                    return None, True
                return None, False
        except Exception as exc:
            logger.error(f"Google Drive download error for file ID {file_id}: {exc}")
            return None, False

    async def delete_file(self, storage_key: str, auth_token: Optional[str] = None) -> bool:
        """Deletes file from Google Drive or MinIO S3 Object Storage."""
        if storage_key.startswith("minio://"):
            from .minio_client import MinIOStorageService
            return MinIOStorageService().delete_file(storage_key)

        google_token, refresh_token, user_id = await self._extract_google_tokens(auth_token)
        file_id = storage_key.replace("gdrive://", "").replace("minio://", "")

        if google_token:
            ok, is_401 = await self._perform_gdrive_delete(file_id, google_token)
            if ok:
                return True
            if not is_401:
                return False

        if refresh_token:
            fresh_token = await self.refresh_google_access_token(user_id=user_id, refresh_token=refresh_token)
            if fresh_token:
                ok, _ = await self._perform_gdrive_delete(file_id, fresh_token)
                return ok

        from .minio_client import MinIOStorageService
        return MinIOStorageService().delete_file(storage_key)

    async def _perform_gdrive_delete(self, file_id: str, access_token: str) -> Tuple[bool, bool]:
        """Helper executing DELETE on Google Drive file."""
        headers = {"Authorization": f"Bearer {access_token}"}
        url = f"{GOOGLE_DRIVE_FILES_URL}/{file_id}"

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.delete(url, headers=headers)
                if res.status_code in (200, 204):
                    logger.info(f"🗑️ [GDRIVE DELETE SUCCESS] Deleted file {file_id} from Google Drive")
                    return True, False
                if res.status_code == 401:
                    return False, True
                return False, False
        except Exception as exc:
            logger.warning(f"Google Drive delete error for file ID {file_id}: {exc}")
            return False, False

    async def _extract_google_tokens(self, auth_token: Optional[str]) -> Tuple[Optional[str], Optional[str], str]:
        """Extracts (google_access_token, google_refresh_token, user_id) from Synapse JWT claims or Redis."""
        dev_token = os.getenv("GOOGLE_DRIVE_DEV_TOKEN") or os.getenv("GOOGLE_ACCESS_TOKEN")
        dev_refresh = os.getenv("GOOGLE_REFRESH_TOKEN")

        if not auth_token:
            return dev_token, dev_refresh, ""

        raw_token = auth_token[7:] if auth_token.startswith("Bearer ") else auth_token

        user_id = ""
        g_access = None
        g_refresh = None

        try:
            from shared.auth.jwt import decode_access_token
            payload = decode_access_token(raw_token)
            user_id = payload.get("sub", "")
            g_access = payload.get("google_token")
            g_refresh = payload.get("google_refresh_token")
        except Exception:
            pass

        # Also check Redis cache for updated tokens if user_id is known
        if user_id:
            cached_access = await redis_cache_manager.get_cache(f"gdrive_access_token:{user_id}")
            if cached_access:
                g_access = cached_access
            cached_refresh = await redis_cache_manager.get_cache(f"gdrive_refresh_token:{user_id}")
            if cached_refresh:
                g_refresh = cached_refresh

        if raw_token and raw_token.startswith("ya29."):
            g_access = raw_token

        return g_access or dev_token, g_refresh or dev_refresh, user_id
