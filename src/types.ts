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

export enum SecurityLevel {
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  RED = 'RED'
}

export enum Perception {
  OPTIMAL = 'Optimal',
  ACCEPTABLE = 'Acceptable',
  POOR = 'Poor'
}

export interface SecurityReport {
  isBlocked: boolean;
  reason?: string;
  flags: string[];
  details: string;
  sanitizedContent: string;
}

export interface Participant {
  name: string;
  role: 'AGENT' | 'CUSTOMER' | 'SUPERVISOR' | 'INTERNAL_STAFF' | 'UNKNOWN';
  sentiment: string;
  tone: string;
}

export interface SmartAnalysisResult {
  score: number;
  csat: number;
  notes: string;
  customData: Record<string, boolean>;
  sentiment: string;
  interactionType?: 'INTERNAL' | 'EXTERNAL';
  participants: Participant[];
  durationAnalysis?: string;
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
  isAiGenerated?: boolean;
}

export interface VoiceAudit extends Audit {
  duration: number;
}

export interface ChatAudit extends Audit {
  chatTime: string;
  initialResponseTime: string;
  resolutionTime: string;
  responseUnder5Min: boolean;
}

export interface Agent {
  id: string;
  name: string;
  organizationId?: string;
}

export interface Project {
  id: string;
  name: string;
  targets?: { score: number; csat: number };
  rubricIds?: string[];
  organization_id?: string;
}

export interface CoachingPlan {
  id: string;
  date: string;
  topic: string;
  tasks: string[];
  status: 'pending' | 'completed';
}

export interface ChatSession {
  id: string;
  title: string;
  date: number | string;
  messages: Message[];
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface RubricItem {
  id: string;
  label: string;
  category: 'soft' | 'hard' | 'compliance';
  isActive: boolean;
  type: AuditType | 'BOTH';
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  pin: string;
  organizationId: string;
  organization_id?: string;
  email?: string;
  subscriptionTier?: SubscriptionTier;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}
