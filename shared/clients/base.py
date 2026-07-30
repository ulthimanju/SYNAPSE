import httpx
import logging
import asyncio
from typing import Any, Dict, Optional
from .exceptions import (
    BaseClientError,
    HTTPClientError,
    HTTPServerError,
    ClientTimeoutError,
    ClientConnectionError,
)

logger = logging.getLogger(__name__)

class BaseAsyncHTTPClient:
    """Reusable asynchronous HTTP client base class supporting timeouts, retries, and error handling."""

    def __init__(
        self,
        base_url: str,
        timeout: float = 10.0,
        max_retries: int = 3,
        backoff_factor: float = 0.5,
        default_headers: Optional[Dict[str, str]] = None,
    ):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.max_retries = max_retries
        self.backoff_factor = backoff_factor
        self.default_headers = default_headers or {}

    async def _request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        json: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        merged_headers = {**self.default_headers, **(headers or {})}

        for attempt in range(1, self.max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.request(
                        method=method,
                        url=url,
                        params=params,
                        json=json,
                        headers=merged_headers,
                    )

                    if response.is_success:
                        return response.json() if response.content else {}

                    # Error handling
                    error_data = None
                    try:
                        error_data = response.json()
                    except Exception:
                        error_data = {"text": response.text}

                    if 400 <= response.status_code < 500:
                        raise HTTPClientError(
                            message=f"Client error {response.status_code} for {url}",
                            status_code=response.status_code,
                            response_data=error_data,
                        )
                    elif response.status_code >= 500:
                        if attempt == self.max_retries:
                            raise HTTPServerError(
                                message=f"Server error {response.status_code} for {url}",
                                status_code=response.status_code,
                                response_data=error_data,
                            )
                        logger.warning(
                            f"Attempt {attempt}/{self.max_retries} failed for {url} ({response.status_code}). Retrying..."
                        )

            except (HTTPClientError, HTTPServerError):
                raise
            except httpx.TimeoutException as exc:
                if attempt == self.max_retries:
                    raise ClientTimeoutError(f"Request to {url} timed out after {self.timeout}s") from exc
                logger.warning(f"Timeout on attempt {attempt}/{self.max_retries} for {url}. Retrying...")
            except httpx.RequestError as exc:
                if attempt == self.max_retries:
                    raise ClientConnectionError(f"Failed to connect to {url}: {str(exc)}") from exc
                logger.warning(f"Connection error on attempt {attempt}/{self.max_retries} for {url}. Retrying...")

            # Exponential backoff
            await asyncio.sleep(self.backoff_factor * (2 ** (attempt - 1)))

        raise BaseClientError(f"Request failed after {self.max_retries} attempts")

    async def get(self, endpoint: str, params: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        return await self._request("GET", endpoint, params=params, headers=headers)

    async def post(self, endpoint: str, json: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        return await self._request("POST", endpoint, json=json, headers=headers)

    async def put(self, endpoint: str, json: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        return await self._request("PUT", endpoint, json=json, headers=headers)

    async def delete(self, endpoint: str, params: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        return await self._request("DELETE", endpoint, params=params, headers=headers)
