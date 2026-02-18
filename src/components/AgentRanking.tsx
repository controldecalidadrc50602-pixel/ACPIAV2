import React from 'react';
import { Trophy, Star, TrendingUp, Award } from 'lucide-react';

export const AgentRanking = ({ agents }: { agents: any[] }) => {
    return (
        <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Ranking Global</h2>
                    <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-2">Agentes Destacados</p>
                </div>
                <Trophy className="w-12 h-12 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]" />
            </div>

            <div className="grid gap-4">
                {agents.slice(0, 5).map((agent, index) => (
                    <div key={agent.id} className="group flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-850 hover:bg-indigo-600 rounded-3xl transition-all duration-300 cursor-pointer border border-slate-100 dark:border-slate-800 hover:border-indigo-400">
                        <div className="flex items-center gap-5">
                            <span className="text-2xl font-black text-slate-300 group-hover:text-white/50 w-6 italic">#{index + 1}</span>
                            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-600 font-black shadow-md group-hover:scale-110 transition-transform">
                                {agent.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-black text-slate-900 dark:text-white group-hover:text-white uppercase tracking-tight">{agent.name}</p>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 group-hover:text-white/70 font-bold uppercase">
                                    <Star className="w-3 h-3 text-amber-500" /> Score: 98%
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {index === 0 && <Award className="w-6 h-6 text-amber-400" />}
                            <TrendingUp className="w-4 h-4 text-emerald-500 group-hover:text-white" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
