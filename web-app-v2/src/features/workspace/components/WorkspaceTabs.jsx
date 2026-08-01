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
    <div className="w-full bg-white border-b border-slate-200/80 px-10">
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-4 font-semibold text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                    isActive ? 'bg-[#cff4fc] text-[#0891b2]' : 'bg-slate-100 text-slate-500'
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
