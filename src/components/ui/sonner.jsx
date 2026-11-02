import { Toaster as Sonner } from 'sonner';

// Toast notifications: call toast.success('Saved') / toast.error('...') from anywhere.
// Top-right: never over the action buttons at the bottom of panels and forms.
// On phones Sonner goes full width, kept below the notch.
function Toaster(props) {
  return (
    <Sonner
      className="toaster group"
      position="top-right"
      richColors
      closeButton
      offset={20}
      mobileOffset={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
      toastOptions={{ classNames: { toast: '!rounded-xl !shadow-float !font-sans', title: '!font-medium' } }}
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
