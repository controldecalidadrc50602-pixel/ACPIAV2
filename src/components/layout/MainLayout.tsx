import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { 
    LogOut, Shield, Sparkles, BarChart, PlusSquare, 
    FileText, Settings as SettingsIcon, Database, 
    ChevronLeft, ChevronRight, RefreshCw, CreditCard, 
    ShieldCheck, Zap 
} from 'lucide-react';
import { UserRole, SubscriptionTier } from '../../types';

export const MainLayout: React.FC = () => {
    const { currentUser, logout } = useAuth();
    const { appLogo, companyName, refreshData, lang } = useApp();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const location = useLocation();

    const t = translations[lang] || translations['es'];

    if (!currentUser) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-all duration-300 overflow-hidden">
            
            <aside className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-xl z-20 transition-all duration-300 ${isSidebarCollapsed ? 'w-24' : 'w-full md:w-72'} h-screen`}>
                <div className={`p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col items-center ${isSidebarCollapsed ? 'px-2' : 'px-8'}`}>
                    <div className={`transition-all duration-500 bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-100 dark:border-slate-700 shadow-xl overflow-hidden flex items-center justify-center ${isSidebarCollapsed ? 'w-14 h-14' : 'w-24 h-24 mb-4'}`}>
                        {appLogo ? <img src={appLogo} alt="Logo" className="w-full h-full object-cover" /> : <ShieldCheck className="w-10 h-10 text-indigo-500" />}
                    </div>
                    {!isSidebarCollapsed && (
                        <div className="text-center">
                            <h1 className="font-black text-xl tracking-tighter truncate max-w-[200px] leading-tight text-slate-900 dark:text-white uppercase">{companyName}</h1>
                            <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-[0.3em] mt-2">SaaS Enterprise</p>
                        </div>
                    )}
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                    {/* SECCIÓN OPERATIVA */}
                    <p className={`text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-4 ${isSidebarCollapsed ? 'hidden' : 'block'}`}>Operaciones</p>
                    
                    <NavItem to="/app" collapsed={isSidebarCollapsed} icon={<BarChart className="w-5 h-5 text-blue-500" />} label={t.dashboard} active={location.pathname === '/app'} />
                    <NavItem to="/app/crm" collapsed={isSidebarCollapsed} icon={<Database className="w-5 h-5 text-amber-500" />} label={t.crm} active={location.pathname.startsWith('/app/crm')} />

                    {/* Acceso para RC506 y Auditores/Admins */}
                    {(currentUser.role !== UserRole.CLIENT || currentUser.subscriptionTier === SubscriptionTier.ENTERPRISE) && (
                        <>
                            <NavItem to="/app/audit/new" collapsed={isSidebarCollapsed} icon={<PlusSquare className="w-5 h-5 text-emerald-500" />} label={t.newAudit} active={location.pathname === '/app/audit/new'} />
                            <NavItem to="/app/smart-audit" collapsed={isSidebarCollapsed} icon={<Sparkles className="w-5 h-5 text-purple-500" />} label={t.smartAudit} active={location.pathname === '/app/smart-audit'} />
                        </>
                    )}

                    <NavItem to="/app/reports" collapsed={isSidebarCollapsed} icon={<FileText className="w-5 h-5 text-rose-500" />} label={t.reports} active={location.pathname === '/app/reports'} />

                    {/* SECCIÓN ADMINISTRATIVA (RESTAURADA) */}
                    {currentUser.role === UserRole.ADMIN && (
                        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                            <p className={`text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-4 ${isSidebarCollapsed ? 'hidden' : 'block'}`}>Administración</p>
                            <NavItem to="/app/management" collapsed={isSidebarCollapsed} icon={<Shield className="w-5 h-5 text-indigo-500" />} label={t.management} active={location.pathname === '/app/management'} />
                            <NavItem to="/app/settings" collapsed={isSidebarCollapsed} icon={<SettingsIcon className="w-5 h-5 text-slate-500" />} label={t.settings} active={location.pathname === '/app/settings'} />
                            <NavItem to="/app/subscription" collapsed={isSidebarCollapsed} icon={<CreditCard className="w-5 h-5 text-cyan-500" />} label="Suscripción" active={location.pathname === '/app/subscription'} />
                        </div>
                    )}
                </nav>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    {!isSidebarCollapsed && (
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                            <div className="w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-white text-sm font-black flex-shrink-0 bg-indigo-600">
                                {currentUser.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-bold truncate text-slate-900 dark:text-white">{currentUser.name}</p>
                                <p className="text-[9px] text-indigo-500 font-black uppercase tracking-widest">{currentUser.subscriptionTier}</p>
                            </div>
                        </div>
                    )}
                    <div className="flex gap-2">
                        <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="flex-1 flex items-center justify-center p-3 rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-600 transition-all border border-slate-200 dark:border-slate-700 shadow-sm">
                            {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                        </button>
                        {!isSidebarCollapsed && (
                            <button onClick={logout} className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-100 transition-all text-[10px] font-black uppercase tracking-widest border border-red-500/10">
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
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">{location.pathname.replace('/app', '').replace('/', '').toUpperCase() || 'DASHBOARD'}</span>
                    </div>
                    <button onClick={refreshData} className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 shadow-inner">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-10 custom-scrollbar scroll-smooth">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

// COMPONENTE NAVITEM DEFINIDO AQUÍ PARA EVITAR ERRORES DE TS
const NavItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean, to: string, collapsed?: boolean }> = ({ icon, label, active, to, collapsed }) => (
    <Link to={to} className={`w-full flex items-center gap-4 transition-all ${collapsed ? 'justify-center p-4 rounded-2xl' : 'px-6 py-4 rounded-2xl'} text-[11px] font-black uppercase tracking-widest ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
        {icon} {!collapsed && <span className="truncate">{label}</span>}
    </Link>
);
