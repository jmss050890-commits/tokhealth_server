import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { getAuthHeaders } from '@/utils/auth';

const AskCoachButton = ({ context = '', pageTitle = '' }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const askCoach = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setResponse('');
    try {
      const prompt = context
        ? `[Context: User is on the ${pageTitle} page. ${context}] ${message}`
        : message;

      const res = await fetch(`${BACKEND_URL}/api/health-coach/chat`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          message: prompt,
          session_id: `coach_${pageTitle.toLowerCase().replace(/\s/g, '_')}`
        })
      });

      const data = await res.json();
      if (data.success) {
        setResponse(data.data.response);
      } else {
        setResponse('Sorry, I could not process that right now. Try again later.');
      }
    } catch {
      setResponse('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-500/30 flex items-center justify-center transition-all hover:scale-110"
        data-testid="ask-coach-fab"
      >
        <MessageCircle className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-16 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-sky-200 overflow-hidden" data-testid="ask-coach-panel">
      {/* Header */}
      <div className="bg-sky-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-4 h-4" />
          <span className="font-medium text-sm">Ask Your Health Coach</span>
        </div>
        <button onClick={() => { setOpen(false); setResponse(''); setMessage(''); }} className="hover:bg-sky-500 p-1 rounded" data-testid="close-coach-panel">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3 max-h-64 overflow-y-auto">
        {response && (
          <div className="bg-sky-50 rounded-lg p-3">
            <p className="text-slate-700 text-sm whitespace-pre-wrap">{response}</p>
          </div>
        )}

        {!response && !loading && (
          <p className="text-slate-400 text-xs text-center py-2">
            Ask me anything about your health, this page, or your wellness goals
          </p>
        )}

        {loading && (
          <div className="flex items-center justify-center py-3">
            <Loader2 className="w-5 h-5 animate-spin text-sky-600" />
            <span className="ml-2 text-sky-600 text-sm">Thinking...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 p-3 flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && askCoach()}
          placeholder="Type your question..."
          className="flex-1 text-sm p-2 rounded-lg border border-slate-200 focus:border-sky-400 focus:outline-none"
          data-testid="coach-input"
        />
        <Button
          onClick={askCoach}
          disabled={loading || !message.trim()}
          size="sm"
          className="bg-sky-600 hover:bg-sky-700 text-white px-3"
          data-testid="coach-send-btn"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default AskCoachButton;
