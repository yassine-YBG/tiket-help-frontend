import { Link } from 'react-router';
import { SearchXIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <EmptyState
        icon={SearchXIcon}
        title="Page not found"
        description="This page does not exist or was moved."
        action={
          <Button asChild>
            <Link to="/">Go home</Link>
          </Button>
        }
      />
    </div>
  );
}
