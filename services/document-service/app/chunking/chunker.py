import logging
from typing import List, Dict, Any
from llama_index.core.node_parser import MarkdownNodeParser
from llama_index.core.schema import TextNode

logger = logging.getLogger(__name__)

class LlamaMarkdownChunker:
    """Semantic Markdown Chunker using LlamaIndex MarkdownNodeParser."""

    def __init__(self):
        self.parser = MarkdownNodeParser()

    def split_markdown(self, markdown_text: str) -> List[Dict[str, Any]]:
        """Parses Markdown content into semantic nodes with metadata."""
        if not markdown_text or not markdown_text.strip():
            return []

        try:
            node = TextNode(text=markdown_text)
            nodes = self.parser.get_nodes_from_node(node)
            
            chunks = []
            for idx, n in enumerate(nodes):
                content = n.get_content().strip()
                if not content:
                    continue

                # Estimate token count (word count approximation)
                tokens = len(content.split())
                meta = n.metadata or {}
                meta["heading"] = meta.get("header_path", "General")
                meta["section_path"] = meta.get("header_path", "")
                meta["parser"] = "MarkdownNodeParser"

                chunks.append({
                    "chunk_index": idx,
                    "content": content,
                    "token_count": tokens,
                    "metadata": meta,
                })
            return chunks

        except Exception as exc:
            logger.warning(f"MarkdownNodeParser fallback chunking: {exc}")
            # Fallback paragraph splitter
            paragraphs = [p.strip() for p in markdown_text.split("\n\n") if p.strip()]
            return [
                {
                    "chunk_index": idx,
                    "content": p,
                    "token_count": len(p.split()),
                    "metadata": {"heading": "General", "parser": "paragraph_fallback"},
                }
                for idx, p in enumerate(paragraphs)
            ]
