import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreStore } from '@shipwithai/core/firestore-store';
import { scrapeBrand } from '@shipwithai/core/brand-scraper';
import { getSessionUser } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  const store = getFirestoreStore();
  const { searchParams } = request.nextUrl;

  // Scope listing to the signed-in user. Anonymous callers get an empty list
  // so the landing page doesn't leak other users' projects.
  const user = await getSessionUser();
  if (searchParams.get('scope') === 'mine' && !user) {
    return NextResponse.json({ success: true, projects: [] });
  }

  const projects = await store.listProjects({
    status: searchParams.get('status') ?? undefined,
    limit: searchParams.has('limit') ? Number(searchParams.get('limit')) : undefined,
    userId: searchParams.get('scope') === 'mine' && user ? user.id : undefined,
  });

  return NextResponse.json({ success: true, projects });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { id, name, description, status, budget, metadata } = body;

  if (!id || !name) {
    return NextResponse.json({ success: false, error: 'id and name required' }, { status: 400 });
  }

  const user = await getSessionUser();
  const store = getFirestoreStore();
  const project = await store.saveProject({
    id,
    name,
    description,
    status: status ?? 'planning',
    budget,
    metadata,
    userId: user?.id,
  });

  // Fire-and-forget: scraping the user's site may take seconds. Doing it inline
  // would block project creation (and the UI redirect) on an external fetch.
  void enrichWithBrandThemeAsync(id, metadata);

  return NextResponse.json({ success: true, project });
}

async function enrichWithBrandThemeAsync(
  projectId: string,
  metadata: Record<string, unknown> | undefined,
): Promise<void> {
  const answers = metadata?.answers as Record<string, unknown> | undefined;
  const brandUrl = typeof answers?.brandUrl === 'string' ? answers.brandUrl : undefined;
  if (!brandUrl) return;

  try {
    const theme = await scrapeBrand(brandUrl);
    if (!theme) return;
    const store = getFirestoreStore();
    const current = await store.getProject(projectId);
    if (!current) return;
    await store.saveProject({
      ...current,
      metadata: { ...(current.metadata ?? {}), brandTheme: theme },
    });
  } catch (err) {
    console.error('[projects] brand enrichment failed', err);
  }
}
