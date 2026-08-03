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
/**
 * Custom renderer for text segments that converts math expressions ($...$, $$...$$, \(...\), \[...\]) into KaTeX HTML elements.
 */
function renderMathText(text) {
  if (typeof text !== 'string' || !text) return text;

  // Split text by display math ($$...$$ or \[...\]) and inline math ($...$ or \(...\))
  const mathRegex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|(?<!\$)\$[^\$\n]+?\$(?!\$)|\\\([\s\S]+?\\\))/g;
  const parts = text.split(mathRegex);

  return parts.map((part, idx) => {
    if (!part) return null;

    const isDisplay = part.startsWith('$$') || part.startsWith('\\[');
    const isInline = !isDisplay && (part.startsWith('$') || part.startsWith('\\('));

    if (isDisplay) {
      const cleanMath = part.replace(/^(\$\$|\\\[)/, '').replace(/(\$\$|\\\])$/, '').trim();
      try {
        const html = katex.renderToString(cleanMath, { displayMode: true, throwOnError: false });
        return (
          <div
            key={idx}
            className="katex-display-block my-4 overflow-x-auto py-2 text-center"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch {
        return <code key={idx}>{part}</code>;
      }
    }

    if (isInline) {
      const cleanMath = part.replace(/^(\$|\\\()/, '').replace(/(\$|\\\))$/, '').trim();
      try {
        const html = katex.renderToString(cleanMath, { displayMode: false, throwOnError: false });
        return (
          <span
            key={idx}
            className="katex-inline"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch {
        return <code key={idx}>{part}</code>;
      }
    }

    return part;
  });
}

export const MarkdownRenderer = ({ content, dark = false }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!content) return null;

  const proseClass = dark
    ? 'prose prose-invert max-w-none prose-headings:font-sans prose-headings:font-bold prose-headings:text-white prose-p:text-slate-300 prose-p:leading-relaxed prose-li:text-slate-300 prose-code:text-blueprint-300 prose-code:bg-slate-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono'
    : 'prose max-w-none prose-headings:font-sans prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed prose-li:text-slate-700 prose-strong:text-slate-900 prose-code:text-blue-700 prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono';

  return (
    <div className={proseClass}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Render plain text nodes and headings with math support
          p({ children }) {
            return <p>{React.Children.map(children, (child) => (typeof child === 'string' ? renderMathText(child) : child))}</p>;
          },
          li({ children }) {
            return <li>{React.Children.map(children, (child) => (typeof child === 'string' ? renderMathText(child) : child))}</li>;
          },
          h1({ children }) {
            return <h1>{React.Children.map(children, (child) => (typeof child === 'string' ? renderMathText(child) : child))}</h1>;
          },
          h2({ children }) {
            return <h2>{React.Children.map(children, (child) => (typeof child === 'string' ? renderMathText(child) : child))}</h2>;
          },
          h3({ children }) {
            return <h3>{React.Children.map(children, (child) => (typeof child === 'string' ? renderMathText(child) : child))}</h3>;
          },
          h4({ children }) {
            return <h4>{React.Children.map(children, (child) => (typeof child === 'string' ? renderMathText(child) : child))}</h4>;
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
        {content}
      </ReactMarkdown>
    </div>
  );
};


