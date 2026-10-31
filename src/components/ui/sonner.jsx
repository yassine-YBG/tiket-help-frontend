import { Toaster as Sonner } from 'sonner';

// Toast notifications: call toast.success('Saved') / toast.error('...') from anywhere
function Toaster(props) {
  return (
    <Sonner
      className="toaster group"
      position="top-right"
      richColors
      closeButton
      style={{
        '--normal-bg': 'var(--popover)',
        '--normal-text': 'var(--popover-foreground)',
        '--normal-border': 'var(--border)',
      }}
      {...props}
    />
  );
}

export { Toaster };
