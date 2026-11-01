import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { AlertCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { PageHeader } from '@/components/layout/PageHeader';
import { FormField } from '@/components/form/FormField';
import { authApi } from '@/api/auth.api';
import { useAuth } from '@/features/auth/useAuth';
import { MIN_PASSWORD_LENGTH, ROLE_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { getErrorMessage, getStatusCode } from '@/lib/errors';

function InfoRow({ label, children }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:items-center">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{children}</dd>
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
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid max-w-md gap-4">
      {serverError && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}
      <FormField id="currentPassword" label="Current password" error={errors.currentPassword?.message}>
        <Input
          id="currentPassword"
          type="password"
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
        <Input
          id="newPassword"
          type="password"
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
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.confirmPassword}
          {...register('confirmPassword', {
            required: 'Please confirm the new password',
            validate: (v) => v === getValues('newPassword') || 'Passwords do not match',
          })}
        />
      </FormField>
      <div>
        <Button type="submit" disabled={isSubmitting}>
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
      <PageHeader title="Profile" description="Your account information and password." />
      <div className="grid max-w-3xl gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3">
              <InfoRow label="Name">
                {user.username} {user.lastname}
              </InfoRow>
              <InfoRow label="Email">{user.email}</InfoRow>
              <InfoRow label="Role">
                <Badge variant={user.role === 'user' ? 'secondary' : 'default'}>{ROLE_LABELS[user.role]}</Badge>
              </InfoRow>
              <InfoRow label="Member since">{formatDate(user.createdAt)}</InfoRow>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change password</CardTitle>
            <CardDescription>Changing it logs you out on every other device.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
