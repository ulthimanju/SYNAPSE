import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Trash2, Bot, User, Sparkles } from 'lucide-react';
import { MarkdownRenderer } from '../../../components/common/MarkdownRenderer';

export const RagChatTab = ({ messages = [], onSendMessage, isSending, onClearHistory }) => {
  const [inputMessage, setInputMessage] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;
    onSendMessage(inputMessage.trim());
    setInputMessage('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col h-[calc(100vh-220px)] min-h-[500px] animate-fadeIn font-sans">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-5 rounded-t-3xl bg-white border border-slate-200/80 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#cff4fc] border border-cyan-100 flex items-center justify-center text-[#0891b2] shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight">RAG Neural Assistant</h3>
            <p className="text-xs text-slate-400">Contextual Q&A grounded strictly in workspace documents</p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={onClearHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Messages Scroll Viewport */}
      <div className="flex-1 p-6 overflow-y-auto bg-[#f4f5fa] border-x border-slate-200/80 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 p-8">
            <div className="w-14 h-14 rounded-3xl bg-white border border-slate-200/80 flex items-center justify-center text-[#0891b2] shadow-sm">
              <Sparkles className="w-7 h-7" />
            </div>
            <p className="text-slate-800 font-bold text-base">Ask Anything About Your Documents</p>
            <p className="text-slate-400 text-xs max-w-md leading-relaxed">
              Query definitions, algorithm walkthroughs, formulas, or system architectures. Answers are dynamically retrieved from your uploaded files.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isUser = msg.role === 'user' || msg.sender === 'user';
            return (
              <div
                key={idx}
                className={`flex items-start gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm ${
                    isUser
                      ? 'bg-[#1c3d98] text-white'
                      : 'bg-[#cff4fc] text-[#0891b2] border border-cyan-100'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-[#1c3d98] text-white rounded-tr-none font-medium'
                      : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none font-sans'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.message || msg.content}</p>
                  ) : (
                    <MarkdownRenderer content={msg.message || msg.content} />
                  )}
                </div>
              </div>
            );
          })
        )}

        {isSending && (
          <div className="flex items-center gap-3 mr-auto max-w-md">
            <div className="w-8 h-8 rounded-xl bg-[#cff4fc] border border-cyan-100 flex items-center justify-center text-[#0891b2] flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-white border border-slate-200/80 text-slate-400 text-xs flex items-center gap-2 shadow-sm">
              <Sparkles className="w-4 h-4 animate-spin text-[#0891b2]" />
              <span>Retrieving vector embeddings...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Action Bar */}
      <form
        onSubmit={handleSubmit}
        className="p-4 rounded-b-3xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3 flex-shrink-0"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask a question about your workspace documents..."
          disabled={isSending}
          className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-[#1c3d98] transition"
        />

        <button
          type="submit"
          disabled={!inputMessage.trim() || isSending}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#1c3d98] hover:bg-blue-800 text-white font-semibold text-xs shadow-md transition active:scale-98 cursor-pointer disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
