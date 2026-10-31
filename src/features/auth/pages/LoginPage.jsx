import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { AlertCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { FormField } from '@/components/form/FormField';
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
    <AuthLayout>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Log in to manage your support tickets</CardDescription>
        </CardHeader>
        <CardContent>
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
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                {...register('email', { required: 'Email is required' })}
              />
            </FormField>

            <FormField id="password" label="Password" error={errors.password?.message}>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                {...register('password', { required: 'Password is required' })}
              />
            </FormField>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              Log in
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              No account yet?{' '}
              <Link to="/register" className="font-medium text-primary underline-offset-4 hover:underline">
                Create one
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
