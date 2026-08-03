import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Copy, Check, GitBranch } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// ─── Mermaid Diagram ──────────────────────────────────────────────────────────
const MermaidDiagram = ({ code }) => {
  const ref = useRef(null);
  const [error, setError] = useState(false);
  const [svg, setSvg] = useState('');

  useEffect(() => {
    let cancelled = false;
    setSvg('');
    setError(false);

    import('mermaid').then(({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: {
          primaryColor: '#cff4fc',
          primaryBorderColor: '#0891b2',
          primaryTextColor: '#1c3d98',
          lineColor: '#94a3b8',
          secondaryColor: '#eff6ff',
          tertiaryColor: '#f8fafc',
          background: '#ffffff',
          mainBkg: '#f8fafc',
          nodeBorder: '#cbd5e1',
          clusterBkg: '#f1f5f9',
          titleColor: '#0f172a',
          edgeLabelBackground: '#f8fafc',
          fontFamily: 'Inter, ui-sans-serif, system-ui',
          fontSize: '13px',
        },
      });

      const id = `mermaid-${Math.random().toString(36).slice(2)}`;
      mermaid.render(id, code)
        .then(({ svg: renderedSvg }) => {
          if (!cancelled) setSvg(renderedSvg);
        })
        .catch(() => {
          if (!cancelled) setError(true);
        });
    }).catch(() => {
      if (!cancelled) setError(true);
    });

    return () => { cancelled = true; };
  }, [code]);

  if (error) return null;
  if (!svg) return (
    <div className="flex items-center gap-2 py-4 text-slate-400 text-xs font-mono">
      <GitBranch className="w-3.5 h-3.5 animate-pulse" />
      Rendering diagram...
    </div>
  );

  return (
    <div
      className="my-3 p-4 rounded-xl bg-white border border-slate-200 overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

// ─── Math Text Helpers ────────────────────────────────────────────────────────
function processMathInNode(node) {
  if (typeof node === 'string') return renderMathText(node);
  if (React.isValidElement(node)) {
    const children = node.props?.children;
    if (!children) return node;
    const processed = React.Children.map(children, processMathInNode);
    return React.cloneElement(node, {}, processed);
  }
  return node;
}

function renderMathText(text) {
  if (typeof text !== 'string' || !text) return text;
  const mathRegex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|(?<!\$)\$[^\$\n]+?\$(?!\$)|\\\([\s\S]+?\\\))/g;
  const parts = text.split(mathRegex);
  return parts.map((part, idx) => {
    if (!part) return null;
    const isDisplay = part.startsWith('$$') || part.startsWith('\\[');
    const isInline = !isDisplay && (part.startsWith('$') || part.startsWith('\\('));
    if (isDisplay) {
      const clean = part.replace(/^(\$\$|\\\[)/, '').replace(/(\$\$|\\\])$/, '').trim();
      try {
        const html = katex.renderToString(clean, { displayMode: true, throwOnError: false });
        return <div key={idx} className="my-4 overflow-x-auto text-center" dangerouslySetInnerHTML={{ __html: html }} />;
      } catch { return <code key={idx}>{part}</code>; }
    }
    if (isInline) {
      const clean = part.replace(/^(\$|\\\()/, '').replace(/(\$|\\\))$/, '').trim();
      try {
        const html = katex.renderToString(clean, { displayMode: false, throwOnError: false });
        return <span key={idx} className="katex-inline" dangerouslySetInnerHTML={{ __html: html }} />;
      } catch { return <code key={idx}>{part}</code>; }
    }
    return part;
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const MarkdownRenderer = ({ content, dark = false, codeTitle = null }) => {
  const [copiedKey, setCopiedKey] = useState(null);

  if (!content) return null;

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Compact, themed typography
  const p       = 'leading-relaxed text-slate-700 text-sm my-1.5';
  const h1c     = 'text-xl font-extrabold text-[#1c3d98] tracking-tight mt-5 mb-1.5 pb-1.5 border-b border-slate-200';
  const h2c     = 'text-lg font-bold text-[#1c3d98] tracking-tight mt-4 mb-1';
  const h3c     = 'text-base font-bold text-slate-800 mt-3 mb-1';
  const h4c     = 'text-sm font-bold text-slate-700 mt-2 mb-0.5';
  const ulc     = 'list-disc list-outside ml-5 space-y-0.5 my-1.5 text-slate-700 text-sm';
  const olc     = 'list-decimal list-outside ml-5 space-y-0.5 my-1.5 text-slate-700 text-sm';
  const lic     = 'leading-relaxed';
  const bqc     = 'border-l-4 border-[#1c3d98] pl-3 py-1 bg-blue-50/60 rounded-r-lg text-slate-600 italic my-2 text-sm';
  const tablec  = 'w-full text-xs border-collapse my-2';
  const thc     = 'px-3 py-2 bg-[#1c3d98] text-white font-semibold text-left font-mono border border-blue-800';
  const tdc     = 'px-3 py-2 text-slate-700 border border-slate-200 align-top';
  const trc     = 'even:bg-slate-50/70';
  const inlinec = 'font-mono text-xs px-1.5 py-0.5 rounded bg-blue-50 text-[#1c3d98] border border-blue-100';

  return (
    <div className="max-w-none font-sans">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p({ children }) {
            return <p className={p}>{React.Children.map(children, processMathInNode)}</p>;
          },
          h1({ children }) {
            return <h1 className={h1c}>{React.Children.map(children, processMathInNode)}</h1>;
          },
          h2({ children }) {
            return <h2 className={h2c}>{React.Children.map(children, processMathInNode)}</h2>;
          },
          h3({ children }) {
            return <h3 className={h3c}>{React.Children.map(children, processMathInNode)}</h3>;
          },
          h4({ children }) {
            return <h4 className={h4c}>{React.Children.map(children, processMathInNode)}</h4>;
          },
          ul({ children }) { return <ul className={ulc}>{children}</ul>; },
          ol({ children }) { return <ol className={olc}>{children}</ol>; },
          li({ children }) {
            return <li className={lic}>{React.Children.map(children, processMathInNode)}</li>;
          },
          strong({ children }) {
            return <strong className="font-bold text-slate-900">{React.Children.map(children, processMathInNode)}</strong>;
          },
          em({ children }) {
            return <em className="italic text-slate-600">{React.Children.map(children, processMathInNode)}</em>;
          },
          blockquote({ children }) {
            return <blockquote className={bqc}>{children}</blockquote>;
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-3 rounded-xl border border-slate-200 shadow-xs">
                <table className={tablec}>{children}</table>
              </div>
            );
          },
          thead({ children }) { return <thead>{children}</thead>; },
          tbody({ children }) { return <tbody>{children}</tbody>; },
          tr({ children }) { return <tr className={trc}>{children}</tr>; },
          th({ children }) { return <th className={thc}>{children}</th>; },
          td({ children }) { return <td className={tdc}>{children}</td>; },
          a({ href, children }) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer"
                className="text-[#1c3d98] underline underline-offset-2 hover:text-blue-700 transition text-sm font-medium">
                {children}
              </a>
            );
          },
          hr() {
            return <hr className="my-4 border-slate-200" />;
          },

          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const lang = match?.[1] || '';
            const codeString = String(children).replace(/\n$/, '');

            if (!inline) {
              // Render mermaid diagrams — hide silently on error
              if (lang === 'mermaid') {
                return <MermaidDiagram code={codeString} />;
              }

              const hlStyle = dark ? oneDark : oneLight;
              const headerBg = dark ? '#1e293b' : '#f1f5f9';
              const headerBorder = dark ? '#334155' : '#e2e8f0';
              const headerText = dark ? '#94a3b8' : '#1c3d98';

              return (
                <div className={`relative group my-3 rounded-xl overflow-hidden border ${dark ? 'border-slate-700' : 'border-slate-200'} shadow-xs`}>
                  {/* 3-column header: lang | title (center) | copy */}
                  <div
                    className="grid px-3 py-1.5 text-xs font-mono font-bold items-center"
                    style={{
                      gridTemplateColumns: '1fr auto 1fr',
                      background: headerBg,
                      borderBottom: `1px solid ${headerBorder}`,
                      color: headerText,
                    }}
                  >
                    {/* Left: language label */}
                    <span className="justify-self-start">{lang ? lang.toUpperCase() : 'CODE'}</span>

                    {/* Center: code title */}
                    {codeTitle && (
                      <span
                        className="justify-self-center text-center font-sans font-semibold truncate max-w-xs px-2"
                        style={{ color: headerText }}
                      >
                        {codeTitle}
                      </span>
                    )}
                    {!codeTitle && <span />}

                    {/* Right: copy button */}
                    <button
                      onClick={() => copy(codeString)}
                      className="justify-self-end flex items-center gap-1 hover:opacity-70 transition cursor-pointer"
                    >
                      {copiedKey === codeString ? (
                        <><Check className="w-3 h-3 text-emerald-600" /><span className="text-emerald-600">Copied</span></>
                      ) : (
                        <><Copy className="w-3 h-3" /><span>Copy</span></>
                      )}
                    </button>
                  </div>

                  {/* Syntax-highlighted code — no background */}
                  <SyntaxHighlighter
                    style={hlStyle}
                    language={lang || 'text'}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      padding: '0.75rem 1rem',
                      fontSize: '0.78rem',
                      lineHeight: '1.6',
                      background: dark ? '#0f172a' : '#ffffff',
                      borderRadius: 0,
                    }}
                    codeTagProps={{ style: { fontFamily: "'JetBrains Mono', 'Fira Code', monospace" } }}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              );
            }

            // Inline code
            return <code className={inlinec} {...props}>{children}</code>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
