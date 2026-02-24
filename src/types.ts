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

export enum SubscriptionTier {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export type Language = 'en' | 'es';
export type Sentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'MIXED';

// --- NUEVAS PIEZAS AGREGADAS ---

export interface Agent {
  id: string;
  name: string;
  organization_id?: string;
}

export interface Project {
  id: string;
  name: string;
  targets?: { score: number; csat: number };
  rubricIds?: string[];
  organization_id?: string;
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
  participants: Participant[]; // 👈 Esto arregla el error de GeminiService
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  date: number | string;
  messages: Message[];
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

// Estos dos "extienden" a Audit (heredan sus propiedades)
export interface VoiceAudit extends Audit {
  duration: number;
}

export interface ChatAudit extends Audit {
  chatTime: string;
  initialResponseTime: string;
  resolutionTime: string;
  responseUnder5Min: boolean;
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
  role: any;
  organizationId: string;
  organization_id?: string;
  pin: string;
  email?: string;
  subscriptionTier?: SubscriptionTier;
}
