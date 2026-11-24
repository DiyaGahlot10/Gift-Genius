import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Gift, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import usePageTitle from '../hooks/usePageTitle.js';

const EMAIL_RX = /^\S+@\S+\.\S+$/;

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-plum-700">{label}</span>
      {children}
      {error && (
        <span role="alert" className="mt-1 block text-xs font-medium text-rose-600">
          {error}
        </span>
      )}
    </label>
  );
}

function PasswordInput({ value, onChange, error, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className={`input !pr-12 ${error ? '!border-rose-400' : ''}`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink/50 hover:text-plum-600"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="card w-full max-w-md p-8 sm:p-10">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-plum-600 text-white">
            <Gift className="h-6 w-6" />
          </div>
          <h1 className="text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-ink/60">{subtitle}</p>
        </div>
        {children}
        <p className="mt-6 text-center text-sm text-ink/70">{footer}</p>
      </div>
    </div>
  );
}

// Where to go after logging in (the page that sent the visitor here, or home).
const useReturnTo = () => {
  const location = useLocation();
  return location.state?.from || '/';
};

export function Login() {
  usePageTitle('Log in');
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const returnTo = useReturnTo();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={returnTo} replace />;

  const submit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!EMAIL_RX.test(form.email.trim())) found.email = 'Enter a valid email address';
    if (!form.password) found.password = 'Enter your password';
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      const u = await login(form.email.trim(), form.password);
      toast.success(`Welcome back, ${u.name.split(' ')[0]}!`);
      navigate(returnTo, { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to check out and see your orders."
      footer={
        <>
          New to GiftGenius?{' '}
          <Link to="/register" state={{ from: returnTo }} className="font-semibold text-plum-600 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        <Field label="Email" error={errors.email}>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            autoComplete="email"
            className={`input ${errors.email ? '!border-rose-400' : ''}`}
          />
        </Field>
        <Field label="Password" error={errors.password}>
          <PasswordInput
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
            autoComplete="current-password"
          />
        </Field>
        <button type="submit" disabled={busy} className="btn-primary w-full !py-3.5">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Log in
        </button>
      </form>
    </AuthShell>
  );
}

export function Register() {
  usePageTitle('Create account');
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const returnTo = useReturnTo();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={returnTo} replace />;

  const submit = async (e) => {
    e.preventDefault();
    const found = {};
    if (form.name.trim().length < 2) found.name = 'Please enter your name';
    if (!EMAIL_RX.test(form.email.trim())) found.email = 'Enter a valid email address';
    if (form.password.length < 8) found.password = 'Use at least 8 characters';
    else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) found.password = 'Include at least one letter and one number';
    if (form.confirm !== form.password) found.confirm = 'Passwords do not match';
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      const u = await register(form.name.trim(), form.email.trim(), form.password);
      toast.success(`Welcome to GiftGenius, ${u.name.split(' ')[0]}!`);
      navigate(returnTo, { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Save your cart, wishlist and orders."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" state={{ from: returnTo }} className="font-semibold text-plum-600 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        <Field label="Name" error={errors.name}>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" className={`input ${errors.name ? '!border-rose-400' : ''}`} />
        </Field>
        <Field label="Email" error={errors.email}>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" className={`input ${errors.email ? '!border-rose-400' : ''}`} />
        </Field>
        <Field label="Password" error={errors.password}>
          <PasswordInput value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} autoComplete="new-password" />
        </Field>
        <Field label="Confirm password" error={errors.confirm}>
          <PasswordInput value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} error={errors.confirm} autoComplete="new-password" />
        </Field>
        <button type="submit" disabled={busy} className="btn-primary w-full !py-3.5">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Create account
        </button>
      </form>
    </AuthShell>
  );
}
