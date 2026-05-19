'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { USE_CASES, type UseCaseId } from '@/lib/use-cases';
import { UseCaseWizard } from '@/components/UseCaseWizard';

function OnboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ucParam = searchParams.get('uc') as UseCaseId | null;

  if (!ucParam || !USE_CASES[ucParam]) {
    router.replace('/');
    return null;
  }

  return <UseCaseWizard config={USE_CASES[ucParam]} />;
}

export default function OnboardPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--surface)' }} />}>
      <OnboardContent />
    </Suspense>
  );
}
