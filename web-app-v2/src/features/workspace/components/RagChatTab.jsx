import React, { useState } from 'react';
import { Send, MessageSquare, Trash2, Bot, User, Sparkles } from 'lucide-react';
import { MarkdownRenderer } from '../../../components/common/MarkdownRenderer';

export const RagChatTab = ({ messages = [], onSendMessage, isSending, onClearHistory }) => {
  const [inputMessage, setInputMessage] = useState('');

  const suggestions = [
    'What is memory allocation?',
    'What is kernel?',
    'What is operating system?',
  ];

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() || isSending) return;
    const msg = inputMessage;
    setInputMessage('');
    await onSendMessage(msg);
  };

  return (
    <div className="w-full max-w-5xl mx-auto h-[calc(100vh-280px)] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blueprint-500/20 border border-blueprint-500/30 flex items-center justify-center text-blueprint-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">RAG Conversational Assistant</h3>
            <p className="text-[11px] text-slate-400">Grounded in workspace vector embeddings (pgvector)</p>
          </div>
        </div>

        <button
          onClick={onClearHistory}
          className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
          title="Clear Chat History"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 my-auto py-12">
            <div className="w-12 h-12 rounded-2xl bg-blueprint-600/20 border border-blueprint-500/30 flex items-center justify-center text-blueprint-400">
              <Bot className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-base text-white">Ask your Workspace Assistant</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Ask any question about your uploaded documents. Gemini RAG engine retrieves exact vector chunks and formulas.
              </p>
            </div>

            {/* Suggestions */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputMessage(s);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition cursor-pointer"
                >
                  "{s}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isUser = msg.role === 'user' || msg.sender === 'user';
            return (
              <div
                key={idx}
                className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    isUser
                      ? 'bg-blueprint-600 text-white'
                      : 'bg-slate-800 border border-slate-700 text-blueprint-400'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-2xl p-5 rounded-2xl ${
                    isUser
                      ? 'bg-blueprint-700 text-white rounded-tr-none font-sans text-sm'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {isUser ? (
                    <p className="leading-relaxed">{msg.content || msg.message}</p>
                  ) : (
                    <MarkdownRenderer content={msg.content || msg.response || msg.message} />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-950/80">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask a question about your workspace documents..."
            className="w-full pl-5 pr-14 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-blueprint-500 placeholder:text-slate-500 font-sans"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || isSending}
            className="absolute right-2 p-2.5 rounded-xl bg-blueprint-600 hover:bg-blueprint-500 disabled:opacity-40 text-white transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
