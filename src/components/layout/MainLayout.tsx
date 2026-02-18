<nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
    {/* SECCIÓN OPERATIVA */}
    <div className="mb-4">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-4">Operaciones</p>
        <NavItem to="/app" collapsed={isSidebarCollapsed} icon={<BarChart className="w-5 h-5 text-blue-500" />} label="Dashboard" active={location.pathname === '/app'} />
        <NavItem to="/app/crm" collapsed={isSidebarCollapsed} icon={<Database className="w-5 h-5 text-amber-500" />} label="Agentes" active={location.pathname.startsWith('/app/crm')} />
        
        {/* Bypass para RC506 y Admins en Auditoría */}
        {(currentUser.role === UserRole.ADMIN || currentUser.subscriptionTier === 'ENTERPRISE') && (
            <>
                <NavItem to="/app/audit/new" collapsed={isSidebarCollapsed} icon={<PlusSquare className="w-5 h-5 text-emerald-500" />} label="Nueva Auditoría" active={location.pathname === '/app/audit/new'} />
                <NavItem to="/app/smart-audit" collapsed={isSidebarCollapsed} icon={<Sparkles className="w-5 h-5 text-purple-500" />} label="IA Smart Audit" active={location.pathname === '/app/smart-audit'} />
            </>
        )}
        <NavItem to="/app/reports" collapsed={isSidebarCollapsed} icon={<FileText className="w-5 h-5 text-rose-500" />} label="Reportes" active={location.pathname === '/app/reports'} />
    </div>

    {/* SECCIÓN DE CONTROL (RESTAURADA) */}
    {currentUser.role === UserRole.ADMIN && (
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-4">Administración</p>
            <NavItem to="/app/management" collapsed={isSidebarCollapsed} icon={<Shield className="w-5 h-5 text-indigo-500" />} label="Usuarios" active={location.pathname === '/app/management'} />
            <NavItem to="/app/settings" collapsed={isSidebarCollapsed} icon={<SettingsIcon className="w-5 h-5 text-slate-500" />} label="Configuración" active={location.pathname === '/app/settings'} />
            <NavItem to="/app/subscription" collapsed={isSidebarCollapsed} icon={<CreditCard className="w-5 h-5 text-cyan-500" />} label="Suscripción" active={location.pathname === '/app/subscription'} />
        </div>
    )}
</nav>
