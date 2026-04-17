import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { getFirestoreStore } from '@shipwithai/core/firestore-store';
import type { BrandTheme } from '@shipwithai/core/brand-scraper';
import { AuditReportDocument, type AuditReportData } from '@/lib/audit-pdf';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const store = getFirestoreStore();

  const deliverable = await store.getDeliverable(params.id);
  if (!deliverable || deliverable.type !== 'audit_report') {
    return NextResponse.json(
      { success: false, error: 'Audit report not found' },
      { status: 404 },
    );
  }

  const structured = await store.getDeliverableContent(params.id, 'structured');
  if (!structured) {
    return NextResponse.json(
      { success: false, error: 'Structured audit data missing — cannot render PDF' },
      { status: 404 },
    );
  }

  let report: AuditReportData;
  try {
    report = JSON.parse(structured.content) as AuditReportData;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Structured audit data is not valid JSON' },
      { status: 500 },
    );
  }

  // Pull the brand theme and target repo off the project, if available.
  let theme: BrandTheme | undefined;
  let targetRepo: string | undefined;
  if (deliverable.projectId) {
    const project = await store.getProject(deliverable.projectId);
    const meta = project?.metadata as Record<string, unknown> | undefined;
    theme = meta?.brandTheme as BrandTheme | undefined;
    const auditTarget = meta?.auditTargetRepo as { owner?: string; name?: string } | undefined;
    if (auditTarget?.owner && auditTarget?.name) {
      targetRepo = `${auditTarget.owner}/${auditTarget.name}`;
    }
  }

  const generatedAt = new Date(deliverable.createdAt).toISOString().slice(0, 10);

  const pdfBuffer = await renderToBuffer(
    AuditReportDocument({
      report,
      theme,
      targetRepo,
      generatedAt,
    }),
  );

  const safeRepo = targetRepo?.replace(/[^a-z0-9_-]+/gi, '-') ?? 'audit';
  const fileName = `shipwithai-audit-${safeRepo}-${generatedAt}.pdf`;

  // Node Buffer doesn't satisfy the Web BodyInit type under TS's strict DOM lib,
  // so emit it through a ReadableStream (same pattern as the SSE routes).
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(pdfBuffer));
      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'private, max-age=300',
    },
  });
}
