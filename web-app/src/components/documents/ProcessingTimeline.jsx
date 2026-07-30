import React from 'react';
import { StageIndicator } from './StageIndicator';

const STAGES = ['Uploaded', 'Parsed', 'Chunked', 'Embedding', 'Ready'];

export const ProcessingTimeline = ({ status, processingStage }) => {
  const getStageState = (stageName) => {
    const s = (status || '').toLowerCase();
    const stageKey = (processingStage || '').toLowerCase();

    // 1. If status is failed
    if (s === 'failed') {
      if (stageName === 'Uploaded') return 'completed';
      if (stageName === 'Ready') return 'pending';
      return 'failed';
    }

    // 2. If document is ready or completed
    if (s === 'ready' || s === 'completed' || stageKey === 'complete' || stageKey === 'ready') {
      return 'completed';
    }

    // 3. Stage index mapping
    const stageMap = {
      upload: 0,
      uploaded: 0,
      parse: 1,
      parsed: 1,
      chunk: 2,
      chunked: 2,
      embed: 3,
      embedding: 3,
      complete: 4,
      ready: 4,
    };

    const currentIdx = stageMap[stageKey] ?? stageMap[s] ?? 0;
    const targetIdx = STAGES.indexOf(stageName);

    if (targetIdx < currentIdx) return 'completed';
    if (targetIdx === currentIdx) return 'active';
    return 'pending';
  };

  return (
    <div style={{ padding: '1rem 0' }}>
      <div style={{
        fontSize: '0.72rem',
        fontWeight: 700,
        color: 'var(--text-muted)',
        marginBottom: '0.875rem',
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.06em',
      }}>
        PROCESSING PIPELINE STAGE TRACKER
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        {STAGES.map((stage) => (
          <StageIndicator key={stage} title={stage} state={getStageState(stage)} />
        ))}
      </div>
    </div>
  );
};
