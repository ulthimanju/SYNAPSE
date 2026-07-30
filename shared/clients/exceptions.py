class BaseClientError(Exception):
    """Base exception for all HTTP client errors."""
    def __init__(self, message: str, status_code: int | None = None, response_data: dict | None = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.response_data = response_data

class HTTPClientError(BaseClientError):
    """Raised for 4xx HTTP responses."""
    pass

class HTTPServerError(BaseClientError):
    """Raised for 5xx HTTP responses."""
    pass

class ClientTimeoutError(BaseClientError):
    """Raised when an HTTP request times out."""
    pass

class ClientConnectionError(BaseClientError):
    """Raised when network or connection fails."""
    pass
