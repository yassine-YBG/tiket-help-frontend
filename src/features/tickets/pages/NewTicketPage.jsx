import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { AlertCircleIcon, BellRingIcon, MessagesSquareIcon, SendIcon, UserCheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/layout/PageHeader';
import { FormField } from '@/components/form/FormField';
import { CATEGORY_SUGGESTIONS, LIMITS, PRIORITY_DESCRIPTIONS, PRIORITY_LABELS, prioritiesFor } from '@/lib/constants';
import { useAuth } from '@/features/auth/useAuth';
import { getErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { useCreateTicket } from '../hooks/useTickets';
import { FilePicker } from '../components/FilePicker';

const required = (label) => ({
  required: `${label} is required`,
  validate: (value) => !!value.trim() || `${label} is required`,
});

const EMPTY_TICKET = { subject: '', category: '', priority: 'normal', description: '' };

// What happens after "Create ticket" (the real flow of the service)
const NEXT_STEPS = [
  { icon: SendIcon, title: 'Your ticket reaches the team', text: 'It appears right away in the support inbox.' },
  { icon: UserCheckIcon, title: 'An agent takes it', text: 'One person is assigned and follows it to the end.' },
  { icon: MessagesSquareIcon, title: 'You talk here', text: 'Answers, questions and files stay in one conversation.' },
  { icon: BellRingIcon, title: 'You are notified', text: 'A blue dot in My tickets shows every new answer.' },
];

// "Open a new ticket" from a closed ticket: pre-fill the subject and point to the old ticket
function followUpValues(followUp) {
  if (!followUp?.id || typeof followUp.subject !== 'string') return {};
  const subject = `Follow-up: ${followUp.subject}`.slice(0, LIMITS.subject);
  const link = `${window.location.origin}/tickets/${encodeURIComponent(followUp.id)}`;
  return { subject, description: `Follow-up of my previous ticket: ${link}\n\n` };
}

function Section({ title, description, children }) {
  return (
    <section className="grid gap-5 px-5 py-6 sm:px-6">
      {title && (
        <div className="grid gap-0.5">
          <h2 className="text-sm font-semibold">{title}</h2>
          {description && <p className="text-[13px] text-muted-foreground">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export default function NewTicketPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const createTicket = useCreateTicket();
  const [files, setFiles] = useState([]);
  const [serverError, setServerError] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { ...EMPTY_TICKET, ...followUpValues(location.state?.followUp) } });

  const description = useWatch({ control, name: 'description' });
  const subject = useWatch({ control, name: 'subject' });
  const priority = useWatch({ control, name: 'priority' });
  const busy = createTicket.isPending;

  const onSubmit = (values) => {
    setServerError(null);
    const data = {
      subject: values.subject.trim(),
      category: values.category.trim(),
      priority: values.priority,
      description: values.description.trim(),
    };
    createTicket.mutate(
      { data, files },
      {
        onSuccess: ({ ticketId }) => {
          toast.success('Ticket created');
          navigate(`/tickets/${ticketId}`, { replace: true });
        },
        onError: (error) => setServerError(getErrorMessage(error)),
      }
    );
  };

  return (
    <>
      <PageHeader
        eyebrow="Support"
        title="New ticket"
        description="Describe your problem. The support team will answer here."
      />
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="divide-y rounded-xl border bg-card shadow-xs max-sm:-mx-4 max-sm:rounded-none max-sm:border-x-0 max-sm:shadow-none"
        >
          {serverError && (
            <div className="px-5 pt-5 sm:px-6">
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            </div>
          )}

          <Section title="The problem" description="A clear subject helps us route your ticket to the right person.">
            <FormField
              id="subject"
              label="Subject"
              error={errors.subject?.message}
              action={
                <span className="text-xs text-muted-foreground tabular-nums">
                  {subject.length}/{LIMITS.subject}
                </span>
              }
            >
              <Input
                id="subject"
                placeholder="Short summary of the problem"
                maxLength={LIMITS.subject}
                aria-invalid={!!errors.subject}
                disabled={busy}
                {...register('subject', required('Subject'))}
              />
            </FormField>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField id="category" label="Category" error={errors.category?.message} hint="Pick one or type your own">
                <Input
                  id="category"
                  list="category-suggestions"
                  placeholder="e.g. YouTube"
                  maxLength={LIMITS.category}
                  aria-invalid={!!errors.category}
                  disabled={busy}
                  {...register('category', required('Category'))}
                />
                <datalist id="category-suggestions">
                  {CATEGORY_SUGGESTIONS.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </FormField>

              <FormField id="priority" label="Priority" hint={PRIORITY_DESCRIPTIONS[priority]}>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={busy}>
                      <SelectTrigger id="priority" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {prioritiesFor(user).map((p) => (
                          <SelectItem key={p} value={p}>
                            {PRIORITY_LABELS[p]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            </div>

            <FormField
              id="description"
              label="Description"
              error={errors.description?.message}
              hint="What happened, what you expected, steps to reproduce"
              action={
                <span
                  className={cn(
                    'text-xs tabular-nums',
                    description.length > LIMITS.description * 0.9 ? 'text-warning' : 'text-muted-foreground'
                  )}
                >
                  {description.length}/{LIMITS.description}
                </span>
              }
            >
              <Textarea
                id="description"
                rows={8}
                maxLength={LIMITS.description}
                aria-invalid={!!errors.description}
                disabled={busy}
                className="min-h-44"
                {...register('description', required('Description'))}
              />
            </FormField>
          </Section>

          <Section title="Files" description="Optional — screenshots and documents help us understand faster.">
            <FilePicker variant="dropzone" files={files} onChange={setFiles} disabled={busy} />
          </Section>

          <div className="flex flex-col-reverse gap-2 bg-muted/30 px-5 py-4 sm:flex-row sm:justify-end sm:px-6 max-sm:[&>button]:h-11">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy && <Spinner />}
              Create ticket
            </Button>
          </div>
        </form>

        <aside className="hidden lg:block lg:sticky lg:top-6" aria-label="What happens next">
          <h2 className="mb-4 text-sm font-semibold">What happens next</h2>
          <ol className="relative grid gap-5">
            <span aria-hidden className="absolute top-3 bottom-3 left-[15px] w-px bg-border" />
            {NEXT_STEPS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="relative flex gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-card shadow-xs">
                  <Icon className="size-3.5 text-primary" />
                </span>
                <div className="grid gap-0.5 pt-1">
                  <p className="text-[13px] font-medium">{title}</p>
                  <p className="text-[13px] leading-relaxed text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </>
  );
}
