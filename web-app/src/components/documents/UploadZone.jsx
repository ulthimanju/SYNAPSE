import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../common/Button';

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * UploadZone — supports multi-file drag-and-drop and click-to-browse.
 * Props:
 *   onUpload(files: File[])  — called with an array of selected files
 *   uploadStatuses: { [filename]: 'pending' | 'uploading' | 'done' | 'error' }
 *   loading: bool — true while any upload is in progress
 */
export const UploadZone = ({ onUpload, uploadStatuses = {}, loading = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [queued, setQueued] = useState([]); // Files staged before upload starts
  const fileInputRef = useRef(null);

  const addFiles = (fileList) => {
    const files = Array.from(fileList);
    if (!files.length) return;
    setQueued((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const fresh = files.filter((f) => !existingNames.has(f.name));
      return [...prev, ...fresh];
    });
  };

  const removeQueued = (name) => {
    setQueued((prev) => prev.filter((f) => f.name !== name));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e) => {
    addFiles(e.target.files);
    // Reset input so the same file can be re-selected if needed
    e.target.value = '';
  };

  const handleUploadClick = () => {
    if (!queued.length) return;
    onUpload(queued);
    setQueued([]);
  };

  // Determine icon for each queued file based on upload status
  const statusIcon = (file) => {
    const s = uploadStatuses[file.name];
    if (s === 'done') return <CheckCircle2 size={14} style={{ color: 'var(--accent-amber-hover)' }} />;
    if (s === 'error') return <AlertCircle size={14} style={{ color: '#ef4444' }} />;
    if (s === 'uploading') return <Loader2 size={14} className="animate-spin" style={{ color: 'var(--text-muted)' }} />;
    return <FileText size={14} style={{ color: 'var(--text-muted)' }} />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !loading && fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? 'var(--accent-amber)' : 'var(--border-color)'}`,
          backgroundColor: isDragging ? 'var(--accent-light)' : 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept=".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg,.csv"
          style={{ display: 'none' }}
        />

        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: 'var(--accent-light)',
          color: 'var(--accent-amber-hover)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {loading
            ? <Loader2 size={26} className="animate-spin" />
            : <UploadCloud size={26} />}
        </div>

        <div>
          <h4 className="font-serif" style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>
            {loading ? 'Uploading files…' : 'Drag & Drop files here'}
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Supports PDF, DOCX, TXT, MD, images — multiple files at once — up to 50 MB each
          </p>
        </div>

        {!loading && (
          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
          >
            Browse Files
          </Button>
        )}
      </div>

      {/* Staged file queue */}
      {queued.length > 0 && (
        <div style={{
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '0.5rem 0.75rem',
            fontSize: '0.72rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-secondary)',
            letterSpacing: '0.06em',
          }}>
            {queued.length} FILE{queued.length > 1 ? 'S' : ''} READY TO UPLOAD
          </div>

          <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
            {queued.map((file) => (
              <div
                key={file.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.5rem 0.75rem',
                  borderBottom: '1px solid var(--border-color)',
                  fontSize: '0.825rem',
                }}
              >
                {statusIcon(file)}
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.name}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', flexShrink: 0 }}>
                  {formatBytes(file.size)}
                </span>
                {!loading && (
                  <button
                    onClick={() => removeQueued(file.name)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', color: 'var(--text-muted)' }}
                    title="Remove"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div style={{ padding: '0.5rem 0.75rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button variant="secondary" size="sm" disabled={loading} onClick={() => setQueued([])}>
              Clear
            </Button>
            <Button size="sm" disabled={loading} onClick={handleUploadClick}>
              {loading ? 'Uploading…' : `Upload ${queued.length} File${queued.length > 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
