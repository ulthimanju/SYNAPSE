import React from 'react';
import { FileText, Check, Info, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { FileUploadCard } from './FileUploadCard';

export const DocumentsTab = ({ documents = [], onUpload, onDelete, onRetry, isUploading, isDeleting }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Jul 31, 2026';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0.00 MB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Left Documents List */}
      <div className="lg:col-span-2 space-y-6">
        {/* Section Title */}
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-mono font-extrabold tracking-widest text-slate-400 uppercase">
            WORKSPACE DOCUMENTS
          </h2>
          <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#cff4fc] text-[#0891b2]">
            {documents.length}
          </span>
        </div>

        {/* Document Cards */}
        {documents.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-slate-800 font-semibold text-sm">No documents uploaded yet</p>
            <p className="text-slate-400 text-xs max-w-md mx-auto">
              Upload your study PDFs, lecture notes, or docs using the panel on the right to start building your neural workspace.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => {
              const isProcessed = doc.status === 'PROCESSED' || doc.status === 'COMPLETED' || doc.status === 'SUCCESS' || doc.status === 'ready';
              const isFailed = doc.status === 'FAILED' || doc.status === 'ERROR' || doc.status === 'failed';
              const isProcessing = doc.status === 'PROCESSING' || doc.status === 'PENDING' || doc.status === 'processing' || doc.status === 'uploaded';

              return (
                <div
                  key={doc.id || doc._id}
                  className="flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 transition shadow-sm group"
                >
                  {/* Left Metadata */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#cff4fc] border border-cyan-100 flex items-center justify-center text-[#0891b2] flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 truncate space-y-0.5">
                      <h4 className="font-bold text-sm text-slate-800 truncate font-sans">
                        {doc.filename}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono">
                        {formatSize(doc.file_size)} • {formatDate(doc.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Right Status & Actions */}
                  <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                    {/* Status Badge */}
                    {isProcessed && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                        <Check className="w-4 h-4" />
                        <span>Uploaded</span>
                      </span>
                    )}

                    {isProcessing && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-500 animate-pulse">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Parsing...</span>
                      </span>
                    )}

                    {isFailed && (
                      <button
                        onClick={() => onRetry && onRetry(doc.id || doc._id)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:underline cursor-pointer"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Retry</span>
                      </button>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 text-slate-400">
                      <button
                        className="p-1.5 rounded-lg hover:text-slate-700 hover:bg-slate-100 transition"
                        title="Document Details"
                      >
                        <Info className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDelete(doc.id || doc._id)}
                        disabled={isDeleting}
                        className="p-1.5 rounded-lg hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right File Upload Card */}
      <div className="flex justify-center">
        <FileUploadCard onUpload={onUpload} isUploading={isUploading} />
      </div>
    </div>
  );
};
