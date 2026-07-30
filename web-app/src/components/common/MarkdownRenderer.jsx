import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const MarkdownRenderer = ({ content }) => {
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
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }} {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol style={{ paddingLeft: '1.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }} {...props} />
          ),
          li: ({ node, ...props }) => (
            <li style={{ marginBottom: '0.375rem', lineHeight: 1.6 }} {...props} />
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
          code: ({ node, inline, className, children, ...props }) => {
            if (inline) {
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
              <pre
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  overflowX: 'auto',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  margin: '1rem 0',
                  color: 'var(--text-primary)',
                }}
              >
                <code {...props}>{children}</code>
              </pre>
            );
          },
          table: ({ node, ...props }) => (
            <div style={{ overflowX: 'auto', marginBottom: '1.25rem' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.875rem',
                  border: '1px solid var(--border-color)',
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
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
              }}
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              style={{
                padding: '0.5rem 0.875rem',
                border: '1px solid var(--border-color)',
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
