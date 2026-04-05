// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/UI';

const DEMO_USERS = [
  { label: 'Admin',   email: 'admin@finance.dev',   role: 'admin'   },
  { label: 'Analyst', email: 'analyst@finance.dev', role: 'analyst' },
  { label: 'Viewer',  email: 'viewer@finance.dev',  role: 'viewer'  },
];

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'viewer' ? '/records' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email) => {
    setForm({ email, password: 'Password123!' });
    setError('');
  };

  return (
    <div className="login-page">
      {/* Left panel */}
      <div className="login-left">
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'rgba(255,255,255,.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <TrendingUp size={24} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: '#fff' }}>
              FinanceOS
            </span>
          </div>

          <h1 className="login-brand">Your financial data,<br />under control.</h1>
          <p className="login-tagline">
            Track income, expenses and trends across your organisation with fine-grained role-based access control.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 40 }}>
            {['Role-based access', 'Real-time analytics', 'Audit trail', 'Secure JWT auth'].map((f) => (
              <span key={f} style={{
                background: 'rgba(255,255,255,.15)', color: '#fff',
                borderRadius: 99, padding: '6px 14px', fontSize: '.78rem', fontWeight: 600,
              }}>{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="login-right">
        <div className="login-box">
          <h2 className="login-title">Welcome back</h2>
          <p className="login-sub">Sign in to your account to continue</p>

          {/* Demo quick-fill */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
              Quick demo login
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {DEMO_USERS.map((u) => (
                <button
                  key={u.role}
                  className="btn btn-ghost btn-sm"
                  onClick={() => fillDemo(u.email)}
                  type="button"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', marginBottom: 24 }} />

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email" name="email"
                value={form.email} onChange={handleChange}
                placeholder="admin@finance.dev"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPw ? 'text' : 'password'} name="password"
                  value={form.password} onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ paddingRight: 42 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0,
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                background: 'var(--rose-dim)', color: '#9F1239', borderRadius: 'var(--r-sm)',
                padding: '10px 14px', fontSize: '.85rem', fontWeight: 500,
              }}>
                {error}
              </div>
            )}

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ justifyContent: 'center', padding: '13px' }}>
              {loading ? <Spinner /> : <><span>Sign in</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ marginTop: 24, fontSize: '.78rem', color: 'var(--muted)', textAlign: 'center' }}>
            Demo password for all accounts: <strong>Password123!</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
