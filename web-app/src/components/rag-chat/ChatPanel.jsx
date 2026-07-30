import React, { useState, useEffect } from 'react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { ClearChatDialog } from './ClearChatDialog';
import { Button } from '../common/Button';
import { api } from '../../services/api';
import { MessageSquare, Trash2, Sparkles, ShieldCheck } from 'lucide-react';

export const ChatPanel = ({ workspaceId }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/workspaces/${workspaceId}/chat/history`);
      if (res?.data) {
        setMessages(res.data);
      }
    } catch (err) {
      console.log('No chat history found yet');
    }
  };

  useEffect(() => {
    if (workspaceId) {
      fetchHistory();
    }
  }, [workspaceId]);

  const handleSendMessage = async (queryText) => {
    const userMsg = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content: queryText,
      sources: [],
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.post(`/workspaces/${workspaceId}/chat`, { query: queryText });
      const payload = res?.data || res;
      if (payload && payload.answer) {
        const assistantMsg = {
          id: payload.message_id || `asst-${Date.now()}`,
          role: 'assistant',
          content: payload.answer,
          sources: payload.sources || [],
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      console.error('RAG chat error:', err);
      const errorMsg = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `**RAG Search Notice**: Could not complete query vector retrieval. Please ensure documents have finished parsing and try again.`,
        sources: [],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmClear = async () => {
    setClearing(true);
    try {
      await api.delete(`/workspaces/${workspaceId}/chat/history`);
    } catch (err) {
      console.log('Chat history cleared locally');
    } finally {
      setMessages([]);
      setClearing(false);
      setClearDialogOpen(false);
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 150px)' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            RAG VECTOR CHAT ENGINE
          </span>
        </div>

        {messages.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => setClearDialogOpen(true)}>
            <Trash2 size={14} style={{ color: '#EF4444' }} />
            <span>Clear Chat</span>
          </Button>
        )}
      </div>

      {/* Message Stream area */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
        <MessageList messages={messages} onSelectPrompt={handleSendMessage} />
      </div>

      {/* Floating Chat Input bar */}
      <ChatInput onSendMessage={handleSendMessage} loading={loading} />

      <ClearChatDialog
        isOpen={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        onConfirm={handleConfirmClear}
        loading={clearing}
      />
    </div>
  );
};
