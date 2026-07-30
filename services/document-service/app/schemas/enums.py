from enum import Enum

class DocumentStatus(str, Enum):
    """Document lifecycle state."""
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"

class ProcessingStage(str, Enum):
    """Document processing pipeline stage."""
    UPLOAD = "upload"
    PARSE = "parse"
    CHUNK = "chunk"
    EMBED = "embed"
    COMPLETE = "complete"
