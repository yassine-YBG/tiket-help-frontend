import { useState } from 'react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { AlertCircleIcon, CheckCircle2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { FormField } from '@/components/form/FormField';
import { authApi } from '@/api/auth.api';
import { getErrorMessage, getStatusCode } from '@/lib/errors';
import { MIN_PASSWORD_LENGTH } from '@/lib/constants';
import { AuthLayout } from '../components/AuthLayout';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
        <Card>
          <CardContent className="grid gap-4">
            <Alert>
              <CheckCircle2Icon className="text-green-600" />
              <AlertTitle>Account created</AlertTitle>
              <AlertDescription>
                An administrator must activate your account before you can log in. You will be able to log in
                as soon as it is activated.
              </AlertDescription>
            </Alert>
            <Button asChild className="w-full">
              <Link to="/login">Back to login</Link>
            </Button>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription>An administrator will activate it</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5">
            {serverError && (
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField id="username" label="First name" error={errors.username?.message}>
                <Input
                  id="username"
                  autoComplete="given-name"
                  aria-invalid={!!errors.username}
                  {...register('username', { required: 'Required', validate: (v) => !!v.trim() || 'Required' })}
                />
              </FormField>
              <FormField id="lastname" label="Last name" error={errors.lastname?.message}>
                <Input
                  id="lastname"
                  autoComplete="family-name"
                  aria-invalid={!!errors.lastname}
                  {...register('lastname', { required: 'Required', validate: (v) => !!v.trim() || 'Required' })}
                />
              </FormField>
            </div>

            <FormField id="email" label="Email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
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
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: MIN_PASSWORD_LENGTH, message: `At least ${MIN_PASSWORD_LENGTH} characters` },
                })}
              />
            </FormField>

            <FormField id="confirmPassword" label="Confirm password" error={errors.confirmPassword?.message}>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                {...register('confirmPassword', {
                  required: 'Please confirm the password',
                  validate: (v) => v === getValues('password') || 'Passwords do not match',
                })}
              />
            </FormField>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
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
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
