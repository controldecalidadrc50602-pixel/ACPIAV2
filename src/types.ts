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
  organizationId: string;    
  organization_id?: string;  
}

export interface RubricItem {
  id: string;
  label: string;
  category: 'soft' | 'hard' | 'compliance';
  isActive: boolean;
  type: AuditType | 'BOTH';
}

export interface Project {
  id: string;
  name: string;
  targets?: { score: number; csat: number };
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
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
  interactionType?: 'INTERNAL' | 'EXTERNAL'; // 👈 Esto arregla el error de geminiService
}
