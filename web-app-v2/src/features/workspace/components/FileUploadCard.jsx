import React, { useRef, useState } from 'react';
import { Upload, Check } from 'lucide-react';
import { toast } from 'sonner';

export const FileUploadCard = ({ onUpload, isUploading }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > 50 * 1024 * 1024) {
        toast.error(`File '${file.name}' exceeds 50MB limit.`);
        continue;
      }

      const formData = new FormData();
      formData.append('file', file);

      try {
        await onUpload(formData);
        toast.success(`Uploaded '${file.name}' successfully! Ingestion started.`);
      } catch (err) {
        toast.error(`Failed to upload '${file.name}'.`);
      }
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
      }}
      className={`relative w-full max-w-sm rounded-3xl p-8 bg-[#1d3d9e] text-white overflow-hidden shadow-2xl transition-all duration-300 border ${
        isDragging ? 'border-white scale-[1.02]' : 'border-blue-400/30'
      }`}
    >
      {/* Blueprint Grid Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
        }}
      />

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.txt,.md,image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      <div className="relative z-10 flex flex-col items-center text-center space-y-6">
        {/* Upload Circle Icon */}
        <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner">
          <Upload className="w-7 h-7" />
        </div>

        {/* Header & Description */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold tracking-tight text-white font-sans">
            Drag & drop files
          </h3>
          <p className="text-xs text-blue-100/80 leading-relaxed max-w-xs">
            Drop documents here to add them to this workspace's knowledge base.
          </p>
        </div>

        {/* Browse Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full py-3 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 shadow transition cursor-pointer active:scale-98"
        >
          {isUploading ? 'Uploading & Parsing...' : 'Browse files'}
        </button>

        {/* Feature Bullet List */}
        <ul className="w-full space-y-2.5 text-left text-xs text-blue-100/90 pt-2 border-t border-white/10 font-sans">
          <li className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-blue-300 flex-shrink-0" />
            <span>PDF, DOCX, TXT, MD, images</span>
          </li>
          <li className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-blue-300 flex-shrink-0" />
            <span>Multiple files at once</span>
          </li>
          <li className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-blue-300 flex-shrink-0" />
            <span>Up to 50 MB each</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
