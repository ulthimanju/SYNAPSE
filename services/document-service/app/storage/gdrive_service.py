import os
import io
import uuid
import json
import logging
import httpx
from typing import Optional
from shared.exceptions import ServiceUnavailableException, BadRequestException, NotFoundException

logger = logging.getLogger(__name__)

GOOGLE_DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files"
GOOGLE_DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart"

class GoogleDriveStorageService:
    """Exclusive Google Drive Storage Provider organizing files into workspace_id folders (No local disk storage)."""

    def __init__(self):
        pass

    async def get_or_create_workspace_folder(self, workspace_id: str, access_token: str) -> str:
        """Queries Google Drive for folder named workspace_id; creates it if missing."""
        headers = {"Authorization": f"Bearer {access_token}"}
        query = f"name='{workspace_id}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.get(GOOGLE_DRIVE_FILES_URL, headers=headers, params={"q": query})
                if res.status_code == 200:
                    files = res.json().get("files", [])
                    if files:
                        return files[0]["id"]

                # Create workspace folder in Google Drive
                folder_metadata = {
                    "name": workspace_id,
                    "mimeType": "application/vnd.google-apps.folder",
                }
                create_res = await client.post(GOOGLE_DRIVE_FILES_URL, headers=headers, json=folder_metadata)
                if create_res.status_code in (200, 201):
                    folder_id = create_res.json().get("id")
                    if folder_id:
                        logger.info(f"Created Google Drive folder for workspace '{workspace_id}' (folder ID: {folder_id})")
                        return folder_id
                raise ServiceUnavailableException(f"Google Drive folder creation failed: {create_res.text}")
        except Exception as exc:
            logger.error(f"Google Drive folder creation error for workspace '{workspace_id}': {exc}")
            raise ServiceUnavailableException(f"Google Drive storage error: {str(exc)}")

    async def upload_file(
        self,
        workspace_id: str,
        filename: str,
        file_bytes: bytes,
        content_type: str = "application/octet-stream",
        auth_token: Optional[str] = None,
    ) -> str:
        """Uploads file exclusively to Google Drive inside folder named workspace_id."""
        google_token = self._extract_google_token(auth_token)
        if not google_token:
            raise ServiceUnavailableException(
                "Google Drive access token missing. Please sign in with Google or configure GOOGLE_DRIVE_DEV_TOKEN."
            )

        folder_id = await self.get_or_create_workspace_folder(workspace_id, google_token)
        headers = {"Authorization": f"Bearer {google_token}"}
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
                        logger.info(f"[EXCLUSIVE GDRIVE] Uploaded '{filename}' to Google Drive in folder '{workspace_id}' (file ID: {file_id})")
                        return f"gdrive://{file_id}"
                raise ServiceUnavailableException(f"Google Drive upload API failed ({res.status_code}): {res.text[:200]}")
        except Exception as exc:
            logger.error(f"Google Drive upload exception for '{filename}': {exc}")
            raise ServiceUnavailableException(f"Google Drive upload failed: {str(exc)}")

    async def get_file_bytes(self, storage_key: str, auth_token: Optional[str] = None) -> bytes:
        """Downloads raw file bytes exclusively from Google Drive."""
        google_token = self._extract_google_token(auth_token)
        if not google_token:
            raise ServiceUnavailableException("Google Drive access token missing for file retrieval.")

        file_id = storage_key.replace("gdrive://", "")
        headers = {"Authorization": f"Bearer {google_token}"}
        url = f"{GOOGLE_DRIVE_FILES_URL}/{file_id}?alt=media"

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.get(url, headers=headers)
                if res.status_code == 200:
                    return res.content
                raise NotFoundException(f"File ID '{file_id}' not found on Google Drive ({res.status_code})")
        except Exception as exc:
            logger.error(f"Google Drive download error for file ID {file_id}: {exc}")
            raise ServiceUnavailableException(f"Google Drive download failed: {str(exc)}")

    async def delete_file(self, storage_key: str, auth_token: Optional[str] = None) -> bool:
        """Deletes file exclusively from Google Drive."""
        google_token = self._extract_google_token(auth_token)
        if not google_token:
            logger.warning("Google Drive access token missing for file deletion.")
            return False

        file_id = storage_key.replace("gdrive://", "")
        headers = {"Authorization": f"Bearer {google_token}"}
        url = f"{GOOGLE_DRIVE_FILES_URL}/{file_id}"

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.delete(url, headers=headers)
                if res.status_code in (200, 204):
                    logger.info(f"[EXCLUSIVE GDRIVE] Deleted file {file_id} from Google Drive")
                    return True
                logger.warning(f"Google Drive delete status ({res.status_code}): {res.text[:150]}")
                return False
        except Exception as exc:
            logger.error(f"Google Drive delete error for file ID {file_id}: {exc}")
            return False

    def _extract_google_token(self, auth_token: Optional[str]) -> Optional[str]:
        """Extracts Google OAuth access token from Synapse JWT claims, raw Bearer header, or dev environment variable."""
        dev_token = os.getenv("GOOGLE_DRIVE_DEV_TOKEN") or os.getenv("GOOGLE_ACCESS_TOKEN")

        if not auth_token:
            return dev_token

        raw_token = auth_token[7:] if auth_token.startswith("Bearer ") else auth_token

        # 1. Decode Synapse JWT payload to extract embedded google_token
        try:
            from shared.auth.jwt import decode_access_token
            payload = decode_access_token(raw_token)
            g_token = payload.get("google_token")
            if g_token:
                return g_token
        except Exception:
            pass

        # 2. Check if raw_token is already a direct Google OAuth token
        if raw_token and raw_token.startswith("ya29."):
            return raw_token

        return dev_token or raw_token
