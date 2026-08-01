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

  // 1. Process block math $$ ... $$
  let text = rawText.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
    try {
      return `\n\n<div class="katex-display-block my-4 overflow-x-auto py-2 text-center">${katex.renderToString(
        math.trim(),
        { displayMode: true, throwOnError: false }
      )}</div>\n\n`;
    } catch {
      return `\n\n$$${math}$$\n\n`;
    }
  });

  // 2. Process inline math $ ... $
  text = text.replace(/(?<!\$)\$([^\$\n]+?)\$(?!\$)/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return `$${math}$`;
    }
  });

  return text;
}

export const MarkdownRenderer = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!content) return null;

  const processedContent = formatMathInText(content);

  return (
    <div className="prose prose-invert max-w-none prose-headings:font-sans prose-headings:font-bold prose-headings:text-white prose-p:text-slate-300 prose-p:leading-relaxed prose-li:text-slate-300 prose-code:text-blueprint-300 prose-code:bg-slate-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Direct HTML rendering for pre-processed KaTeX blocks
          div({ className, children, ...props }) {
            if (className && className.includes('katex-display-block')) {
              return <div className={className} dangerouslySetInnerHTML={{ __html: children }} {...props} />;
            }
            return <div className={className} {...props}>{children}</div>;
          },

          // Code block with One-Click Copy button
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
