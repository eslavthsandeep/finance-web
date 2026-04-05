// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Layout/Sidebar';
import Login     from './pages/Login';
import Dashboard from './pages/Dashboard';
import Records   from './pages/Records';
import Users     from './pages/Users';
import { PageLoader } from './components/UI';

// ── Layout shell (sidebar + content) ─────────────────────────────────────────
function AppShell({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <div className="page-body">{children}</div>
      </div>
    </div>
  );
}

// ── Protected route ───────────────────────────────────────────────────────────
function Protected({ children, minRole }) {
  const { user, loading } = useAuth();
  const roleLevel = { viewer: 1, analyst: 2, admin: 3 };

  if (loading) return <PageLoader />;
  if (!user)   return <Navigate to="/login" replace />;

  if (minRole) {
    const userLvl = roleLevel[user.role] ?? 0;
    const minLvl  = roleLevel[minRole]   ?? 99;
    if (userLvl < minLvl) {
      return (
        <AppShell>
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🔒</div>
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>Access Denied</h2>
            <p style={{ color: 'var(--muted)' }}>
              This page requires <strong>{minRole}</strong> access.<br />
              Your current role is <strong>{user.role}</strong>.
            </p>
          </div>
        </AppShell>
      );
    }
  }

  return <AppShell>{children}</AppShell>;
}

// ── Public route (redirect if already logged in) ──────────────────────────────
function Public({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user)    return <Navigate to={user.role === 'viewer' ? '/records' : '/dashboard'} replace />;
  return children;
}

// ── Root ──────────────────────────────────────────────────────────────────────
function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<Public><Login /></Public>} />

      <Route path="/dashboard" element={
        <Protected minRole="analyst"><Dashboard /></Protected>
      } />
      <Route path="/records" element={
        <Protected minRole="viewer"><Records /></Protected>
      } />
      <Route path="/users" element={
        <Protected minRole="admin"><Users /></Protected>
      } />

      {/* Default redirect */}
      <Route path="*" element={
        user
          ? <Navigate to={user.role === 'viewer' ? '/records' : '/dashboard'} replace />
          : <Navigate to="/login" replace />
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
