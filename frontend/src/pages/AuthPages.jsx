import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ErrorMessage } from '../components/ui.jsx';

function AuthForm({ mode }) {
  const isRegister = mode === 'register';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const fieldError = (name) => error?.details?.[name];
  const set = (name) => (e) => setForm({ ...form, [name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (isRegister) await register(form);
      else await login({ email: form.email, password: form.password });
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container page narrow">
      <h1>{isRegister ? 'Create your account' : 'Log in'}</h1>
      <ErrorMessage error={error} />
      <form onSubmit={submit} className="form" noValidate>
        {isRegister && (
          <label>Full name
            <input value={form.name} onChange={set('name')} autoComplete="name" required minLength={2} maxLength={60} aria-invalid={Boolean(fieldError('name'))} />
          </label>
        )}
        <label>Email
          <input type="email" value={form.email} onChange={set('email')} autoComplete="email" required aria-invalid={Boolean(fieldError('email'))} />
        </label>
        <label>Password
          <input type="password" value={form.password} onChange={set('password')} autoComplete={isRegister ? 'new-password' : 'current-password'} required minLength={isRegister ? 8 : undefined} aria-invalid={Boolean(fieldError('password'))} />
          {isRegister && <small>At least 8 characters with a letter and a number.</small>}
        </label>
        <button className="btn" disabled={busy}>{busy ? 'Please wait...' : isRegister ? 'Sign up' : 'Log in'}</button>
      </form>
      <p>
        {isRegister ? <>Already have an account? <Link to="/login">Log in</Link></> : <>New here? <Link to="/register">Create an account</Link></>}
      </p>
    </div>
  );
}

export const Login = () => <AuthForm mode="login" />;
export const Register = () => <AuthForm mode="register" />;
