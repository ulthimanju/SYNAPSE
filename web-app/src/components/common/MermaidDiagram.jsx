import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'var(--font-sans)',
});

export const MermaidDiagram = ({ content, title }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!content || !containerRef.current) return;

    const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
    containerRef.current.innerHTML = `<div id="${id}">${content}</div>`;

    try {
      mermaid.render(id, content).then(({ svg }) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      }).catch((err) => {
        console.warn('Mermaid rendering notice:', err);
      });
    } catch (err) {
      console.warn('Mermaid render exception:', err);
    }
  }, [content]);

  if (!content) return null;

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-sm)',
        padding: '1rem',
        marginTop: '1rem',
        marginBottom: '1rem',
        overflowX: 'auto',
      }}
    >
      {title && (
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--accent-amber)',
            fontFamily: 'var(--font-mono)',
            marginBottom: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {title}
        </div>
      )}
      <div ref={containerRef} style={{ display: 'flex', justifyContent: 'center' }} />
    </div>
  );
};
