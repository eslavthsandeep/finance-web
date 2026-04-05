// src/components/Layout/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, LogOut, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard', minRole: 'analyst' },
  { to: '/records',   icon: <FileText size={18} />,        label: 'Records',   minRole: 'viewer' },
  { to: '/users',     icon: <Users size={18} />,           label: 'Users',     minRole: 'admin' },
];

const roleLevel = { viewer: 1, analyst: 2, admin: 3 };

export default function Sidebar() {
  const { user, logout, isAdmin, isAnalyst } = useAuth();

  const hasAccess = (minRole) => {
    const userLevel = roleLevel[user?.role] ?? 0;
    return userLevel >= (roleLevel[minRole] ?? 99);
  };

  return (
    <aside style={{
      width: 240, minHeight: '100vh',
      background: 'var(--ink)',
      display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0, alignSelf: 'flex-start', height: '100vh',
    }}>
      {/* Brand */}
      <div style={{ padding: '28px 24px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--violet), var(--rose))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <TrendingUp size={18} color="#fff" />
          </div>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: '1.1rem', color: '#fff', letterSpacing: '-.01em',
          }}>FinanceOS</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 12px' }}>
        <div style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(255,255,255,.35)', padding: '8px 12px', marginBottom: 4 }}>
          Menu
        </div>
        {navItems.filter((n) => hasAccess(n.minRole)).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 11,
              padding: '10px 12px', borderRadius: 'var(--r-sm)',
              textDecoration: 'none', marginBottom: 3,
              fontWeight: 600, fontSize: '.875rem',
              color: isActive ? '#fff' : 'rgba(255,255,255,.55)',
              background: isActive ? 'rgba(124,58,237,.6)' : 'transparent',
              transition: 'all .15s',
            })}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--violet-light), var(--rose-light))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '.9rem', color: '#fff',
            flexShrink: 0,
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: '.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ color: 'rgba(255,255,255,.45)', fontSize: '.72rem', textTransform: 'capitalize' }}>
              {user?.role}
            </div>
          </div>
          <button
            onClick={logout}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.45)', padding: 4, borderRadius: 6, transition: 'color .15s' }}
            title="Logout"
            onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,.45)'}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
