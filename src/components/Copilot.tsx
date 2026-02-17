import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Sparkles } from 'lucide-react';
// Importa tus tipos globales si los tienes, si no, usa los de abajo
import { Audit, Language } from '../types'; 

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// DEFINIMOS LAS PROPS AQUÍ
interface CopilotProps {
  audits: Audit[];
  lang: Language;
}

// APLICAMOS LAS PROPS AL COMPONENTE
export const Copilot: React.FC<CopilotProps> = ({ audits, lang }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  // ... resto del código que ya corregimos

export const Copilot: React.FC = () => {
  // Tipamos el estado como un arreglo de objetos Message
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Tipamos el Ref específicamente como un HTMLDivElement
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
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      // Agregamos el mensaje vacío del asistente que iremos llenando
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
                const lastIndex = updated.length - 1;
                updated[lastIndex] = { ...updated[lastIndex], content: assistantText };
                return updated;
              });
            } catch (e) {
              console.error("Error parseando stream", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error en el chat:", error);
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
          placeholder="Consulta sobre normativas ISO..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white outline-none"
        />
        <button onClick={handleSend} disabled={isTyping} className="bg-indigo-600 p-2 rounded-xl">
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};
