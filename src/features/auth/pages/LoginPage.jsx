import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { AlertCircleIcon, ArrowRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { FormField } from '@/components/form/FormField';
import { PasswordInput } from '@/components/form/PasswordInput';
import { getErrorMessage, getStatusCode } from '@/lib/errors';
import { useAuth } from '../useAuth';
import { AuthLayout } from '../components/AuthLayout';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '' } });

  const onSubmit = async ({ email, password }) => {
    setServerError(null);
    try {
      await login(email.trim(), password);
      // go back to the page the user wanted before logging in
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (error) {
      const status = getStatusCode(error);
      if (status === 403) {
        setServerError('Your account is not activated yet. An administrator must activate it first.');
      } else if (status === 429) {
        setServerError('Too many attempts. Please wait 15 minutes and try again.');
      } else {
        setServerError(getErrorMessage(error));
      }
    }
  };

  return (
    <AuthLayout title="Welcome back" description="Log in to manage your support tickets and talk with our team.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5">
        {serverError && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

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
            {...register('email', { required: 'Email is required' })}
          />
        </FormField>

        <FormField id="password" label="Password" error={errors.password?.message}>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            enterKeyHint="go"
            className="h-10"
            aria-invalid={!!errors.password}
            {...register('password', { required: 'Password is required' })}
          />
        </FormField>

        <Button type="submit" size="lg" className="mt-1 w-full" disabled={isSubmitting}>
          {isSubmitting && <Spinner />}
          Log in
        </Button>
      </form>

      <div className="mt-8 flex items-center justify-between gap-3 rounded-xl border bg-muted/50 px-4 py-3.5">
        <div className="grid gap-0.5">
          <p className="text-sm font-medium">New to Tiket Help?</p>
          <p className="text-xs text-muted-foreground">Create your customer account in a minute.</p>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link to="/register">
            Create one
            <ArrowRightIcon />
          </Link>
        </Button>
      </div>
    </AuthLayout>
  );
}
