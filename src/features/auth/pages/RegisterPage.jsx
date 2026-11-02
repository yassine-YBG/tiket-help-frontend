import { useState } from 'react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { AlertCircleIcon, CheckIcon, MailCheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { FormField } from '@/components/form/FormField';
import { PasswordInput } from '@/components/form/PasswordInput';
import { authApi } from '@/api/auth.api';
import { getErrorMessage, getStatusCode } from '@/lib/errors';
import { MIN_PASSWORD_LENGTH } from '@/lib/constants';
import { AuthLayout } from '../components/AuthLayout';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// What happens after signing up (the activation is done by a person)
const NEXT_STEPS = [
  'Your account is created now',
  'An administrator reviews and activates it',
  'You log in and open your first ticket',
];

export default function RegisterPage() {
  const [serverError, setServerError] = useState(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { username: '', lastname: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async ({ username, lastname, email, password }) => {
    setServerError(null);
    try {
      await authApi.register({ username: username.trim(), lastname: lastname.trim(), email: email.trim(), password });
      setDone(true);
    } catch (error) {
      setServerError(
        getStatusCode(error) === 429
          ? 'Too many attempts. Please wait 15 minutes and try again.'
          : getErrorMessage(error)
      );
    }
  };

  if (done) {
    return (
      <AuthLayout>
        <div className="grid gap-6" role="status">
          <div className="flex size-12 items-center justify-center rounded-xl bg-success-soft">
            <MailCheckIcon className="size-5 text-success" />
          </div>
          <div className="grid gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Account created</h1>
            <p className="text-sm text-pretty text-muted-foreground">
              An administrator must activate your account before you can log in. You will be able to log in as soon
              as it is activated.
            </p>
          </div>
          <ol className="grid gap-3 rounded-xl border bg-muted/40 p-4">
            {NEXT_STEPS.map((step, index) => (
              <li key={step} className="flex items-center gap-3 text-sm">
                <span
                  className={
                    index === 0
                      ? 'flex size-6 shrink-0 items-center justify-center rounded-full bg-success text-white'
                      : 'flex size-6 shrink-0 items-center justify-center rounded-full border bg-card text-xs font-medium text-muted-foreground'
                  }
                >
                  {index === 0 ? <CheckIcon className="size-3.5" /> : index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <Button asChild size="lg" className="w-full">
            <Link to="/login">Back to login</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create your account" description="An administrator will activate it before your first login.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5">
        {serverError && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-3">
          <FormField id="username" label="First name" error={errors.username?.message}>
            <Input
              id="username"
              autoComplete="given-name"
              className="h-10"
              aria-invalid={!!errors.username}
              {...register('username', { required: 'Required', validate: (v) => !!v.trim() || 'Required' })}
            />
          </FormField>
          <FormField id="lastname" label="Last name" error={errors.lastname?.message}>
            <Input
              id="lastname"
              autoComplete="family-name"
              className="h-10"
              aria-invalid={!!errors.lastname}
              {...register('lastname', { required: 'Required', validate: (v) => !!v.trim() || 'Required' })}
            />
          </FormField>
        </div>

        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            placeholder="you@company.com"
            className="h-10"
            aria-invalid={!!errors.email}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email' },
            })}
          />
        </FormField>

        <FormField
          id="password"
          label="Password"
          error={errors.password?.message}
          hint={`At least ${MIN_PASSWORD_LENGTH} characters`}
        >
          <PasswordInput
            id="password"
            autoComplete="new-password"
            className="h-10"
            aria-invalid={!!errors.password}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: MIN_PASSWORD_LENGTH, message: `At least ${MIN_PASSWORD_LENGTH} characters` },
            })}
          />
        </FormField>

        <FormField id="confirmPassword" label="Confirm password" error={errors.confirmPassword?.message}>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            className="h-10"
            aria-invalid={!!errors.confirmPassword}
            {...register('confirmPassword', {
              required: 'Please confirm the password',
              validate: (v) => v === getValues('password') || 'Passwords do not match',
            })}
          />
        </FormField>

        <Button type="submit" size="lg" className="mt-1 w-full" disabled={isSubmitting}>
          {isSubmitting && <Spinner />}
          Create account
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
