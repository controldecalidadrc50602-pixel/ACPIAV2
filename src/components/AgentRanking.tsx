import React from 'react';
import { Trophy, Sparkles, Star } from 'lucide-react';

export const AgentRanking = ({ agents }: { agents: any[] }) => {
  return (
    <div className="p-8 bg-slate-900/50 rounded-[2.5rem] border border-slate-800 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Ranking de Agentes</h2>
          <p className="text-slate-400 text-sm">Organización: <span className="text-indigo-400 font-bold">acpia-pilot</span></p>
        </div>
        <Trophy className="text-amber-400 w-10 h-10" />
      </div>

      <div className="grid gap-4">
        {agents.map((agent, index) => (
          <div key={agent.id} className="flex items-center justify-between p-5 bg-slate-950/50 rounded-2xl border border-slate-800 group hover:border-indigo-500/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg">
                {index + 1}
              </div>
              <div>
                <p className="font-bold text-white text-lg">{agent.name}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-black">
                  <Star className="w-3 h-3 text-amber-500" /> Top Performer
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-indigo-400 italic">94%</p>
              <div className="flex items-center gap-1 text-emerald-500">
                 <Sparkles className="w-3 h-3" />
                 <span className="text-[9px] font-bold uppercase tracking-widest">IA Verificado</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
