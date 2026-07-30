import sys
import logging
from typing import Optional
from shared.config.settings import settings
from .formatter import JSONFormatter, ConsoleFormatter

def initialize_logging(
    service_name: Optional[str] = None,
    log_level: Optional[str] = None,
    json_logs: Optional[bool] = None
) -> None:
    """Single initialization function using central settings automatically."""
    svc = service_name or settings.service_name
    level_str = (log_level or settings.log_level).upper()
    level = getattr(logging, level_str, logging.INFO)

    use_json = json_logs if json_logs is not None else settings.is_production

    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    # Remove existing handlers to avoid duplicates
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setLevel(level)

    if use_json:
        stream_handler.setFormatter(JSONFormatter(service_name=svc, environment=settings.environment))
    else:
        stream_handler.setFormatter(ConsoleFormatter())

    root_logger.addHandler(stream_handler)

def setup_logging(
    service_name: Optional[str] = None,
    log_level: Optional[str] = None,
    json_logs: Optional[bool] = None
) -> None:
    """Alias for initialize_logging."""
    initialize_logging(service_name=service_name, log_level=log_level, json_logs=json_logs)

def get_logger(name: str) -> logging.Logger:
    """Returns a named logger instance."""
    return logging.getLogger(name)
