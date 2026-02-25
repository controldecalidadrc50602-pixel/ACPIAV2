export type Language = 'en' | 'es';
export type Sentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'MIXED';

export enum UserRole {
  ADMIN = 'ADMIN',
  AUDITOR = 'AUDITOR',
  CLIENT = 'CLIENT'
}

export enum SubscriptionTier {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export enum AuditType {
  VOICE = 'VOICE',
  CHAT = 'CHAT'
}

export enum AuditStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  pin: string;
  email?: string;
  subscriptionTier?: SubscriptionTier;
  organizationId: string;    // Formato para React
  organization_id?: string;  // Formato para Supabase
}

export interface RubricItem {
  id: string;
  label: string;
  category: 'soft' | 'hard' | 'compliance';
  isActive: boolean;
  type: AuditType | 'BOTH';
}

export interface Audit {
  id: string;
  readableId: string;
  agentName: string;
  project: string;
  date: string;
  type: AuditType;
  status: AuditStatus;
  csat: number;
  qualityScore: number;
  customData?: Record<string, boolean>;
  sentiment?: Sentiment;
  aiNotes?: string;
}

export interface Project {
  id: string;
  name: string;
  targets?: { score: number; csat: number };
}

export interface Agent {
  id: string;
  name: string;
}
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};
