import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { DifficultyBadge } from './DifficultyBadge';
import { StudyTimeCard } from './StudyTimeCard';
import { TopicList } from './TopicList';
import { MermaidDiagram } from '../common/MermaidDiagram';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useThemeStore } from '../../stores/themeStore';
import { Sparkles, RefreshCw, Code, Copy, Check, X, Table, FileCode, GitBranch } from 'lucide-react';

export const SummaryCard = ({ summary, onRegenerate, loading = false }) => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedCodeIdx, setCopiedCodeIdx] = useState(null);

  if (!summary) return null;

  const jsonString = JSON.stringify(summary, null, 2);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleCopyCode = (code, idx) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  // Helper to format Markdown Overview headers and paragraphs
  const renderFormattedOverview = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) {
        return (
          <h2 key={idx} className="font-serif" style={{ fontSize: '1.35rem', color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.375rem' }}>
            {trimmed.replace('# ', '')}
          </h2>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h3 key={idx} style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--accent-amber-hover)', marginTop: '1.25rem', marginBottom: '0.375rem' }}>
            {trimmed.replace('## ', '')}
          </h3>
        );
      }
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={idx} style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '1rem', marginBottom: '0.25rem' }}>
            {trimmed.replace('### ', '')}
          </h4>
        );
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <li key={idx} style={{ marginLeft: '1.25rem', fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.25rem' }}>
            {trimmed.substring(2)}
          </li>
        );
      }

      if (!trimmed) return <div key={idx} style={{ height: '0.5rem' }} />;
      return (
        <p key={idx} style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '0.75rem' }}>
          {trimmed}
        </p>
      );
    });
  };

  const visualizations = summary.visualizations || [];
  const comparisonTables = summary.comparison_tables || [];
  const codeExamples = summary.code_examples || [];

  return (
    <Card className="editorial-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Card Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <div>
          <span className="editorial-badge" style={{ marginBottom: '0.25rem' }}>AI EXECUTIVE SYNTHESIS</span>
          <h2 className="font-serif" style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>{summary.title}</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <DifficultyBadge difficulty={summary.difficulty} />
          
          <Button variant="outline" size="sm" onClick={() => setShowJsonModal(true)}>
            <Code size={14} />
            <span>View Raw JSON</span>
          </Button>

          {onRegenerate && (
            <Button variant="outline" size="sm" onClick={onRegenerate} disabled={loading}>
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>{loading ? 'Synthesizing...' : 'Regenerate'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '1.75rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Section: Extensive Overview */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
              OVERVIEW & TEXTBOOK SYNTHESIS
            </div>
            <MarkdownRenderer content={summary.overview} />
          </div>

          {/* Section: Mermaid Visualizations */}
          {visualizations.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                <GitBranch size={15} />
                <span>CONCEPT VISUALIZATIONS ({visualizations.length})</span>
              </div>
              {visualizations.map((v, i) => (
                <MermaidDiagram key={i} title={v.title} content={v.content} />
              ))}
            </div>
          )}

          {/* Section: Comparison Tables */}
          {comparisonTables.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                <Table size={15} />
                <span>COMPARATIVE ANALYSIS ({comparisonTables.length})</span>
              </div>
              {comparisonTables.map((tbl, i) => (
                <div key={i} style={{ marginBottom: '1.25rem', overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  {tbl.title && (
                    <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-secondary)', fontWeight: 600, fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                      {tbl.title}
                    </div>
                  )}
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    {tbl.headers && tbl.headers.length > 0 && (
                      <thead>
                        <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                          {tbl.headers.map((h, idx) => (
                            <th key={idx} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                    )}
                    <tbody>
                      {tbl.rows && tbl.rows.map((row, rIdx) => (
                        <tr key={rIdx} style={{ borderBottom: rIdx < tbl.rows.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)' }}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          {/* Section: Code Examples */}
          {codeExamples.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                <FileCode size={15} />
                <span>PRACTICAL IMPLEMENTATION EXAMPLES ({codeExamples.length})</span>
              </div>
              {codeExamples.map((item, idx) => (
                <div key={idx} style={{ marginBottom: '1.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', uppercase: true }}>
                        {item.language || 'CODE'}
                      </span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</span>
                    </div>
                    <button
                      onClick={() => handleCopyCode(item.code, idx)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
                    >
                      {copiedCodeIdx === idx ? <Check size={14} style={{ color: '#22c55e' }} /> : <Copy size={14} />}
                      <span>{copiedCodeIdx === idx ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <SyntaxHighlighter
                    style={isDark ? vscDarkPlus : vs}
                    language={(item.language || 'text').toLowerCase()}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      padding: '0.875rem 1rem',
                      backgroundColor: 'var(--bg-secondary)',
                      fontSize: '0.8125rem',
                      fontFamily: 'var(--font-mono)',
                      lineHeight: 1.5,
                      border: 'none',
                    }}
                  >
                    {item.code}
                  </SyntaxHighlighter>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <StudyTimeCard studyTime={summary.estimated_study_time} />
          <TopicList topics={summary.key_topics} />
        </div>
      </div>

      {/* Raw JSON Modal */}
      {showJsonModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
          onClick={() => setShowJsonModal(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Code size={16} style={{ color: 'var(--accent-amber)' }} />
                <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  Gemini Raw Response JSON
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Button variant="outline" size="sm" onClick={handleCopyJson}>
                  {copiedJson ? <Check size={14} style={{ color: '#22c55e' }} /> : <Copy size={14} />}
                  <span>{copiedJson ? 'Copied' : 'Copy'}</span>
                </Button>
                <button
                  onClick={() => setShowJsonModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '4px' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div style={{ padding: '1.25rem', overflowY: 'auto', backgroundColor: '#0d1117', flex: 1 }}>
              <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: '#e6edf3', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                <code>{jsonString}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
