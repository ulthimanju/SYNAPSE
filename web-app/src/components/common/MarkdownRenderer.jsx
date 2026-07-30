import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useThemeStore } from '../../stores/themeStore';

export const MarkdownRenderer = ({ content }) => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  if (!content) return null;

  return (
    <div className="markdown-body" style={{ lineHeight: 1.7, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1
              className="font-serif"
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '0.5rem',
                marginTop: '1.5rem',
                marginBottom: '1rem',
              }}
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="font-serif"
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '0.375rem',
                marginTop: '1.375rem',
                marginBottom: '0.875rem',
              }}
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="font-serif"
              style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginTop: '1.125rem',
                marginBottom: '0.625rem',
              }}
              {...props}
            />
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
          blockquote: ({ node, ...props }) => (
            <blockquote
              style={{
                borderLeft: '4px solid var(--accent-amber)',
                backgroundColor: 'var(--bg-secondary)',
                padding: '0.75rem 1rem',
                margin: '1rem 0',
                borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                color: 'var(--text-muted)',
                fontStyle: 'italic',
              }}
              {...props}
            />
          ),
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const strChildren = String(children || '').replace(/\n$/, '');
            const isInline = !match && !String(children || '').includes('\n');

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

            return (
              <div style={{ margin: '1rem 0', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <SyntaxHighlighter
                  style={isDark ? vscDarkPlus : vs}
                  language={language || 'text'}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    padding: '1rem',
                    backgroundColor: 'var(--bg-secondary)',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    fontFamily: 'var(--font-mono)',
                    border: 'none',
                  }}
                  {...props}
                >
                  {strChildren}
                </SyntaxHighlighter>
              </div>
            );
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
                padding: '0.625rem 0.875rem',
                textAlign: 'left',
                fontWeight: 600,
                borderBottom: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
              }}
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              style={{
                padding: '0.5rem 0.875rem',
                borderBottom: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
              }}
              {...props}
            />
          ),
          strong: ({ node, ...props }) => (
            <strong style={{ fontWeight: 600, color: 'var(--text-primary)' }} {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1.5rem 0' }} {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
