import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '../components/ui/primitives.jsx';
import { TextField } from '../components/ui/FormField.jsx';
import { Logo } from '../components/layout/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const STORAGE_KEYS = ['techhaven.checkout.v1', 'techhaven.cart.v1'];

function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="th-container py-14">
      <div className="mx-auto w-full max-w-md">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="th-card mt-6 p-6">
          <h1 className="font-display text-xl font-extrabold uppercase tracking-tight text-ink">{title}</h1>
          <p className="mt-1.5 text-sm text-ink-muted">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        <div className="mt-4 text-center text-sm text-ink-muted">{footer}</div>
        <p className="mt-6 flex items-start justify-center gap-2 text-center text-[11px] leading-relaxed text-ink-faint">
          <Lock className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
          Demo accounts are seeded for this deployment: admin@techhaven.dev / Admin1234! and demo@techhaven.dev /
          Demo1234!
        </p>
      </div>
    </div>
  );
}

export function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setFormError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) next.email = 'Enter a valid email address.';
    if (!form.password) next.password = 'Enter your password.';
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    setSubmitting(true);
    try {
      const account = await login({ email: form.email.trim(), password: form.password });
      try {
        STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
      } catch {
        /* storage unavailable */
      }
      toast.push({ tone: 'success', title: `Welcome back, ${account.name}`, message: 'You are signed in.' });
      navigate(location.state?.from ?? '/account', { replace: true });
    } catch (error) {
      if (error.fieldErrors) setErrors(error.fieldErrors);
      else setFormError(error.message ?? 'Could not sign you in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="Track orders, save products and check out faster."
      footer={
        <>
          New to TechHaven?{' '}
          <Link to="/signup" className="font-semibold text-brand hover:text-brand-hover">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <TextField
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={set('email')}
          error={errors.email}
          autoComplete="email"
        />
        <TextField
          label="Password"
          type="password"
          required
          value={form.password}
          onChange={set('password')}
          error={errors.password}
          autoComplete="current-password"
        />
        {formError ? (
          <p role="alert" className="rounded-md border border-sale/40 bg-sale/5 px-3.5 py-2.5 text-sm text-sale">
            {formError}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Signing in…' : 'SIGN IN'}
        </Button>
      </form>
    </AuthShell>
  );
}

export function Signup() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) next.email = 'Enter a valid email address.';
    if (form.password.length < 8) next.password = 'Use at least 8 characters.';
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    setSubmitting(true);
    try {
      const account = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      toast.push({ tone: 'success', title: `Welcome, ${account.name}`, message: 'Your account is ready.' });
      navigate(location.state?.from ?? '/account', { replace: true });
    } catch (error) {
      if (error.fieldErrors) setErrors(error.fieldErrors);
      else toast.push({ tone: 'error', title: 'Could not create account', message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create account"
      subtitle="One account for order history, saved wishlists and faster checkout."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand hover:text-brand-hover">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <TextField
          label="Full name"
          required
          value={form.name}
          onChange={set('name')}
          error={errors.name}
          autoComplete="name"
        />
        <TextField
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={set('email')}
          error={errors.email}
          autoComplete="email"
        />
        <TextField
          label="Password"
          type="password"
          required
          value={form.password}
          onChange={set('password')}
          error={errors.password}
          hint="At least 8 characters."
          autoComplete="new-password"
        />
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Creating account…' : 'CREATE ACCOUNT'}
        </Button>
      </form>
    </AuthShell>
  );
}
