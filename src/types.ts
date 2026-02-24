// 1. Roles y Suscripción
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

// 2. Seguridad y Análisis
export enum SecurityLevel {
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  RED = 'RED'
}

export interface SecurityReport {
  isBlocked: boolean;
  reason?: string;
  flags: string[];
  details: string;
  sanitizedContent: string;
}

// 3. El corazón de la data
export enum AuditStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface Audit {
  id: string;
  readableId: string;
  agentName: string;
  project: string;
  date: string;
  type: any;
  status: AuditStatus;
  csat: number;
  qualityScore: number;
  customData?: Record<string, boolean>;
  sentiment?: string;
  aiNotes?: string;
}

// 4. Entidades y Sesiones
export interface Agent {
  id: string;
  name: string;
  organizationId: string;
}

export interface ChatSession {
  id: string;
  title: string;
  date: number | string;
  messages: any[];
}

export interface SmartAnalysisResult {
  score: number;
  csat: number;
  notes: string;
  customData: Record<string, boolean>;
  sentiment: string;
}

export interface CoachingPlan {
  id: string;
  date: string;
  topic: string;
  tasks: string[];
  status: 'pending' | 'completed';
}

// 5. El Usuario (Aquí arreglamos el conflicto de organization_id)
export interface User {
  id: string;
  name: string;
  role: UserRole;
  pin: string;
  organizationId: string; // CamelCase para el código
  organization_id?: string; // 👈 Agregamos este para que Supabase sea feliz también
  email?: string;
  subscriptionTier?: SubscriptionTier;
}
