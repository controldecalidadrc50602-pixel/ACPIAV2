import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { LogOut, Shield, Sparkles, BarChart, PlusSquare, FileText, Settings as SettingsIcon, Database, ChevronLeft, ChevronRight, RefreshCw, CreditCard, ShieldCheck, Zap } from 'lucide-react';
import { UserRole, SubscriptionTier } from '../../types';

export const MainLayout: React.FC = () => {
    const { currentUser, logout } = useAuth();
    const { appLogo, companyName, refreshData, lang } = useApp();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const location = useLocation();
    const t = translations[lang] || translations['es'];

    if (!currentUser) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row overflow-hidden">
            <aside className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-xl z-20 transition-all duration-300 ${isSidebarCollapsed ? 'w-24' : 'w-full md:w-72'} h-screen`}>
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col items-center px-8">
                    <div className={`transition-all duration-500 bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-100 dark:border-slate-700 shadow-xl flex items-center justify-center ${isSidebarCollapsed ? 'w-14 h-14' : 'w-24 h-24 mb-4'}`}>
                        {appLogo ? <img src={appLogo} alt="Logo" className="w-full h-full object-cover" /> : <ShieldCheck className="w-10 h-10 text-indigo-500" />}
                    </div>
                    {!isSidebarCollapsed && (
                        <div className="text-center">
                            <h1 className="font-black text-xl tracking-tighter uppercase text-slate-900 dark:text-white">{companyName}</h1>
                            <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-[0.3em] mt-2 italic">VIP RC506 ACCESS</p>
                        </div>
                    )}
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <NavItem to="/app" collapsed={isSidebarCollapsed} icon={<BarChart className="w-5 h-5 text-blue-500" />} label="Dashboard" active={location.pathname === '/app'} />
                    <NavItem to="/app/crm" collapsed={isSidebarCollapsed} icon={<Database className="w-5 h-5 text-amber-500" />} label="Agentes" active={location.pathname.startsWith('/app/crm')} />

                    {/* Módulos de Poder: Desbloqueados para RC506 y Admins */}
                    {(currentUser.subscriptionTier !== SubscriptionTier.FREE || currentUser.role === UserRole.ADMIN) && (
                        <>
                            <NavItem to="/app/audit/new" collapsed={isSidebarCollapsed} icon={<PlusSquare className="w-5 h-5 text-emerald-500" />} label="Nueva Auditoría" active={location.pathname === '/app/audit/new'} />
                            <NavItem to="/app/smart-audit" collapsed={isSidebarCollapsed} icon={<Sparkles className="w-5 h-5 text-purple-500" />} label="IA Smart Audit" active={location.pathname === '/app/smart-audit'} />
                        </>
                    )}

                    <NavItem to="/app/reports" collapsed={isSidebarCollapsed} icon={<FileText className="w-5 h-5 text-rose-500" />} label="Reportes" active={location.pathname === '/app/reports'} />
                    <div className="my-2 border-t border-slate-100 dark:border-slate-800" />
                    <NavItem to="/app/subscription" collapsed={isSidebarCollapsed} icon={<CreditCard className="w-5 h-5" />} label="Planes IA" active={location.pathname === '/app/subscription'} />

                    {currentUser.role === UserRole.ADMIN && (
                        <NavItem to="/app/management" collapsed={isSidebarCollapsed} icon={<Shield className="w-5 h-5 text-indigo-500" />} label="Admin Console" active={location.pathname === '/app/management'} />
                    )}
                </nav>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    {!isSidebarCollapsed && (
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black bg-indigo-600">
                                {currentUser.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-bold truncate text-slate-900 dark:text-white">{currentUser.name}</p>
                                <p className="text-[9px] text-indigo-500 font-black uppercase tracking-widest">{currentUser.subscriptionTier}</p>
                            </div>
                        </div>
                    )}
                    <div className="flex gap-2">
                        <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="flex-1 flex items-center justify-center p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                            {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                        </button>
                        {!isSidebarCollapsed && (
                            <button onClick={logout} className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-500/10">
                                <LogOut className="w-4 h-4" /> Salir
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 relative">
                <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between z-10">
                    <div className="flex items-center gap-4">
                        <Zap className="w-5 h-5 text-indigo-600" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{location.pathname.replace('/app/', '').toUpperCase() || 'DASHBOARD'}</span>
                    </div>
                    <button onClick={refreshData} className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700"><RefreshCw className="w-4 h-4" /></button>
                </header>

                <main className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    <div className="max-w-7xl mx-auto"><Outlet /></div>
                </main>
            </div>
        </div>
    );
};

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean, to: string, collapsed?: boolean }> = ({ icon, label, active, to, collapsed }) => (
    <Link to={to} className={`w-full flex items-center gap-4 transition-all ${collapsed ? 'justify-center p-4 rounded-2xl' : 'px-6 py-4 rounded-2xl'} text-[11px] font-black uppercase tracking-widest ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
        {icon} {!collapsed && <span className="truncate">{label}</span>}
    </Link>
);
