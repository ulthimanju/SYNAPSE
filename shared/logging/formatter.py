import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict

class JSONFormatter(logging.Formatter):
    """Structured JSON log formatter for production microservice log aggregation."""

    def __init__(self, service_name: str = "synapse-service", environment: str = "development"):
        super().__init__()
        self.service_name = service_name
        self.environment = environment

    def format(self, record: logging.LogRecord) -> str:
        log_object: Dict[str, Any] = {
            "timestamp": datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "service": getattr(record, "service", self.service_name),
            "environment": getattr(record, "environment", self.environment),
            "logger": record.name,
            "message": record.getMessage(),
            "file": f"{record.filename}:{record.lineno}",
        }

        if record.exc_info:
            log_object["exception"] = self.formatException(record.exc_info)

        # Include extra attributes passed to log calls
        extra_keys = set(record.__dict__.keys()) - {
            "args", "asctime", "created", "exc_info", "exc_text", "filename",
            "funcName", "levelname", "levelno", "lineno", "module", "msecs",
            "msg", "name", "pathname", "process", "processName", "relativeCreated",
            "stack_info", "thread", "threadName", "service", "environment"
        }
        for key in extra_keys:
            log_object[key] = record.__dict__[key]

        return json.dumps(log_object)

class ConsoleFormatter(logging.Formatter):
    """Human-readable console log formatter for local development."""

    def __init__(self, fmt: str = "[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s", datefmt: str = "%Y-%m-%d %H:%M:%S"):
        super().__init__(fmt=fmt, datefmt=datefmt)
