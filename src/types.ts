export enum AuditType {
  VOICE = 'VOICE',
  CHAT = 'CHAT'
}

export enum AuditStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SECURITY_BLOCKED = 'SECURITY_BLOCKED'
}

export enum SubscriptionTier {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export type Sentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'MIXED';

export enum Perception {
  OPTIMAL = 'Optimal',
  ACCEPTABLE = 'Acceptable',
  POOR = 'Poor'
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

// Interfaces extendidas para evitar errores en AuditForm
export interface VoiceAudit extends Audit {
  duration: number;
}

export interface ChatAudit extends Audit {
  chatTime: string;
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

export interface CoachingPlan {
  id: string;
  date: string;
  topic: string;
  tasks: string[];
  status: 'pending' | 'completed';
}

export type Language = 'en' | 'es';
export type AgentTrend = 'UP' | 'DOWN' | 'STABLE';

export interface User {
  id: string;
  name: string;
  role: string;
  organizationId: string;
}
