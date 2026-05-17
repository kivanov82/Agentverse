import { Document, Page, Text, View, StyleSheet, Image, Link } from '@react-pdf/renderer';
import type { BrandTheme } from '@shipwithai/core/brand-scraper';
import {
  SEVERITY_ORDER,
  groupFindingsBySeverity,
  type AuditReport,
  type AuditSeverity,
  type AuditRecommendation,
} from './audit-types';

export type AuditReportData = AuditReport;

export interface AuditPdfProps {
  report: AuditReport;
  theme?: BrandTheme;
  targetRepo?: string;
  generatedAt: string;
}

const SEVERITY_COLOR: Record<AuditSeverity, string> = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#ca8a04',
  low: '#2563eb',
  informational: '#64748b',
};

const RECOMMENDATION_COLOR: Record<AuditRecommendation, string> = {
  go: '#059669',
  conditional: '#ca8a04',
  'no-go': '#dc2626',
};

const BRAND_DEFAULT = '#10b981';
const SHIPWITHAI_URL = 'https://shipwithai.nl';

// Guards against unusable scraped accents (e.g. Kasu ships theme-color=#ffffff,
// which would render PDF headings/borders invisible on the white page). We
// fall back to BRAND_DEFAULT when the color has poor contrast against white.
function pickAccent(scraped: string | undefined): string {
  if (!scraped) return BRAND_DEFAULT;
  const rgb = parseHexColor(scraped);
  if (!rgb) return BRAND_DEFAULT;
  const [r, g, b] = rgb;
  // Relative luminance per WCAG — 0 = black, 1 = white. Reject the extremes.
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  if (luminance > 0.85 || luminance < 0.05) return BRAND_DEFAULT;
  return scraped;
}

function parseHexColor(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const raw = m[1];
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
}

function buildStyles(accent: string) {
  return StyleSheet.create({
    page: {
      paddingTop: 48,
      paddingBottom: 64,
      paddingHorizontal: 48,
      fontSize: 10,
      color: '#1f2937',
      fontFamily: 'Helvetica',
      lineHeight: 1.45,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
      paddingBottom: 12,
      borderBottomWidth: 2,
      borderBottomColor: accent,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    logo: {
      width: 28,
      height: 28,
      objectFit: 'contain',
    },
    brandText: {
      fontSize: 14,
      fontFamily: 'Helvetica-Bold',
      color: accent,
    },
    headerRight: {
      fontSize: 9,
      color: '#6b7280',
      textAlign: 'right',
    },
    title: {
      fontSize: 22,
      fontFamily: 'Helvetica-Bold',
      marginBottom: 4,
      color: '#111827',
    },
    subtitle: {
      fontSize: 10,
      color: '#6b7280',
      marginBottom: 18,
    },
    sectionLabel: {
      fontSize: 9,
      fontFamily: 'Helvetica-Bold',
      color: accent,
      letterSpacing: 1,
      marginBottom: 6,
      textTransform: 'uppercase',
    },
    summary: {
      fontSize: 11,
      lineHeight: 1.5,
      marginBottom: 16,
      color: '#1f2937',
    },
    recommendationBadge: {
      alignSelf: 'flex-start',
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 4,
      fontSize: 10,
      fontFamily: 'Helvetica-Bold',
      color: '#ffffff',
      marginBottom: 18,
    },
    contractList: {
      marginBottom: 16,
      paddingLeft: 10,
    },
    contractItem: {
      fontSize: 9,
      fontFamily: 'Courier',
      color: '#374151',
      marginBottom: 2,
    },
    severityGroup: {
      marginTop: 10,
      marginBottom: 4,
    },
    severityHeader: {
      fontSize: 12,
      fontFamily: 'Helvetica-Bold',
      marginBottom: 8,
    },
    finding: {
      marginBottom: 12,
      paddingLeft: 10,
      borderLeftWidth: 2,
    },
    findingTitle: {
      fontSize: 11,
      fontFamily: 'Helvetica-Bold',
      color: '#111827',
      marginBottom: 2,
    },
    findingId: {
      fontFamily: 'Courier',
      fontSize: 9,
      color: '#6b7280',
      marginRight: 4,
    },
    findingLocation: {
      fontSize: 9,
      fontFamily: 'Courier',
      color: '#4b5563',
      marginBottom: 4,
    },
    findingBody: {
      fontSize: 10,
      color: '#1f2937',
      marginBottom: 4,
    },
    recommendationLabel: {
      fontSize: 9,
      fontFamily: 'Helvetica-Bold',
      color: '#374151',
      marginTop: 2,
    },
    recommendationText: {
      fontSize: 10,
      color: '#1f2937',
    },
    footer: {
      position: 'absolute',
      bottom: 24,
      left: 48,
      right: 48,
      fontSize: 8,
      color: '#9ca3af',
      textAlign: 'center',
      borderTopWidth: 1,
      borderTopColor: '#e5e7eb',
      paddingTop: 10,
    },
    pageNumber: {
      position: 'absolute',
      bottom: 24,
      right: 48,
      fontSize: 8,
      color: '#9ca3af',
    },
    emptyState: {
      fontSize: 11,
      fontStyle: 'italic',
      color: '#6b7280',
      marginTop: 4,
    },
  });
}

export function AuditReportDocument({ report, theme, targetRepo, generatedAt }: AuditPdfProps) {
  const accent = pickAccent(theme?.primaryColor);
  const styles = buildStyles(accent);
  const bySeverity = groupFindingsBySeverity(report.findings);

  return (
    <Document
      title={`ShipWithAI Audit Report${targetRepo ? ` — ${targetRepo}` : ''}`}
      author="ShipWithAI"
      creator="ShipWithAI Solidity Auditor"
      producer="ShipWithAI"
    >
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header} fixed>
          <View style={styles.headerLeft}>
            {theme?.logoUrl && (
              <Image src={theme.logoUrl} style={styles.logo} />
            )}
            <Text style={styles.brandText}>ShipWithAI</Text>
          </View>
          <View style={styles.headerRight}>
            <Text>Security Audit</Text>
            <Text>{generatedAt}</Text>
          </View>
        </View>

        <Text style={styles.title}>Solidity Security Audit</Text>
        {targetRepo && <Text style={styles.subtitle}>Target: {targetRepo}</Text>}

        <Text style={styles.sectionLabel}>Executive Summary</Text>
        <Text style={styles.summary}>{report.summary}</Text>

        <View
          style={[
            styles.recommendationBadge,
            { backgroundColor: RECOMMENDATION_COLOR[report.recommendation] },
          ]}
        >
          <Text>Recommendation: {report.recommendation.toUpperCase()}</Text>
        </View>

        {report.contractsReviewed && report.contractsReviewed.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Contracts Reviewed</Text>
            <View style={styles.contractList}>
              {report.contractsReviewed.map((c) => (
                <Text key={c} style={styles.contractItem}>
                  • {c}
                </Text>
              ))}
            </View>
          </>
        )}

        <Text style={styles.sectionLabel}>Findings ({report.findings.length})</Text>

        {report.findings.length === 0 && (
          <Text style={styles.emptyState}>No findings.</Text>
        )}

        {SEVERITY_ORDER.map((sev) => {
          const items = bySeverity.get(sev);
          if (!items?.length) return null;
          const sevColor = SEVERITY_COLOR[sev];
          return (
            <View key={sev} style={styles.severityGroup} wrap={false}>
              <Text style={[styles.severityHeader, { color: sevColor }]}>
                {sev.charAt(0).toUpperCase() + sev.slice(1)} ({items.length})
              </Text>
              {items.map((f) => (
                <View
                  key={f.id}
                  style={[styles.finding, { borderLeftColor: sevColor }]}
                  wrap={false}
                >
                  <Text style={styles.findingTitle}>
                    <Text style={styles.findingId}>[{f.id}]</Text>
                    {f.title}
                  </Text>
                  {f.location && (
                    <Text style={styles.findingLocation}>{f.location}</Text>
                  )}
                  <Text style={styles.findingBody}>{f.description}</Text>
                  {f.recommendation && (
                    <>
                      <Text style={styles.recommendationLabel}>Recommendation</Text>
                      <Text style={styles.recommendationText}>{f.recommendation}</Text>
                    </>
                  )}
                </View>
              ))}
            </View>
          );
        })}

        <View style={styles.footer} fixed>
          <Text>
            Generated by ShipWithAI — <Link src={SHIPWITHAI_URL}>shipwithai.nl</Link> • This report was produced by an AI auditor.
            Human review is recommended before acting on these findings.
          </Text>
        </View>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}
