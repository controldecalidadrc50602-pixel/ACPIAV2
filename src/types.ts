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

export enum SecurityLevel {
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  RED = 'RED'
}

export enum SubscriptionTier {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export interface SecurityReport {
  isBlocked: boolean;
  reason?: string;
  flags: string[];
  details: string;
  sanitizedContent: string;
}

export type Sentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'MIXED';

export interface Participant {
  name: string;
  role: 'AGENT' | 'CUSTOMER' | 'SUPERVISOR' | 'INTERNAL_STAFF' | 'UNKNOWN';
  sentiment: Sentiment;
  tone: string;
}

export interface SmartAnalysisResult {
  score: number;
  csat: number;
  notes: string;
  customData: Record<string, boolean>;
  sentiment: Sentiment;
  interactionType: 'INTERNAL' | 'EXTERNAL';
  participants: Participant[];
  durationAnalysis?: string;
  detectedDurationSeconds?: number;
}

export interface RubricItem {
  id: string;
  label: string;
  category: 'soft' | 'hard' | 'compliance';
  isActive: boolean;
  type: AuditType | 'BOTH';
}

export interface ProjectTargets {
  score: number;
  csat: number;
}

export interface Audit {
  id: string;
  readableId: string;
  interactionId?: string;
  agentName: string;
  project: string;
  date: string;
  type: AuditType;
  status: AuditStatus;
  csat: number;
  qualityScore: number;
  notes?: string;
  aiNotes?: string;
  customData?: Record<string, boolean>;
  sentiment?: Sentiment;
  isAiGenerated?: boolean;
  tokenUsage?: number;
  organization_id?: string;
}

export interface AppSettings {
  companyName: string;
  logoBase64?: string;
  preferredLanguage?: Language;
  usage?: UsageStats;
  chatbotName?: string;
  supabaseUrl?: string;
  supabaseKey?: string;
  subscriptionTier?: SubscriptionTier;
  lang?: Language; // Añadido para compatibilidad con Contexto
}

export type Language = 'en' | 'es';
export type Theme = 'light' | 'dark';

export interface Agent {
  id: string;
  name: string;
  projectId?: string;
  auditChannel?: 'VOICE' | 'CHAT' | 'BOTH';
  organization_id?: string;
}

export interface Project {
  id: string;
  name: string;
  targets?: ProjectTargets;
  rubricIds?: string[];
  organization_id?: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  AUDITOR = 'AUDITOR',
  CLIENT = 'CLIENT'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  pin: string;
  organizationId: string;
  organization_id?: string;
  email?: string;
  supabaseId?: string;
  subscriptionTier?: SubscriptionTier;
}

export interface UsageStats {
  aiAuditsCount: number;
  estimatedTokens: number;
  estimatedCost: number;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  date: number | string; // 👈 CORRECCIÓN: Acepta string de Supabase
  messages: Message[];
  created_at?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  color: string;
  aiLimit: string;
  aiLimitValue: number;
  features: string[];
  recommended?: boolean;
}
