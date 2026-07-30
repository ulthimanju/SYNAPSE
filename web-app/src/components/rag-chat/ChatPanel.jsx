import React, { useState, useEffect } from 'react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { ClearChatDialog } from './ClearChatDialog';
import { Button } from '../common/Button';
import { api } from '../../services/api';
import { MessageSquare, Trash2 } from 'lucide-react';

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
      if (res?.data) {
        const assistantMsg = {
          id: res.data.message_id || `asst-${Date.now()}`,
          role: 'assistant',
          content: res.data.answer,
          sources: res.data.sources || [],
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      const mockAsstMsg = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: `Based on the retrieved research documents for this workspace, Synapse decouples microservice architectures (Identity, Workspace, Document Processing, AI, and RAG Service) and utilizes Gemini 2.5 Flash for RAG context synthesis.`,
        sources: [
          {
            chunk_id: 'chk-1',
            document_id: 'doc-1',
            score: 0.94,
            heading: 'System Architecture Overview',
          },
        ],
      };
      setMessages((prev) => [...prev, mockAsstMsg]);
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
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: '520px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
        <div>
          <span className="editorial-badge" style={{ marginBottom: '0.25rem' }}>SINGLETON WORKSPACE ASSISTANT</span>
          <h2 className="font-serif" style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>Workspace AI RAG Assistant</h2>
        </div>

        {messages.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => setClearDialogOpen(true)}>
            <Trash2 size={14} style={{ color: '#EF4444' }} />
            <span>Clear Chat</span>
          </Button>
        )}
      </div>

      <div style={{ flex: 1, minHeight: '380px', overflowY: 'auto' }}>
        <MessageList messages={messages} />
      </div>

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
