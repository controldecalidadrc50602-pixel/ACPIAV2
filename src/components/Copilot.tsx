import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Sparkles } from 'lucide-react';
import { Audit, Language } from '../types';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface CopilotProps {
  audits: Audit[];
  lang: Language;
}

export const Copilot: React.FC<CopilotProps> = ({ audits, lang }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            messages: [...messages, userMsg],
            context: { auditCount: audits?.length || 0, language: lang } 
        }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.substring(6));
              const content = data.choices[0].delta.content || '';
              assistantText += content;
              
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantText };
                return updated;
              });
            } catch (e) { continue; }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl">
      <div className="p-4 border-b border-slate-800 flex items-center gap-2">
        <Bot className="text-indigo-400" />
        <h3 className="font-bold text-slate-100">ACPIA Copilot</h3>
        <Sparkles size={14} className="text-amber-400 animate-pulse" />
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
            <div className="text-center text-slate-500 mt-10">
                <p>Hello! I am your audit assistant. How can I help you today?</p>
            </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${m.role === 'user' ? 'bg-indigo-600' : 'bg-slate-800'} text-slate-100`}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={endOfMessagesRef} />
      </div>

      <div className="p-4 border-t border-slate-800 flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about ISO standards..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white outline-none"
        />
        <button 
            onClick={handleSend} 
            disabled={isTyping} 
            className="p-2 bg-indigo-600 rounded-xl hover:bg-indigo-500 disabled:bg-slate-700 transition-colors"
        >
          <Send size={20} className="text-white" />
        </button>
      </div>
    </div>
  );
};
