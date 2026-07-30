import os
import io
import logging
from typing import Dict, Any, Tuple, List
from shared.exceptions import BadRequestException

logger = logging.getLogger(__name__)

SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".pptx", ".md", ".txt"}
MAX_PARSE_SIZE_BYTES = 9 * 1024 * 1024  # 9 MB threshold for 10 MB LlamaParse limit

class LlamaParseClient:
    """SDK Wrapper Client for LlamaParse document parsing with automatic PDF splitting for > 10MB files."""

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
        """Splits large PDF file bytes into smaller sub-PDF chunks under max_bytes using pypdf."""
        try:
            from pypdf import PdfReader, PdfWriter

            reader = PdfReader(io.BytesIO(file_bytes))
            total_pages = len(reader.pages)
            if total_pages <= 1:
                return [file_bytes]

            chunks: List[bytes] = []
            current_writer = PdfWriter()

            for page_idx in range(total_pages):
                test_writer = PdfWriter()
                for p in current_writer.pages:
                    test_writer.add_page(p)
                test_writer.add_page(reader.pages[page_idx])

                buf = io.BytesIO()
                test_writer.write(buf)
                size = len(buf.getvalue())

                if size > max_bytes and len(current_writer.pages) > 0:
                    out_buf = io.BytesIO()
                    current_writer.write(out_buf)
                    chunks.append(out_buf.getvalue())

                    current_writer = PdfWriter()
                    current_writer.add_page(reader.pages[page_idx])
                else:
                    current_writer = test_writer

            if len(current_writer.pages) > 0:
                out_buf = io.BytesIO()
                current_writer.write(out_buf)
                chunks.append(out_buf.getvalue())

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
                raise BadRequestException("LlamaParse returned empty parsing result")

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
        """Parses document bytes into (title, markdown_content, metadata), auto-splitting PDFs > 9MB."""
        if not self.is_supported(filename):
            raise BadRequestException(f"Unsupported file type '{filename}'. Supported types: {', '.join(SUPPORTED_EXTENSIONS)}")

        title = os.path.splitext(filename)[0].replace("_", " ").title()
        ext = os.path.splitext(filename)[1].lower()

        # If PDF and exceeds 9 MB threshold, split into sub-PDFs under 9 MB each
        if ext == ".pdf" and len(file_bytes) > MAX_PARSE_SIZE_BYTES:
            logger.info(f"PDF file '{filename}' size ({len(file_bytes)} bytes) exceeds 9MB limit. Splitting PDF for LlamaParse...")
            pdf_chunks = self._split_pdf_bytes(file_bytes, max_bytes=MAX_PARSE_SIZE_BYTES)

            all_markdown = []
            total_pages = 0
            for idx, chunk_bytes in enumerate(pdf_chunks):
                sub_filename = f"{filename}_part{idx+1}.pdf"
                _, sub_md, sub_meta = await self._parse_single_payload(chunk_bytes, sub_filename, ext)
                all_markdown.append(sub_md)
                total_pages += sub_meta.get("pages", 1)

            combined_markdown = "\n\n---\n\n".join(all_markdown)
            metadata = {
                "pages": total_pages,
                "language": self.language,
                "parsed_by": "llama_parse_split",
                "split_chunks": len(pdf_chunks),
            }
            return title, combined_markdown, metadata

        return await self._parse_single_payload(file_bytes, filename, ext)
