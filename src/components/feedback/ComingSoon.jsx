import { HammerIcon } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from './EmptyState';

// Temporary content for pages that are planned but not built yet
export function ComingSoon({ title, description, endpoint }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={HammerIcon}
        title="Coming in the next step"
        description={endpoint ? `This page will use ${endpoint}.` : undefined}
      />
    </>
  );
}
