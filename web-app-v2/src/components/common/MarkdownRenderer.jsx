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
 * Recursively inspects React children nodes so inline math delimiters inside <strong>, <em>, or nested elements are rendered via KaTeX.
 */
function processMathInNode(node) {
  if (typeof node === 'string') {
    return renderMathText(node);
  }

  if (React.isValidElement(node)) {
    const children = node.props?.children;
    if (!children) return node;

    const processedChildren = React.Children.map(children, (child) => processMathInNode(child));
    return React.cloneElement(node, {}, processedChildren);
  }

  return node;
}

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
            className="katex-display-block my-6 overflow-x-auto py-3 text-center"
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
            className="katex-inline px-0.5"
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
    ? 'prose prose-invert max-w-none font-sans text-slate-300 space-y-4'
    : 'prose max-w-none font-sans text-slate-700 space-y-4';

  return (
    <div className={proseClass}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p({ children }) {
            return (
              <p className="leading-relaxed text-slate-700 font-sans my-3">
                {React.Children.map(children, (child) => processMathInNode(child))}
              </p>
            );
          },
          h1({ children }) {
            return (
              <h1 className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight mt-8 mb-4 border-b border-slate-200/80 pb-2">
                {React.Children.map(children, (child) => processMathInNode(child))}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight mt-6 mb-3">
                {React.Children.map(children, (child) => processMathInNode(child))}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-lg font-bold text-slate-900 font-sans tracking-tight mt-5 mb-2">
                {React.Children.map(children, (child) => processMathInNode(child))}
              </h3>
            );
          },
          h4({ children }) {
            return (
              <h4 className="text-base font-bold text-slate-900 font-sans mt-4 mb-2">
                {React.Children.map(children, (child) => processMathInNode(child))}
              </h4>
            );
          },
          ul({ children }) {
            return <ul className="list-disc list-outside ml-6 space-y-2 my-3 text-slate-700">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-outside ml-6 space-y-2 my-3 text-slate-700">{children}</ol>;
          },
          li({ children }) {
            return (
              <li className="leading-relaxed font-sans">
                {React.Children.map(children, (child) => processMathInNode(child))}
              </li>
            );
          },
          strong({ children }) {
            return (
              <strong className="font-bold text-slate-900">
                {React.Children.map(children, (child) => processMathInNode(child))}
              </strong>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-blue-600 pl-4 py-1.5 italic bg-blue-50/50 rounded-r-xl text-slate-700 my-4">
                {children}
              </blockquote>
            );
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


