import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    LayoutDashboard, Bot, Sparkles, Database, 
    Settings, LogOut, ChevronLeft, ChevronRight,
    Bell, Search, UserCircle
} from 'lucide-react';

export const MainLayout: React.FC = () => {
    const { currentUser, logout } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 p-4 gap-4 overflow-hidden font-sans">
            {/* Sidebar con estilo "Ejemplo" */}
            <aside className={`bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-all duration-500 flex flex-col ${isCollapsed ? 'w-24' : 'w-72'}`}>
                <div className="p-8 flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                        <Sparkles className="text-white w-6 h-6" />
                    </div>
                    {!isCollapsed && <span className="font-black uppercase tracking-tighter text-xl dark:text-white">ACPIA</span>}
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <NavItem to="/app" icon={<LayoutDashboard />} label="Panel Control" active={location.pathname === '/app'} collapsed={isCollapsed} />
                    <NavItem to="/app/smart-audit" icon={<Bot />} label="IA Auditor" active={location.pathname === '/app/smart-audit'} collapsed={isCollapsed} />
                    <NavItem to="/app/crm" icon={<Database />} label="Agentes" active={location.pathname === '/app/crm'} collapsed={isCollapsed} />
                    <NavItem to="/app/settings" icon={<Settings />} label="Configuración" active={location.pathname === '/app/settings'} collapsed={isCollapsed} />
                </nav>

                <div className="p-6 mt-auto">
                    <button onClick={logout} className="w-full flex items-center gap-4 p-4 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-950/20 rounded-2xl transition-all">
                        <LogOut className="w-5 h-5" /> {!isCollapsed && "Cerrar Sesión"}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col gap-4 overflow-hidden">
                {/* Header Superior */}
                <header className="h-20 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 px-8 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Buscar auditorías..." className="bg-transparent outline-none text-xs font-bold uppercase tracking-widest w-48" />
                    </div>
                    <div className="flex items-center gap-6">
                        <Bell className="w-5 h-5 text-slate-400 cursor-pointer" />
                        <div className="flex items-center gap-3 pl-6 border-l dark:border-slate-800">
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase dark:text-white">{currentUser?.name}</p>
                                <p className="text-[8px] font-bold text-indigo-500 uppercase tracking-widest">{currentUser?.role}</p>
                            </div>
                            <UserCircle className="w-10 h-10 text-slate-300" />
                        </div>
                    </div>
                </header>

                {/* Content View */}
                <div className="flex-1 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-10 overflow-y-auto custom-scrollbar shadow-inner">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

const NavItem = ({ to, icon, label, active, collapsed }: any) => (
    <Link to={to} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600'}`}>
        {React.cloneElement(icon, { className: "w-5 h-5" })}
        {!collapsed && <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>}
    </Link>
);
