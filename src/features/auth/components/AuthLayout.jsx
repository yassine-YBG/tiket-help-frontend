import { Link } from 'react-router';
import { MessagesSquareIcon, PaperclipIcon, SignalIcon } from 'lucide-react';
import { Logo, LogoMark } from '@/components/brand/Logo';

// What the service does — the real features of the portal, not marketing claims
const PROMISES = [
  {
    icon: MessagesSquareIcon,
    title: 'Talk directly with our team',
    text: 'Every request becomes a conversation with a support agent assigned to you.',
  },
  {
    icon: SignalIcon,
    title: 'Always know where it stands',
    text: 'Open, in progress or resolved — status and priority are visible at every step.',
  },
  {
    icon: PaperclipIcon,
    title: 'Share what you see',
    text: 'Attach screenshots, documents, audio or video so we understand faster.',
  },
];

function BrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-[oklch(0.2_0.03_270)] text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
      {/* quiet grid texture, fades out toward the bottom */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:44px_44px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-32 size-[28rem] rounded-full bg-[oklch(0.55_0.2_268)] opacity-25 blur-[120px]"
      />

      <div className="relative flex items-center gap-2.5">
        <LogoMark className="bg-white text-[oklch(0.2_0.03_270)] [&_path:last-child]:stroke-[oklch(0.2_0.03_270)]" />
        <span className="text-[15px] font-semibold tracking-tight">Tiket Help</span>
      </div>

      <div className="relative grid max-w-md gap-10">
        <div className="grid gap-4">
          <p className="text-sm font-medium text-[oklch(0.8_0.09_270)]">Customer support portal</p>
          <h2 className="text-4xl leading-[1.1] font-semibold tracking-tight text-balance xl:text-[2.75rem]">
            Get help from people who own your problem.
          </h2>
        </div>
        <ul className="grid gap-6">
          {PROMISES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.08] ring-1 ring-white/10">
                <Icon className="size-4 text-[oklch(0.85_0.08_270)]" />
              </span>
              <div className="grid gap-0.5">
                <p className="text-sm font-medium">{title}</p>
                <p className="text-sm leading-relaxed text-white/60">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-xs text-white/40">© {new Date().getFullYear()} Tiket Help · Secure customer area</p>
    </aside>
  );
}

// Sign-in / sign-up frame: brand story on the left (desktop), the form on the right.
// On phones the form is the whole screen, with the brand on top.
export function AuthLayout({ title, description, children }) {
  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <BrandPanel />
      <main className="flex flex-col px-6 pt-safe pb-safe sm:px-10">
        <header className="flex h-20 items-center lg:hidden">
          <Link to="/login" aria-label="Tiket Help">
            <Logo />
          </Link>
        </header>
        <div className="flex flex-1 items-center justify-center pb-12 lg:pb-0">
          <div className="w-full max-w-[380px]">
            {title && (
              <div className="mb-8 grid gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                {description && <p className="text-sm text-pretty text-muted-foreground">{description}</p>}
              </div>
            )}
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
