import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { AlertCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/layout/PageHeader';
import { FormField } from '@/components/form/FormField';
import { CATEGORY_SUGGESTIONS, LIMITS, PRIORITY_LABELS, TICKET_PRIORITIES } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';
import { useCreateTicket } from '../hooks/useTickets';
import { FilePicker } from '../components/FilePicker';

const required = (label) => ({
  required: `${label} is required`,
  validate: (value) => !!value.trim() || `${label} is required`,
});

export default function NewTicketPage() {
  const navigate = useNavigate();
  const createTicket = useCreateTicket();
  const [files, setFiles] = useState([]);
  const [serverError, setServerError] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { subject: '', category: '', priority: 'normal', description: '' } });

  const description = useWatch({ control, name: 'description' });
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
      <PageHeader title="New ticket" description="Describe your problem. The support team will answer here." />
      <Card className="max-w-3xl">
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5">
            {serverError && (
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <FormField id="subject" label="Subject" error={errors.subject?.message}>
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

              <FormField id="priority" label="Priority">
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={busy}>
                      <SelectTrigger id="priority" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TICKET_PRIORITIES.map((p) => (
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
              hint={`${description.length}/${LIMITS.description} — what happened, what you expected, steps to reproduce`}
            >
              <Textarea
                id="description"
                rows={8}
                maxLength={LIMITS.description}
                aria-invalid={!!errors.description}
                disabled={busy}
                className="min-h-40"
                {...register('description', required('Description'))}
              />
            </FormField>

            <div className="grid gap-2">
              <span className="text-sm font-medium">Files (optional)</span>
              <FilePicker files={files} onChange={setFiles} disabled={busy} />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={busy}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy && <Spinner />}
                Create ticket
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
