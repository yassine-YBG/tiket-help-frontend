import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { AlertCircleIcon, MonitorIcon, MoonIcon, ShieldCheckIcon, SunIcon } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { PageHeader } from '@/components/layout/PageHeader';
import { FormField } from '@/components/form/FormField';
import { PasswordInput } from '@/components/form/PasswordInput';
import { RoleBadge } from '@/features/users/components/UserBadges';
import { authApi } from '@/api/auth.api';
import { useAuth } from '@/features/auth/useAuth';
import { MIN_PASSWORD_LENGTH } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { getErrorMessage, getStatusCode } from '@/lib/errors';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';

// Settings-style section: what it is on the left, the controls on the right (desktop)
function Section({ title, description, children }) {
  return (
    <section className="grid gap-5 border-t py-8 first:border-t-0 first:pt-0 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
      <div className="grid content-start gap-1">
        <h2 className="text-[15px] font-semibold">{title}</h2>
        {description && <p className="text-[13px] text-pretty text-muted-foreground">{description}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function InfoRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
      <dt className="text-[13px] text-muted-foreground">{label}</dt>
      <dd className="text-right text-[13px] font-medium">{children}</dd>
    </div>
  );
}

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'dark', label: 'Dark', icon: MoonIcon },
  { value: 'system', label: 'System', icon: MonitorIcon },
];

function ThemeChooser() {
  const { theme, setTheme } = useTheme();
  return (
    <div role="radiogroup" aria-label="Theme" className="grid max-w-md grid-cols-3 gap-1 rounded-xl bg-muted p-1">
      {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(value)}
            className={cn(
              'pressable flex h-9 items-center justify-center gap-2 rounded-lg text-[13px] font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
              active ? 'bg-card text-foreground shadow-panel' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
}

function ChangePasswordForm() {
  const { updateToken } = useAuth();
  const [serverError, setServerError] = useState(null);
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' } });

  const onSubmit = async ({ currentPassword, newPassword }) => {
    setServerError(null);
    try {
      const { token } = await authApi.changePassword(currentPassword, newPassword);
      // the old token no longer works: keep this browser logged in with the new one
      updateToken(token);
      reset();
      toast.success('Password changed. Your other devices have been logged out.');
    } catch (error) {
      const status = getStatusCode(error);
      setServerError(
        status === 429
          ? 'Too many attempts. Please wait 15 minutes and try again.'
          : getErrorMessage(error)
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="overflow-hidden rounded-xl border bg-card shadow-xs"
    >
      <div className="grid max-w-md gap-4 p-4 sm:p-5">
        {serverError && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
        <FormField id="currentPassword" label="Current password" error={errors.currentPassword?.message}>
          <PasswordInput
            id="currentPassword"
            autoComplete="current-password"
            aria-invalid={!!errors.currentPassword}
            {...register('currentPassword', { required: 'Enter your current password' })}
          />
        </FormField>
        <FormField
          id="newPassword"
          label="New password"
          error={errors.newPassword?.message}
          hint={`At least ${MIN_PASSWORD_LENGTH} characters`}
        >
          <PasswordInput
            id="newPassword"
            autoComplete="new-password"
            aria-invalid={!!errors.newPassword}
            {...register('newPassword', {
              required: 'Enter a new password',
              minLength: { value: MIN_PASSWORD_LENGTH, message: `At least ${MIN_PASSWORD_LENGTH} characters` },
              validate: (v) => v !== getValues('currentPassword') || 'The new password must be different',
            })}
          />
        </FormField>
        <FormField id="confirmPassword" label="Confirm new password" error={errors.confirmPassword?.message}>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            {...register('confirmPassword', {
              required: 'Please confirm the new password',
              validate: (v) => v === getValues('newPassword') || 'Passwords do not match',
            })}
          />
        </FormField>
      </div>
      <div className="flex flex-col-reverse gap-3 border-t bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheckIcon className="size-4 shrink-0" />
          Other devices are logged out after the change.
        </p>
        <Button type="submit" disabled={isSubmitting} className="max-sm:h-11">
          {isSubmitting && <Spinner />}
          Change password
        </Button>
      </div>
    </form>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <>
      <PageHeader eyebrow="Account" title="Profile" description="Your account information and password." />

      <Section title="Account" description="Who you are for the support team. Contact an administrator to change it.">
        <dl className="divide-y overflow-hidden rounded-xl border bg-card shadow-xs">
          <div className="flex items-center gap-4 px-4 py-4 sm:px-5">
            <Avatar first={user.username} last={user.lastname} seed={user.email} size="lg" />
            <div className="grid min-w-0 gap-0.5">
              <dt className="sr-only">Name</dt>
              <dd className="truncate text-lg font-semibold tracking-tight">
                {user.username} {user.lastname}
              </dd>
              <dt className="sr-only">Email</dt>
              <dd className="truncate text-sm text-muted-foreground">{user.email}</dd>
            </div>
          </div>
          <InfoRow label="Role">
            <RoleBadge role={user.role} />
          </InfoRow>
          <InfoRow label="Member since">
            <span className="tabular-nums">{formatDate(user.createdAt)}</span>
          </InfoRow>
        </dl>
      </Section>

      <Section title="Change password" description="Changing it logs you out on every other device.">
        <ChangePasswordForm />
      </Section>

      <Section title="Appearance" description="Choose how Tiket Help looks on this device.">
        <ThemeChooser />
      </Section>
    </>
  );
}
