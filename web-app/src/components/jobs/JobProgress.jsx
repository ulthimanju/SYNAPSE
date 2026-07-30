import React from 'react';
import { Card } from '../common/Card';
import { JobStatusBadge } from './JobStatusBadge';
import { Sparkles, AlertCircle, CheckCircle2, Loader2, XCircle, Clock } from 'lucide-react';

const DEFAULT_SUMMARY_STEPS = [
  'Workspace Service',
  'Need Document Contexts',
  'Call Document Processing Service',
  'Receive Contexts',
  'Build AI Request',
  'Call AI Service',
  'Receive Summary',
  'Store Summary',
];

export const JobProgress = ({ job }) => {
  if (!job) return null;

  const { job_type, status, progress, error, retry_count, steps: jobSteps } = job;

  const formatJobType = (type) => {
    switch (type) {
      case 'SUMMARY': return 'Workspace Executive Summary';
      case 'LEARNING_PATH': return 'Pedagogical Learning Roadmap';
      case 'FLASHCARDS': return 'Spaced-Repetition Study Flashcards';
      case 'QUIZ': return 'Concept Mastery Assessment Quiz';
      default: return 'Background AI Generation';
    }
  };

  // Build 8 steps list
  const stepsList = DEFAULT_SUMMARY_STEPS.map((stepName) => {
    const found = Array.isArray(jobSteps) ? jobSteps.find((s) => s.name === stepName) : null;
    let stepStatus = found ? found.status : 'waiting';

    // Infer status if steps not available from backend
    if (!found) {
      if (status === 'COMPLETED') {
        stepStatus = 'completed';
      } else if (status === 'RUNNING') {
        stepStatus = 'started';
      }
    }

    return {
      name: stepName,
      status: stepStatus,
    };
  });

  const getStepIcon = (stepStatus) => {
    switch (stepStatus) {
      case 'completed':
        return <CheckCircle2 size={15} style={{ color: '#22c55e', flexShrink: 0 }} />;
      case 'started':
        return <Loader2 size={15} className="animate-spin" style={{ color: 'var(--accent-amber-hover)', flexShrink: 0 }} />;
      case 'failed':
        return <XCircle size={15} style={{ color: '#ef4444', flexShrink: 0 }} />;
      default:
        return <Clock size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />;
    }
  };

  const getStepBadgeStyle = (stepStatus) => {
    switch (stepStatus) {
      case 'completed':
        return {
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          color: '#22c55e',
          border: '1px solid rgba(34, 197, 94, 0.3)',
        };
      case 'started':
        return {
          backgroundColor: 'var(--accent-light)',
          color: 'var(--accent-amber-hover)',
          border: '1px solid var(--accent-amber)',
        };
      case 'failed':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        };
      default:
        return {
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-muted)',
          border: '1px solid var(--border-color)',
        };
    }
  };

  return (
    <Card className="editorial-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-amber)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} style={{ color: 'var(--accent-amber-hover)' }} />
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              SUMMARY GENERATION PIPELINE
            </span>
            <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
              Generating {formatJobType(job_type)}
            </div>
          </div>
        </div>

        <JobStatusBadge status={status} />
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.375rem', fontFamily: 'var(--font-mono)' }}>
          <span>Status: {status} {retry_count > 0 ? `(Retry ${retry_count}/3)` : ''}</span>
          <span>{progress}%</span>
        </div>
        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: status === 'FAILED' ? '#ef4444' : 'var(--accent-amber)',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {status === 'FAILED' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#EF4444', fontSize: '0.875rem', marginBottom: '1rem' }}>
          <AlertCircle size={16} />
          <span>{error || 'Generation failed after retries.'}</span>
        </div>
      )}

      {/* 8-Step Pipeline Tracker */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
          PIPELINE STAGE TRACKER (8 STEPS)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.625rem' }}>
          {stepsList.map((step, idx) => {
            const badgeStyle = getStepBadgeStyle(step.status);
            return (
              <div
                key={step.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.625rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.8125rem',
                }}
              >
                {getStepIcon(step.status)}
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {idx + 1}. {step.name}
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    ...badgeStyle,
                  }}
                >
                  {step.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
