import React from 'react';
import { FileText, Sparkles, BookOpen, MessageSquare, Users } from 'lucide-react';

export const WorkspaceTabs = ({ activeTab, onTabChange, documentCount = 0 }) => {
  const tabs = [
    { id: 'documents', label: 'Documents & Ingestion', icon: FileText, badge: documentCount },
    { id: 'summary', label: 'AI Summary', icon: Sparkles },
    { id: 'learning-path', label: 'Learning Path', icon: BookOpen },
    { id: 'chat', label: 'RAG Assistant', icon: MessageSquare },
    { id: 'collaborators', label: 'Collaborators', icon: Users },
  ];

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 px-8">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-5 py-4 font-medium text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-blueprint-500 text-blueprint-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blueprint-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                    isActive ? 'bg-blueprint-500/20 text-blueprint-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
