// 1. Niveles de Usuario y Seguridad
export enum UserRole {
  ADMIN = 'ADMIN',
  AUDITOR = 'AUDITOR',
  CLIENT = 'CLIENT'
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

// 2. Interfaces de Soporte
export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface CoachingPlan {
  id: string;
  date: string;
  topic: string;
  tasks: string[];
  status: 'pending' | 'completed';
}

export interface SecurityReport {
  isBlocked: boolean;
  reason?: string;
  flags: string[];
  details: string;
  sanitizedContent: string;
}

// 3. Resultados de Inteligencia Artificial
export interface SmartAnalysisResult {
  score: number;
  csat: number;
  notes: string;
  customData: Record<string, boolean>;
  sentiment: string;
  interactionType?: 'INTERNAL' | 'EXTERNAL';
  participants: any[];
  durationAnalysis?: string; // 👈 Agregado para arreglar GeminiService
}

// 4. Estructura de Auditoría (El Corazón)
export interface Audit {
  id: string;
  readableId: string;
  agentName: string;
  project: string;
  date: string;
  type: any; 
  status: any;
  csat: number;
  qualityScore: number;
  customData?: Record<string, boolean>;
  sentiment?: string;
  aiNotes?: string;
  isAiGenerated?: boolean; // 👈 Agregado para arreglar AuditCard
}

// ... Mantén tus otras interfaces como RubricItem, User, etc.
