// 1. Idiomas y Sentimientos
export type Language = 'en' | 'es';
export type Sentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'MIXED';

// 2. Niveles de Suscripción y Roles
export enum SubscriptionTier {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  AUDITOR = 'AUDITOR',
  CLIENT = 'CLIENT'
}

// 3. Tipos de Auditoría
export enum AuditType {
  VOICE = 'VOICE',
  CHAT = 'CHAT'
}

// 4. Interfaces (Los moldes de tus objetos)
export interface User {
  id: string;
  name: string;
  role: UserRole;
  organizationId: string;
  pin: string;
  email?: string;
  subscriptionTier?: SubscriptionTier;
}

export interface Project {
  id: string;
  name: string;
  targets?: { score: number; csat: number };
  rubricIds?: string[];
}

export interface RubricItem {
  id: string;
  label: string;
  category: 'soft' | 'hard' | 'compliance';
  isActive: boolean;
  type: AuditType | 'BOTH';
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
