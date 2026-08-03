import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Copy, Check } from 'lucide-react';

/**
 * Universal KaTeX Math Text Formatter
 * Pre-processes LaTeX math expressions ($...$ and $$...$$) directly into KaTeX HTML.
 */
function formatMathInText(rawText) {
  if (typeof rawText !== 'string' || !rawText) return rawText || '';

  // 1. Process block math $$ ... $$ or \[ ... \]
  let text = rawText.replace(/(\$\$|\\\[)([\s\S]+?)(\$\$|\\\])/g, (_, _open, math) => {
    try {
      return `<div class="katex-display-block my-4 overflow-x-auto py-2 text-center">${katex.renderToString(
        math.trim(),
        { displayMode: true, throwOnError: false }
      )}</div>`;
    } catch {
      return math;
    }
  });

  // 2. Process inline math $ ... $ or \( ... \)
  text = text.replace(/(\\\(|(?<!\$)\$)([^\$\n]+?)(\\\)|(?<!\$)\$)/g, (_, _open, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return math;
    }
  });

  return text;
}

export const MarkdownRenderer = ({ content, dark = false }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!content) return null;

  const processedContent = formatMathInText(content);

  const proseClass = dark
    ? 'prose prose-invert max-w-none prose-headings:font-sans prose-headings:font-bold prose-headings:text-white prose-p:text-slate-300 prose-p:leading-relaxed prose-li:text-slate-300 prose-code:text-blueprint-300 prose-code:bg-slate-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono'
    : 'prose max-w-none prose-headings:font-sans prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed prose-li:text-slate-700 prose-strong:text-slate-900 prose-code:text-blue-700 prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono';

  // If text contains KaTeX HTML tags (<span class="katex"> or <div class="katex-display-block">),
  // format basic markdown (bold, newlines) and render directly via dangerouslySetInnerHTML
  const hasRawHtml = /<span class="katex"|<div class="katex/.test(processedContent);

  if (hasRawHtml) {
    const formattedHtml = processedContent
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '<br/><br/>');

    return (
      <div
        className={proseClass}
        dangerouslySetInnerHTML={{ __html: formattedHtml }}
      />
    );
  }

  return (
    <div className={proseClass}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');

            if (!inline) {
              return (
                <div className="relative group my-4 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs font-mono text-slate-400">
                    <span>{match ? match[1].toUpperCase() : 'CODE'}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(codeString);
                        setCopiedIndex(codeString);
                        setTimeout(() => setCopiedIndex(null), 2000);
                      }}
                      className="flex items-center gap-1 hover:text-white transition cursor-pointer"
                    >
                      {copiedIndex === codeString ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 font-mono text-sm text-slate-200 overflow-x-auto">
                    <code>{codeString}</code>
                  </pre>
                </div>
              );
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};


