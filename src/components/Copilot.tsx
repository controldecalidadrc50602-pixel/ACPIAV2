import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Send, Bot, User } from 'lucide-react';

export const Copilot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) throw new Error('Error en API');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        // Lógica simple para extraer el contenido del stream de OpenAI/Groq
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            const data = JSON.parse(line.substring(6));
            const content = data.choices[0].delta.content || '';
            assistantText += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              return [...prev.slice(0, -1), { ...last, content: assistantText }];
            });
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center gap-3">
        <Bot className="text-indigo-500" />
        <span className="font-semibold">ACPIA Copilot (Groq Powered)</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl ${m.role === 'user' ? 'bg-indigo-600' : 'bg-slate-800'}`}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex gap-2">
        <input 
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="Escribe tu consulta de auditoría..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button 
          onClick={handleSend}
          disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 p-2 rounded-xl transition-all"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};
