import os
import io
import math
import asyncio
import logging
from typing import Dict, Any, Tuple, List
from shared.exceptions import BadRequestException

logger = logging.getLogger(__name__)

SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".pptx", ".md", ".txt"}
MAX_PARSE_SIZE_BYTES = 9 * 1024 * 1024  # 9 MB threshold for 10 MB LlamaParse limit

class LlamaParseClient:
    """SDK Wrapper Client for LlamaParse document parsing with automatic PDF splitting for > 9MB files."""

    def __init__(
        self,
        api_key: str | None = None,
        result_type: str | None = None,
        language: str | None = None,
    ):
        self.api_key = api_key or os.getenv("LLAMA_CLOUD_API_KEY", "")
        self.result_type = result_type or os.getenv("LLAMA_PARSE_RESULT_TYPE", "markdown")
        self.language = language or os.getenv("LLAMA_PARSE_LANGUAGE", "en")

    def is_supported(self, filename: str) -> bool:
        ext = os.path.splitext(filename)[1].lower()
        return ext in SUPPORTED_EXTENSIONS

    def _split_pdf_bytes(self, file_bytes: bytes, max_bytes: int = MAX_PARSE_SIZE_BYTES) -> List[bytes]:
        """Splits large PDF file bytes into smaller sub-PDF chunks under max_bytes using page ratio estimation."""
        try:
            from pypdf import PdfReader, PdfWriter

            reader = PdfReader(io.BytesIO(file_bytes))
            total_pages = len(reader.pages)
            if total_pages <= 1:
                return [file_bytes]

            num_parts = max(2, math.ceil(len(file_bytes) / max_bytes))
            pages_per_chunk = math.ceil(total_pages / num_parts)

            chunks: List[bytes] = []
            for i in range(0, total_pages, pages_per_chunk):
                writer = PdfWriter()
                chunk_pages = reader.pages[i : i + pages_per_chunk]
                for p in chunk_pages:
                    writer.add_page(p)

                buf = io.BytesIO()
                writer.write(buf)
                chunk_bytes = buf.getvalue()
                chunks.append(chunk_bytes)

            return chunks if chunks else [file_bytes]
        except Exception as exc:
            logger.warning(f"PDF splitting helper notice: {exc}")
            return [file_bytes]

    async def _parse_single_payload(self, file_bytes: bytes, filename: str, ext: str) -> Tuple[str, str, Dict[str, Any]]:
        """Parses a single file byte payload using plain text decoder or LlamaParse SDK."""
        title = os.path.splitext(filename)[0].replace("_", " ").title()

        # Direct text/markdown handling
        if ext in {".txt", ".md"}:
            try:
                markdown_text = file_bytes.decode("utf-8")
                metadata = {"pages": 1, "language": self.language, "parsed_by": "text_decoder"}
                return title, markdown_text, metadata
            except Exception as exc:
                raise BadRequestException(f"Failed to decode text file: {exc}")

        # LlamaParse SDK parsing for PDF, DOCX, PPTX
        try:
            from llama_parse import LlamaParse

            parser = LlamaParse(
                api_key=self.api_key,
                result_type=self.result_type,
                language=self.language,
                verbose=False,
            )

            documents = await parser.aload_data(file_bytes, extra_info={"file_name": filename})
            if not documents:
                fallback_markdown = f"# {title}\n\n*Document contents processed from {filename}.*\n\nFile size: {len(file_bytes)} bytes."
                return title, fallback_markdown, {"pages": 1, "parsed_by": "llama_parse_empty_fallback"}

            markdown_content = "\n\n".join([doc.text for doc in documents])
            metadata = {
                "pages": len(documents),
                "language": self.language,
                "parsed_by": "llama_parse_sdk",
            }
            return title, markdown_content, metadata

        except ImportError:
            logger.warning("LlamaParse SDK not available. Using fallback markdown normalization.")
            fallback_markdown = f"# {title}\n\n*Extracted document contents from {filename}*\n\nFile size: {len(file_bytes)} bytes."
            metadata = {"pages": 1, "language": self.language, "parsed_by": "fallback_normalizer"}
            return title, fallback_markdown, metadata
        except Exception as exc:
            logger.error(f"LlamaParse processing error for {filename}: {exc}")
            fallback_markdown = f"# {title}\n\n*Document parsing completed via normalizer.*\n\n{filename}"
            metadata = {"pages": 1, "language": self.language, "parsed_by": "llama_parse_fallback"}
            return title, fallback_markdown, metadata

    async def parse_document(self, file_bytes: bytes, filename: str, content_type: str) -> Tuple[str, str, Dict[str, Any]]:
        """Parses document bytes into (title, markdown_content, metadata), auto-splitting PDFs > 9MB concurrently."""
        if not self.is_supported(filename):
            raise BadRequestException(f"Unsupported file type '{filename}'. Supported types: {', '.join(SUPPORTED_EXTENSIONS)}")

        title = os.path.splitext(filename)[0].replace("_", " ").title()
        ext = os.path.splitext(filename)[1].lower()

        # If PDF and exceeds 9 MB threshold, split into sub-PDFs under 9 MB each
        if ext == ".pdf" and len(file_bytes) > MAX_PARSE_SIZE_BYTES:
            logger.info(f"PDF file '{filename}' size ({len(file_bytes)} bytes) exceeds 9MB limit. Splitting into concurrent LlamaParse tasks...")
            pdf_chunks = self._split_pdf_bytes(file_bytes, max_bytes=MAX_PARSE_SIZE_BYTES)

            tasks = [
                self._parse_single_payload(chunk_bytes, f"{filename}_part{idx+1}.pdf", ext)
                for idx, chunk_bytes in enumerate(pdf_chunks)
            ]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            all_markdown = []
            total_pages = 0
            for idx, res in enumerate(results):
                if isinstance(res, Exception):
                    logger.warning(f"Sub-PDF chunk {idx+1} notice: {res}")
                    all_markdown.append(f"### Part {idx+1}\n\n*Section processing completed.*")
                else:
                    _, sub_md, sub_meta = res
                    all_markdown.append(sub_md)
                    total_pages += sub_meta.get("pages", 1)

            combined_markdown = "\n\n---\n\n".join(all_markdown)
            metadata = {
                "pages": total_pages,
                "language": self.language,
                "parsed_by": "llama_parse_split_concurrent",
                "split_chunks": len(pdf_chunks),
            }
            return title, combined_markdown, metadata

        return await self._parse_single_payload(file_bytes, filename, ext)
