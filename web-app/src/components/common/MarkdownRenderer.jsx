import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy, AlertCircle, Info, AlertTriangle, Lightbulb, ShieldAlert } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { MermaidDiagram } from './MermaidDiagram';

/**
 * Normalizes input from Gemini LLM into clean, valid Markdown.
 * Handles objects, raw JSON strings, literal '\\n', unescaped wrappers, and LaTeX math tags.
 */
function normalizeContent(rawContent) {
  if (rawContent === null || rawContent === undefined) return '';

  let text = rawContent;

  // Handle object or array inputs
  if (typeof text === 'object') {
    if (text.overview) text = text.overview;
    else if (text.markdown) text = text.markdown;
    else if (text.content) text = text.content;
    else text = JSON.stringify(text, null, 2);
  }

  if (typeof text !== 'string') text = String(text);

  // If text is a raw JSON string wrapped in backticks or curly braces, attempt clean extraction
  text = text.trim();

  // Strip wrapping ```markdown or ```json if Gemini wrapped the entire payload in a top-level code fence
  if (/^```(?:markdown|text|json)?\n([\s\S]*)\n```$/i.test(text)) {
    const match = text.match(/^```(?:markdown|text|json)?\n([\s\S]*)\n```$/i);
    if (match && match[1]) text = match[1];
  }

  // Normalize literal '\n' sequences from double-escaped JSON strings
  if (text.includes('\\n') && !text.includes('\n')) {
    text = text.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
  }

  // Convert LaTeX math delimiters \[ ... \] to $$ ... $$ and \( ... \) to $ ... $
  text = text
    .replace(/\\\[([\s\S]*?)\\\]/g, '\n$$\n$1\n$$\n')
    .replace(/\\\(([\s\S]*?)\\\)/g, '$$1$');

  return text;
}

/**
 * Code Block Component with Language Badge and One-Click Copy
 */
const CodeBlock = ({ language, codeString, isDark }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        margin: '1.25rem 0',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-secondary)',
      }}
    >
      {/* Code Header Bar */}
      <div
        style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          padding: '0.4rem 0.85rem',
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
          borderBottom: '1px solid var(--border-color)',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
        }}
      >
        <span style={{ textTransform: 'lowercase', fontWeight: 600, color: 'var(--accent-amber)' }}>
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'none',
            border: 'none',
            color: copied ? '#10b981' : 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '0.75rem',
            padding: '2px 6px',
            borderRadius: '4px',
            transition: 'all 0.15s ease',
          }}
          title="Copy code to clipboard"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Syntax Highlighting */}
      <SyntaxHighlighter
        style={isDark ? vscDarkPlus : vs}
        language={language || 'text'}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: '1rem',
          backgroundColor: 'transparent',
          fontSize: '0.85rem',
          lineHeight: 1.55,
          fontFamily: 'var(--font-mono)',
          border: 'none',
        }}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
};

/**
 * GitHub-Style Callout Alert Box Component (> [!NOTE], > [!WARNING], > [!TIP], > [!IMPORTANT], > [!CAUTION])
 */
const AlertCallout = ({ type, title, children }) => {
  const alertStyles = {
    note: { bg: 'rgba(59, 130, 246, 0.08)', border: '#3b82f6', color: '#60a5fa', icon: Info },
    tip: { bg: 'rgba(16, 185, 129, 0.08)', border: '#10b981', color: '#34d399', icon: Lightbulb },
    important: { bg: 'rgba(168, 85, 247, 0.08)', border: '#a855f7', color: '#c084fc', icon: AlertCircle },
    warning: { bg: 'rgba(245, 158, 11, 0.08)', border: '#f59e0b', color: '#fbbf24', icon: AlertTriangle },
    caution: { bg: 'rgba(239, 68, 68, 0.08)', border: '#ef4444', color: '#f87171', icon: ShieldAlert },
  };

  const style = alertStyles[type.toLowerCase()] || alertStyles.note;
  const IconComponent = style.icon;

  return (
    <div
      style={{
        margin: '1.25rem 0',
        padding: '0.85rem 1.15rem',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: style.bg,
        borderLeft: `4px solid ${style.border}`,
        borderTop: '1px solid var(--border-color)',
        borderRight: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
        <IconComponent size={16} style={{ color: style.border }} />
        <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: style.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title || type}
        </span>
      </div>
      <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{children}</div>
    </div>
  );
};

export const MarkdownRenderer = ({ content }) => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const normalizedText = normalizeContent(content);
  if (!normalizedText) return null;

  return (
    <div className="markdown-body" style={{ lineHeight: 1.7, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1
              className="font-serif"
              style={{
                fontSize: '1.6rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '0.5rem',
                marginTop: '1.75rem',
                marginBottom: '1rem',
              }}
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="font-serif"
              style={{
                fontSize: '1.3rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '0.375rem',
                marginTop: '1.5rem',
                marginBottom: '0.875rem',
              }}
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="font-serif"
              style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginTop: '1.25rem',
                marginBottom: '0.625rem',
              }}
              {...props}
            />
          ),
          h4: ({ node, ...props }) => (
            <h4
              style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--accent-amber)',
                marginTop: '1.1rem',
                marginBottom: '0.5rem',
              }}
              {...props}
            />
          ),
          h5: ({ node, ...props }) => (
            <h5 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '1rem' }} {...props} />
          ),
          h6: ({ node, ...props }) => (
            <h6 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.85rem' }} {...props} />
          ),
          p: ({ node, ...props }) => (
            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }} {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem', color: 'var(--text-secondary)', listStyleType: 'disc' }} {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol style={{ paddingLeft: '1.5rem', marginBottom: '1rem', color: 'var(--text-secondary)', listStyleType: 'decimal' }} {...props} />
          ),
          li: ({ node, ...props }) => (
            <li style={{ marginBottom: '0.375rem', lineHeight: 1.6 }} {...props} />
          ),
          a: ({ node, ...props }) => (
            <a style={{ color: 'var(--accent-amber-hover)', textDecoration: 'underline', textUnderlineOffset: '3px' }} target="_blank" rel="noreferrer" {...props} />
          ),
          blockquote: ({ node, children, ...props }) => {
            // Check for GitHub alert callouts (> [!NOTE], > [!WARNING], > [!TIP], > [!IMPORTANT], > [!CAUTION])
            const childArray = React.Children.toArray(children);
            const firstParagraph = childArray[0];
            
            if (firstParagraph && firstParagraph.props && firstParagraph.props.children) {
              const paraChildren = React.Children.toArray(firstParagraph.props.children);
              const firstString = typeof paraChildren[0] === 'string' ? paraChildren[0] : '';
              
              const match = firstString.match(/^\[\!(NOTE|WARNING|TIP|IMPORTANT|CAUTION)\]/i);
              if (match) {
                const alertType = match[1].toLowerCase();
                const cleanFirstString = firstString.replace(/^\[\!(NOTE|WARNING|TIP|IMPORTANT|CAUTION)\]/i, '').trim();
                
                const remainingParaChildren = [cleanFirstString, ...paraChildren.slice(1)];
                const remainingContent = [
                  React.cloneElement(firstParagraph, {}, remainingParaChildren),
                  ...childArray.slice(1)
                ];

                return <AlertCallout type={alertType}>{remainingContent}</AlertCallout>;
              }
            }

            return (
              <blockquote
                style={{
                  borderLeft: '4px solid var(--accent-amber)',
                  backgroundColor: 'var(--bg-secondary)',
                  padding: '0.75rem 1rem',
                  margin: '1.15rem 0',
                  borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                  color: 'var(--text-muted)',
                  fontStyle: 'italic',
                }}
                {...props}
              >
                {children}
              </blockquote>
            );
          },
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeString = String(children || '').replace(/\n$/, '');
            const isInline = !match && !String(children || '').includes('\n');

            // Render Inline Code
            if (isInline) {
              return (
                <code
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--accent-amber-hover)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85em',
                    border: '1px solid var(--border-color)',
                  }}
                  {...props}
                >
                  {children}
                </code>
              );
            }

            // Render Interactive Mermaid Diagrams
            if (language === 'mermaid') {
              return <MermaidDiagram content={codeString} />;
            }

            // Render Code Block with Language Badge & Copy Button
            return <CodeBlock language={language} codeString={codeString} isDark={isDark} />;
          },
          table: ({ node, ...props }) => (
            <div style={{ overflowX: 'auto', marginBottom: '1.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.875rem',
                }}
                {...props}
              />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th
              style={{
                backgroundColor: 'var(--bg-secondary)',
                padding: '0.65rem 0.9rem',
                textAlign: 'left',
                fontWeight: 600,
                borderBottom: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              style={{
                padding: '0.55rem 0.9rem',
                borderBottom: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
              }}
              {...props}
            />
          ),
          strong: ({ node, ...props }) => (
            <strong style={{ fontWeight: 600, color: 'var(--text-primary)' }} {...props} />
          ),
          em: ({ node, ...props }) => (
            <em style={{ fontStyle: 'italic', color: 'var(--text-primary)' }} {...props} />
          ),
          del: ({ node, ...props }) => (
            <del style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }} {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1.5rem 0' }} {...props} />
          ),
          input: ({ node, type, checked, ...props }) => {
            if (type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  style={{
                    marginRight: '0.5rem',
                    accentColor: 'var(--accent-amber)',
                    cursor: 'default',
                  }}
                  {...props}
                />
              );
            }
            return <input type={type} {...props} />;
          },
        }}
      >
        {normalizedText}
      </ReactMarkdown>
    </div>
  );
};

