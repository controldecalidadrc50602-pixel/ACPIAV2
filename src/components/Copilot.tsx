import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Sparkles, X, MessageSquare } from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState(false); // Estado para minimizar/maximizar
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
    <>
      {/* BOTÓN FLOTANTE (Trigger) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-2xl hover:bg-indigo-500 transition-all z-50 animate-bounce-slow"
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>

      {/* VENTANA DEL CHAT (Condicional) */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[400px] h-[600px] flex flex-col bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
            <div className="flex items-center gap-2">
              <Bot className="text-indigo-400" />
              <h3 className="font-bold text-white">ACPIA Copilot</h3>
              <Sparkles size={14} className="text-amber-400 animate-pulse" />
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/30">
            {messages.length === 0 && (
                <div className="text-center text-slate-500 mt-10">
                    <p>¡Hola! Soy tu asistente de auditoría. ¿En qué puedo ayudarte hoy?</p>
                </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-100'} shadow-sm`}>
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={endOfMessagesRef} />
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex gap-2">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500"
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
      )}
    </>
  );
};
