
import { SecurityLevel, SecurityReport } from '../types';

/**
 * Diccionario de Criticidad y Patrones de Identificación (PII/Sensitive Data)
 * Alineado con ISO 42001 y GDPR.
 */
const SECURITY_DICTIONARY = {
  RED_PATTERNS: [
    {
      id: 'FINANCIAL_CARD',
      regex: /\b(?:\d[ -]*?){13,16}\b/g,
      label: 'Datos Financieros (Tarjeta)',
      tag: '[DATO_FINANCIERO_PROTEGIDO]'
    },
    {
      id: 'PASSWORDS',
      regex: /\b(password|contraseña|pwd|pass|secret|clave):?\s*(\S+)/gi,
      label: 'Credenciales de Acceso',
      tag: '[CRED_ACCESO_SEGURIDAD]'
    },
    {
      id: 'GOV_ID',
      // Formato Cédula: 001-0000000-0 o variaciones similares de 11 dígitos con guiones
      regex: /\b\d{3}-?\d{7}-?\d{1}\b/g,
      label: 'Identificación Gubernamental (Cédula)',
      tag: '[ID_PERSONA_PROTEGIDO]'
    },
    {
      id: 'INDUSTRIAL_SECRET',
      regex: /\b(Project X|Confidential Plan|Strategy 2025|Fusion Core)\b/gi,
      label: 'Secreto Industrial',
      tag: '[RECURSO_CONFIDENCIAL]'
    }
  ],
  YELLOW_PATTERNS: [
    {
      id: 'EMAIL',
      regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      label: 'Correo Electrónico',
      tag: '[EMAIL_SISTEMA_PROTEGIDO]'
    },
    {
      id: 'PHONE_REGIONAL',
      // Soporta formatos internacionales y locales con/sin prefijos
      regex: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
      label: 'Número Telefónico',
      tag: '[CONTACTO_PRIVADO_SISTEMA]'
    }
  ]
};

/**
 * Intercepta, Valida y Sanitiza el contenido antes de enviarlo a la IA.
 */
export const interceptAndValidate = (content: string): SecurityReport => {
  let report: SecurityReport = {
    isBlocked: false,
    flags: [],
    details: "Security Scan Passed",
    sanitizedContent: content,
    reason: undefined
  };

  // 1. Evaluación de NIVEL ROJO (Hard-Stop)
  SECURITY_DICTIONARY.RED_PATTERNS.forEach(pattern => {
    if (pattern.regex.test(content)) {
      report.flags.push(pattern.label);
      report.isBlocked = true;
      report.reason = `Contenido Bloqueado: ${pattern.label}`;
      report.details = "Critical Security Violation Detected";
    }
  });

  // Si está bloqueado, no procedemos a sanitizar, cortamos el flujo inmediatamente
  if (report.isBlocked) {
    // Borramos el contenido para seguridad de memoria en el reporte
    report.sanitizedContent = "[CONTENIDO_BLOQUEADO_POR_SEGURIDAD]";
    return report;
  }

  // 2. Evaluación de NIVEL AMARILLO (Sanitización Semántica)
  let workingContent = content;
  let hasYellowFindings = false;

  SECURITY_DICTIONARY.YELLOW_PATTERNS.forEach(pattern => {
    if (pattern.regex.test(content)) {
      hasYellowFindings = true;
      report.flags.push(pattern.label);
      // Aplicamos reemplazo con etiquetas semánticas para que la IA conserve contexto
      workingContent = workingContent.replace(pattern.regex, pattern.tag);
    }
  });

  if (hasYellowFindings) {
    report.details = "Content Sanitized (PII Detected)";
  }

  report.sanitizedContent = workingContent;
  return report;
};
