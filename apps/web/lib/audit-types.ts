export const AUDIT_OUTPUT_TOOL = 'submit_audit_report';

export type AuditSeverity = 'critical' | 'high' | 'medium' | 'low' | 'informational';
export type AuditRecommendation = 'go' | 'no-go' | 'conditional';

export interface AuditFinding {
  id: string;
  severity: AuditSeverity;
  title: string;
  description: string;
  location?: string;
  recommendation?: string;
}

export interface AuditReport {
  status: 'completed' | 'in_progress' | 'blocked';
  summary: string;
  recommendation: AuditRecommendation;
  findings: AuditFinding[];
  contractsReviewed?: string[];
}

export const SEVERITY_ORDER: AuditSeverity[] = ['critical', 'high', 'medium', 'low', 'informational'];

export function groupFindingsBySeverity(findings: AuditFinding[]): Map<AuditSeverity, AuditFinding[]> {
  const groups = new Map<AuditSeverity, AuditFinding[]>();
  for (const f of findings) {
    const bucket = groups.get(f.severity) ?? [];
    bucket.push(f);
    groups.set(f.severity, bucket);
  }
  return groups;
}

export function countFindingsBySeverity(findings: AuditFinding[]): Record<AuditSeverity, number> {
  const counts: Record<AuditSeverity, number> = {
    critical: 0, high: 0, medium: 0, low: 0, informational: 0,
  };
  for (const f of findings) counts[f.severity] += 1;
  return counts;
}
