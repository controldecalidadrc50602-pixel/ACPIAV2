
import { User, UserRole, Audit, AuditStatus, Agent, Project, AppSettings, RubricItem, Theme, ProjectTargets, AuditType, UsageStats, ChatSession, SubscriptionTier } from '../types';
import { supabase } from './supabaseClient';

// Helper for pushing data
const cloudPush = async (table: string, data: any) => {
    const { error } = await supabase.from(table).upsert(data);
    if (error) console.error(`Failed to push to ${table}`, error);
}

const USERS_KEY = 'acpia_users';
const AUDITS_KEY = 'acpia_audits';
const AGENTS_KEY = 'acpia_agents';
const PROJECTS_KEY = 'acpia_projects';
const SETTINGS_KEY = 'acpia_settings';
const THEME_KEY = 'acpia_theme';
const RUBRIC_KEY = 'acpia_rubric';
const CHAT_SESSIONS_KEY = 'acpia_chat_sessions';

export const SYSTEM_DEFAULT_LABELS: Record<string, string> = {
    cordiality: "Protocolo y Saludo",
    pauses: "Control de Silencios",
    activeListening: "Escucha Activa",
    empathy: "Inteligencia Emocional",
    scriptUsage: "Alineación de Narrativa",
    solution: "Resolución de Problemas",
    compliance: "Cumplimiento Regulatorio",
    emotionHandling: "Capacidad de Desescalación",
    grammar: "Sintaxis y Semántica",
    accessEase: "Agilidad Operativa"
};

export const getAppSettings = (): AppSettings => {
    const data = localStorage.getItem(SETTINGS_KEY);
    const defaults: AppSettings = {
        companyName: 'Rc506 | Gestion de Calidad',
        subscriptionTier: SubscriptionTier.FREE,
        usage: { aiAuditsCount: 0, estimatedTokens: 0, estimatedCost: 0 }
    };
    if (!data) return defaults;
    return { ...defaults, ...JSON.parse(data) };
};

export const saveAppSettings = (settings: AppSettings): void => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const getUsageStats = (): UsageStats => {
    return getAppSettings().usage || { aiAuditsCount: 0, estimatedTokens: 0, estimatedCost: 0 };
};

export const getTheme = (): Theme => (localStorage.getItem(THEME_KEY) as Theme) || 'dark';
export const saveTheme = (theme: Theme): void => localStorage.setItem(THEME_KEY, theme);

// --- AUDITS ---
export const getAudits = (): Audit[] => {
    const data = localStorage.getItem(AUDITS_KEY);
    return data ? JSON.parse(data) : [];
};

export const saveAudit = (audit: Audit): void => {
    const audits = getAudits();
    const idx = audits.findIndex(a => a.id === audit.id);
    const settings = getAppSettings();
    const auditToSave = { ...audit, organization_id: settings.companyName }; // Org context

    if (idx >= 0) audits[idx] = auditToSave;
    else audits.push(auditToSave);

    localStorage.setItem(AUDITS_KEY, JSON.stringify(audits));
    localStorage.setItem(AUDITS_KEY, JSON.stringify(audits));
    cloudPush('audits', auditToSave);
};

export const deleteAudit = (id: string): void => {
    const audits = getAudits().filter(a => a.id !== id);
    localStorage.setItem(AUDITS_KEY, JSON.stringify(audits));
    localStorage.setItem(AUDITS_KEY, JSON.stringify(audits));
    supabase.from('audits').delete().eq('id', id).then(({ error }) => { if (error) console.error(error) });
};

// --- AGENTS ---
export const getAgents = (): Agent[] => JSON.parse(localStorage.getItem(AGENTS_KEY) || '[]');
export const saveAgent = (agent: Agent): void => {
    const agents = getAgents();
    const idx = agents.findIndex(a => a.id === agent.id);
    const settings = getAppSettings();
    if (idx >= 0) agents[idx] = agent;
    else agents.push(agent);
    localStorage.setItem(AGENTS_KEY, JSON.stringify(agents));
    localStorage.setItem(AGENTS_KEY, JSON.stringify(agents));
    cloudPush('agents', agent);
};

export const deleteAgent = (id: string): void => {
    const agents = getAgents().filter(a => a.id !== id);
    localStorage.setItem(AGENTS_KEY, JSON.stringify(agents));
    localStorage.setItem(AGENTS_KEY, JSON.stringify(agents));
    supabase.from('agents').delete().eq('id', id).then(({ error }) => { if (error) console.error(error) });
};

// --- PROJECTS ---
export const getProjects = (): Project[] => JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]');
export const saveProject = (id: string, name: string, targets?: { score: number, csat: number }, rubricIds?: string[]): void => {
    const projects = getProjects();
    const idx = projects.findIndex(p => p.id === id);
    const settings = getAppSettings();
    const project = { id, name, targets, rubricIds, organization_id: settings.companyName };
    if (idx >= 0) projects[idx] = project;
    else projects.push(project);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    cloudPush('projects', project);
};

export const deleteProject = (id: string): void => {
    const projects = getProjects().filter(p => p.id !== id);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    supabase.from('projects').delete().eq('id', id).then(({ error }) => { if (error) console.error(error) });
};

// --- RUBRIC ---
export const getRubric = (): RubricItem[] => {
    const data = localStorage.getItem(RUBRIC_KEY);
    if (data) return JSON.parse(data);
    const defaults: RubricItem[] = Object.keys(SYSTEM_DEFAULT_LABELS).map(key => ({
        id: key,
        label: SYSTEM_DEFAULT_LABELS[key],
        category: (key === 'grammar' || key === 'compliance') ? 'hard' : 'soft',
        isActive: true,
        type: 'BOTH'
    }));
    localStorage.setItem(RUBRIC_KEY, JSON.stringify(defaults));
    return defaults;
};

export const saveRubricItem = (item: RubricItem): void => {
    const rubric = getRubric();
    const idx = rubric.findIndex(r => r.id === item.id);
    if (idx >= 0) rubric[idx] = item;
    else rubric.push(item);
    localStorage.setItem(RUBRIC_KEY, JSON.stringify(rubric));
};

export const toggleRubricItem = (id: string): void => {
    const rubric = getRubric();
    const item = rubric.find(r => r.id === id);
    if (item) {
        item.isActive = !item.isActive;
        localStorage.setItem(RUBRIC_KEY, JSON.stringify(rubric));
    }
};

export const deleteRubricItem = (id: string): void => {
    const rubric = getRubric().filter(r => r.id !== id);
    localStorage.setItem(RUBRIC_KEY, JSON.stringify(rubric));
};

// --- USERS ---
export const getUsers = (): User[] => JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
export const saveUser = (user: User): void => {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) users[idx] = user;
    else users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const deleteUser = (id: string): void => {
    const users = getUsers().filter(u => u.id !== id);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const authenticate = (id: string, pin: string): User | null => getUsers().find(u => u.id === id && u.pin === pin) || null;
export const initAuth = () => { if (getUsers().length === 0) saveUser({ id: 'admin', name: 'Admin', role: UserRole.ADMIN, pin: '1234', organizationId: 'RC506' }); };

export const fullCloudPull = async (organizationId: string) => {
    try {
        console.log("Starting Cloud Pull for Org:", organizationId);

        // Pull Audits
        const { data: audits } = await supabase.from('audits').select('*').eq('organization_id', organizationId);
        if (audits) localStorage.setItem(AUDITS_KEY, JSON.stringify(audits));

        // Pull Agents
        const { data: agents } = await supabase.from('agents').select('*').eq('organization_id', organizationId);
        if (agents) localStorage.setItem(AGENTS_KEY, JSON.stringify(agents));

        // Pull Projects
        const { data: projects } = await supabase.from('projects').select('*').eq('organization_id', organizationId);
        if (projects) localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));

        console.log("Cloud Pull Complete");
    } catch (e) {
        console.error("Cloud Pull failed", e);
    }
};



export const downloadCSV = (audits: Audit[]): void => {
    const headers = ['Date', 'ID', 'Agent', 'Project', 'Status', 'CSAT', 'Score'];
    const rows = audits.map(a => [a.date, a.readableId || a.id, a.agentName, a.project, a.status, a.csat, (a.qualityScore || 0) + '%']);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `audits_${Date.now()}.csv`);
    link.click();
};

export const getChatSessions = (): ChatSession[] => JSON.parse(localStorage.getItem(CHAT_SESSIONS_KEY) || '[]');
export const saveChatSession = (session: ChatSession): void => {
    const sessions = getChatSessions();
    const idx = sessions.findIndex(s => s.id === session.id);
    if (idx >= 0) sessions[idx] = session;
    else sessions.unshift(session);
    localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
};
export const deleteChatSession = (id: string): void => {
    const sessions = getChatSessions().filter(s => s.id !== id);
    localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
};
export const createNewSession = (): ChatSession => ({ id: Date.now().toString(), title: 'Nueva Consulta', date: Date.now(), messages: [] });
export const updateUsageStats = (tokens: number) => {
    const settings = getAppSettings();
    const usage = settings.usage || { aiAuditsCount: 0, estimatedTokens: 0, estimatedCost: 0 };
    saveAppSettings({
        ...settings,
        usage: {
            aiAuditsCount: usage.aiAuditsCount + 1,
            estimatedTokens: usage.estimatedTokens + tokens,
            estimatedCost: usage.estimatedCost + (tokens * 0.00000015)
        }
    });
};

/**
 * Added exportData, importData, clearAllData, and getOrgId to resolve import errors.
 */
export const exportData = (): void => {
    const data: Record<string, string | null> = {};
    [USERS_KEY, AUDITS_KEY, AGENTS_KEY, PROJECTS_KEY, SETTINGS_KEY, THEME_KEY, RUBRIC_KEY, CHAT_SESSIONS_KEY].forEach(key => {
        data[key] = localStorage.getItem(key);
    });
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ACPIA_BACKUP_${Date.now()}.json`;
    a.click();
};

export const importData = (json: string): boolean => {
    try {
        const data = JSON.parse(json);
        Object.keys(data).forEach(key => {
            if (data[key]) localStorage.setItem(key, data[key]);
        });
        return true;
    } catch (e) {
        return false;
    }
};

export const clearAllData = (): void => {
    localStorage.clear();
};

export const getOrgId = (user: User | null): string => {
    return user?.organizationId || getAppSettings().companyName || 'RC506';
};

// --- SECURITY LOGS (ISO 9001) ---
export interface SecurityLog {
    id: string;
    date: string;
    userId: string;
    action: string;
    details: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

const SECURITY_LOGS_KEY = 'acpia_security_logs';

export const logSecurityEvent = (userId: string, action: string, details: string, severity: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO') => {
    const logs: SecurityLog[] = JSON.parse(localStorage.getItem(SECURITY_LOGS_KEY) || '[]');
    const newLog: SecurityLog = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        userId,
        action,
        details,
        severity
    };
    logs.push(newLog);
    localStorage.setItem(SECURITY_LOGS_KEY, JSON.stringify(logs));
    cloudPush('security_logs', newLog);
};

export const getSecurityLogs = (): SecurityLog[] => JSON.parse(localStorage.getItem(SECURITY_LOGS_KEY) || '[]');
